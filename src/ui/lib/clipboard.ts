/**
 * Copie du texte dans le presse-papiers.
 *
 * Sur HTTP non sécurisé (réseau local), navigator.clipboard n'est pas
 * disponible (window.isSecureContext === false) : on retombe alors sur un
 * textarea offscreen + document.execCommand('copy').
 *
 * @returns true si la copie a réussi, false sinon.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback ci-dessous (ex: permission refusée)
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Textarea offscreen : fixed évite de scroller la page, opacity 0 masque
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
