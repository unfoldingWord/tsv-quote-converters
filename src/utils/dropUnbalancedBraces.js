/**
 * Drop unbalanced curly braces from a reconstructed quote.
 *
 * ULT/UST wrap words supplied by the translator in {curly braces}. Those braces
 * are plain text sitting outside the \zaln alignment milestones, so a quote built
 * from the aligned words alone can pick up one half of a pair: Matthew 5:3 is
 * written `[Blessed] {[are]}`, and a quote covering both words takes the opening
 * brace that sits between them but not the closing one that follows them, giving
 * "Blessed {are".
 *
 * Complete pairs are kept — they mark something the quote wholly contains, as in
 * "of {King} David". Orphans are dropped rather than completed, because where the
 * group actually began or ended lies outside the quote and cannot be recovered
 * from it; closing "a man named} Joseph" into "{a man named} Joseph" would claim a
 * starting point the alignment never gave.
 *
 * @param {string} text - A single quote group (no ` & ` separators)
 * @returns {string} The group with unmatched braces removed
 */
export function dropUnbalancedBraces(text) {
  if (typeof text !== 'string' || (!text.includes('{') && !text.includes('}'))) {
    return text;
  }

  const drop = new Set();
  const opened = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '{') {
      opened.push(i);
    } else if (char === '}') {
      // A closer with nothing open began before this quote.
      if (opened.length) opened.pop();
      else drop.add(i);
    }
  }
  // Anything still open is never closed within this quote.
  for (const i of opened) drop.add(i);

  if (drop.size === 0) return text;

  let out = '';
  for (let i = 0; i < text.length; i++) {
    if (!drop.has(i)) out += text[i];
  }
  // A removed brace can leave a doubled space where it stood between two words.
  return out.replace(/ {2,}/g, ' ').trim();
}
