import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ExtractedInvoiceData } from '@/src/domain/entities/ExtractedInvoiceData';
import { PaymentStatus } from '@/src/domain/entities/Invoice';
import {
  IExtractionService,
  ExtractionOptions,
} from '@/src/domain/interfaces/IExtractionService';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterExtractionService implements IExtractionService {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    apiKey: string,
    model?: string
  ) {
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is required');
    }
    this.apiKey = apiKey;
    this.model = model || process.env.EXTRACTION_MODEL || 'openai/gpt-4o-mini';
  }

  async extract(
    filePath: string,
    mimeType: string,
    options: ExtractionOptions
  ): Promise<ExtractedInvoiceData> {
    // 1. Convert to image if PDF
    const imagePath = await this.prepareImage(filePath, mimeType);

    // 2. Read and base64-encode the image
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Debug logging
    const imageSizeKb = Math.round(imageBuffer.length / 1024);
    console.log(`[OpenRouterExtraction] Image: ${imagePath}, format: ${mimeType}, size: ${imageSizeKb}KB, base64: ${Math.round(base64Image.length / 1024)}KB`);

    // Save a debug copy
    const debugDir = path.join(process.cwd(), 'public', 'uploads', 'debug');
    await fs.mkdir(debugDir, { recursive: true }).catch(() => {});
    const debugPath = path.join(debugDir, `extract-${Date.now()}.png`);
    await fs.writeFile(debugPath, imageBuffer).catch(() => {});
    console.log(`[OpenRouterExtraction] Debug image saved: ${debugPath}`);

    // 3. Build the prompt
    const prompt = this.buildPrompt(options);

    // 4. Call OpenRouter
    const result = await this.callOpenRouter(base64Image, prompt);

    // 5. Clean up temp file if we created one
    if (imagePath !== filePath) {
      await fs.unlink(imagePath).catch(() => {});
    }

    return result;
  }

  private async prepareImage(
    filePath: string,
    mimeType: string
  ): Promise<string> {
    if (mimeType === 'application/pdf') {
      // Convert first page of PDF to PNG using pdftoppm
      const tmpDir = os.tmpdir();
      const tmpPrefix = `invoice-${Date.now()}`;
      const outputPrefix = path.join(tmpDir, tmpPrefix);

      execSync(`pdftoppm -png -f 1 -l 1 -r 300 "${filePath}" "${outputPrefix}"`, {
        stdio: 'pipe',
        timeout: 30000,
      });

      // pdftoppm creates <prefix>-<page>.png
      const convertedPath = `${outputPrefix}-1.png`;

      // Verify it was created
      await fs.access(convertedPath);
      return convertedPath;
    }

    // Already an image
    return filePath;
  }

  private buildPrompt(options: ExtractionOptions): string {
    const suppliersList = options.knownSuppliers.length > 0
      ? `\nFournisseurs existants : ${options.knownSuppliers.join(', ')}`
      : '';

    const categoriesList = options.knownCategories.length > 0
      ? `\nCatégories existantes : ${options.knownCategories.join(', ')}`
      : '';

    return `Tu es un assistant spécialisé dans l'extraction de données de factures françaises.

Analyse cette facture/image et extrait les informations suivantes au format JSON UNIQUEMENT (sans texte supplémentaire, sans markdown, sans balises de code) :

{
  "date": "AAAA-MM-JJ",
  "supplierName": "nom exact du fournisseur (raison sociale)",
  "invoiceNumber": "numéro de facture (référence sur le document)",
  "description": "courte description de l'objet de la facture (max 60 caractères)",
  "amount": 123.45,
  "paymentStatus": "NOT_PAID | PAID | PARTIALLY_PAID",
  "categoryName": "nom de la catégorie correspondant au contenu"
}

Règles importantes :
- La date est celle d'émission de la facture (pas la date d'échéance)
- Le montant est le montant TTC (toutes taxes comprises) en euros
- Pour paymentStatus : NOT_PAID si c'est une facture à payer, PAID si acquittée/payée, PARTIALLY_PAID si acompte
- Description doit être courte et précise (ex: "réparation plomberie" ou "fourniture bureau")
- categoryName doit correspondre à une catégorie existante si possible${suppliersList}${categoriesList}
- supplierName doit correspondre à un fournisseur existant si possible
- Si un champ ne peut pas être déterminé, mets une chaîne vide pour les textes, 0 pour le montant, "NOT_PAID" pour le statut`;
  }

  private async callOpenRouter(
    base64Image: string,
    prompt: string
  ): Promise<ExtractedInvoiceData> {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/lydstyl/2510-invoices',
          'X-Title': '2510-invoices',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 2048,
          temperature: 0.05,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenRouter returned empty response');
    }

    console.log(`[OpenRouterExtraction] Raw LLM response (${content.length} chars): ${content.slice(0, 500)}`);

    return this.parseResponse(content);
  }

  private parseResponse(content: string): ExtractedInvoiceData {
    // Strip markdown code blocks if present
    let json = content.trim();
    if (json.startsWith('```')) {
      json = json.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Try to extract JSON object from any surrounding text
    const startIdx = json.indexOf('{');
    const endIdx = json.lastIndexOf('}');
    if (startIdx !== -1 && endIdx > startIdx) {
      json = json.substring(startIdx, endIdx + 1);
    }

    // Try parsing - with aggressive cleanup
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json);
    } catch {
      // Aggressive cleanup: remove invalid control characters
      json = json
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')  // remove control chars
        .replace(/\\(?!["\\/bfnrtu])/g, '')            // remove bad escapes
        .replace(/\s+/g, ' ')                           // collapse whitespace
        .replace(/,(\s*[}\]])/g, '$1');                 // trailing commas

      try {
        parsed = JSON.parse(json);
      } catch {
        // Last resort: try to extract key-value pairs with regex
        const date = json.match(/"date"\s*:\s*"([^"]*)"/)?.[1] || '';
        const supplierName = json.match(/"supplierName"\s*:\s*"([^"]*)"/)?.[1] || '';
        const invoiceNumber = json.match(/"invoiceNumber"\s*:\s*"([^"]*)"/)?.[1] || '';
        const description = json.match(/"description"\s*:\s*"([^"]*)"/)?.[1] || '';
        const amount = parseFloat(json.match(/"amount"\s*:\s*([0-9.]+)/)?.[1] || '0');
        const paymentStatus = json.match(/"paymentStatus"\s*:\s*"([^"]*)"/)?.[1]?.toUpperCase() || 'NOT_PAID';
        const categoryName = json.match(/"categoryName"\s*:\s*"([^"]*)"/)?.[1] || '';

        return {
          date,
          supplierName,
          invoiceNumber,
          description,
          amount: isNaN(amount) ? 0 : amount,
          paymentStatus: paymentStatus === 'PAID' ? PaymentStatus.PAID
            : paymentStatus === 'PARTIALLY_PAID' ? PaymentStatus.PARTIALLY_PAID
            : PaymentStatus.NOT_PAID,
          categoryName: categoryName || undefined,
        };
      }
    }

    // Validate and normalize
    const amount = typeof parsed.amount === 'number' ? parsed.amount : parseFloat(String(parsed.amount)) || 0;

    let paymentStatus = PaymentStatus.NOT_PAID;
    const rawStatus = String(parsed.paymentStatus || '').toUpperCase();
    if (rawStatus === 'PAID') {
      paymentStatus = PaymentStatus.PAID;
    } else if (rawStatus === 'PARTIALLY_PAID') {
      paymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    return {
      date: String(parsed.date || ''),
      supplierName: String(parsed.supplierName || ''),
      invoiceNumber: String(parsed.invoiceNumber || ''),
      description: String(parsed.description || ''),
      amount,
      paymentStatus,
      categoryName: parsed.categoryName ? String(parsed.categoryName) : undefined,
    };
  }
}
