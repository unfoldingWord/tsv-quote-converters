import { dropUnbalancedBraces } from './dropUnbalancedBraces.js';

/**
 * ULT/UST mark supplied words with {curly braces}. A quote covers only the words
 * the alignment matched, so a brace group reaching outside it leaves an orphan.
 * Complete pairs are kept; orphans are removed, never completed.
 */
describe('dropUnbalancedBraces', () => {
  test('removes an opening brace that is never closed', () => {
    // Matthew 5:3 is written `[Blessed] {[are]}` — the quote takes the { but not the }.
    expect(dropUnbalancedBraces('Blessed {are')).toBe('Blessed are');
    expect(dropUnbalancedBraces('of Abraham{, the ancestor of all Jewish people')).toBe(
      'of Abraham, the ancestor of all Jewish people'
    );
  });

  test('removes a closing brace that was never opened', () => {
    expect(dropUnbalancedBraces('a man named} Joseph')).toBe('a man named Joseph');
  });

  test('keeps a complete pair', () => {
    expect(dropUnbalancedBraces('of {King} David')).toBe('of {King} David');
    expect(dropUnbalancedBraces('James the {son} of Alphaeus')).toBe('James the {son} of Alphaeus');
  });

  test('keeps complete pairs while dropping an orphan in the same quote', () => {
    expect(dropUnbalancedBraces('the {wicked} people {who lived there')).toBe(
      'the {wicked} people who lived there'
    );
  });

  test('removes both braces when a quote closes one group and opens another', () => {
    expect(dropUnbalancedBraces('I invite} those who have sinned {to come to me')).toBe(
      'I invite those who have sinned to come to me'
    );
  });

  test('tidies the space a removed brace leaves behind', () => {
    expect(dropUnbalancedBraces('} some scholars')).toBe('some scholars');
    expect(dropUnbalancedBraces('the word { and more')).toBe('the word and more');
  });

  test('leaves quotes without braces untouched', () => {
    expect(dropUnbalancedBraces('Do not commit adultery')).toBe('Do not commit adultery');
    expect(dropUnbalancedBraces('')).toBe('');
  });

  test('handles nested pairs', () => {
    expect(dropUnbalancedBraces('a {b {c} d} e')).toBe('a {b {c} d} e');
    expect(dropUnbalancedBraces('a {b {c} d e')).toBe('a b {c} d e');
  });

  test('passes through non-strings', () => {
    expect(dropUnbalancedBraces(undefined)).toBeUndefined();
    expect(dropUnbalancedBraces(null)).toBeNull();
  });
});
