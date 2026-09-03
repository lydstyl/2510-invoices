import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from '../../../src/ui/lib/clipboard';

// happy-dom ne implémente pas document.execCommand (API obsolète retirée des
// DOM récents) : on le polyfill via un mock contrôlé, qu'on définit/défini
// proprement autour de chaque test.
type ExecCommandMock = ReturnType<typeof vi.fn>;

function defineExecCommand(impl: ExecCommandMock) {
  (document as unknown as Record<string, unknown>).execCommand = impl;
}

function deleteExecCommand() {
  delete (document as unknown as Record<string, unknown>).execCommand;
}

describe('copyToClipboard', () => {
  let originalSecureContext: boolean;
  let originalNavigatorClipboard: unknown;

  beforeEach(() => {
    originalSecureContext = window.isSecureContext;
    originalNavigatorClipboard = (navigator as unknown as Record<string, unknown>)
      .clipboard;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Restaurer l'environnement entre chaque test
    Object.defineProperty(window, 'isSecureContext', {
      value: originalSecureContext,
      configurable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: originalNavigatorClipboard,
      configurable: true,
    });
    deleteExecCommand();
  });

  it('should return true when navigator.clipboard.writeText succeeds (secure context)', async () => {
    const mockText = 'facture-001.description.90E00';

    // Simuler un contexte sécurisé
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    const result = await copyToClipboard(mockText);

    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(mockText);
  });

  it('should use fallback textarea when secure context clipboard is rejected', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    const mockWriteText = vi
      .fn()
      .mockRejectedValue(new DOMException('Permission denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    const mockExecCommand = vi.fn().mockReturnValue(true);
    defineExecCommand(mockExecCommand);

    const result = await copyToClipboard('test-text');

    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalled();
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
  });

  it('should use fallback textarea when not in secure context', async () => {
    // Contexte non sécurisé + pas de navigator.clipboard → fallback direct
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    const mockExecCommand = vi.fn().mockReturnValue(true);
    defineExecCommand(mockExecCommand);

    const testValue = 'reference-de-virement SCI LOGIS ANGE';
    const result = await copyToClipboard(testValue);

    expect(result).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    // Le textarea offscreen a été créé puis nettoyé (plus rien dans le DOM)
    const textareas = document.querySelectorAll('textarea');
    expect(textareas.length).toBe(0);
  });

  it('should return false when both secure and fallback paths fail', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipbord error')),
      },
      configurable: true,
    });

    // Fallback : execCommand retourne false (copie refusée par le navigateur)
    defineExecCommand(vi.fn().mockReturnValue(false));

    const result = await copyToClipboard('texte');

    expect(result).toBe(false);
  });

  it('should return false when fallback throws (no document access)', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    defineExecCommand(
      vi.fn().mockImplementation(() => {
        throw new Error('No permission');
      })
    );

    const result = await copyToClipboard('texte');

    expect(result).toBe(false);
  });

  it('should handle empty string correctly (secure path)', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    const result = await copyToClipboard('');

    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('');
  });

  it('should handle unicode characters via fallback path', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      configurable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    const mockExecCommand = vi.fn().mockReturnValue(true);
    defineExecCommand(mockExecCommand);

    const unicodeText =
      'référence virement : FACTURE 2024-001_édition spéciale';
    const result = await copyToClipboard(unicodeText);

    expect(result).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
  });
});
