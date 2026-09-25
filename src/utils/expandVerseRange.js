/**
 * Expand a verse label into every verse it covers.
 * A label is either a single verse ("6") or a verse span from a bridged \v marker ("11-13").
 * A span covers every verse from its first to its last, so "11-13" includes verse 12.
 * Anything that is not a numeric span (e.g. "front") is returned as-is.
 * @param {string|number} label - The verse label.
 * @returns {string[]} The verses covered, e.g. ["11", "12", "13"].
 */
export function expandVerseRange(label) {
  const [first, last] = String(label).split('-');
  const start = parseInt(first, 10);
  const end = parseInt(last, 10);
  if (last === undefined || isNaN(start) || isNaN(end) || end < start) {
    return [String(label)];
  }
  const verses = [];
  for (let verse = start; verse <= end; verse++) {
    verses.push(String(verse));
  }
  return verses;
}
