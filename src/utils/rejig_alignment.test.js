import { rejigAlignment, getAlignedRef } from './rejig_alignment.js';

/**
 * rejigAlignment folds a \zaln-s milestone's word, occurrence and occurrences into one x-align
 * attribute. In a verse bridge the milestone's x-ref (which verse the word is from) is folded in
 * too, so each nested milestone keeps its own verse.
 */
describe('rejigAlignment', () => {
  test('folds the word, occurrence and occurrences into x-align', () => {
    expect(rejigAlignment('\\zaln-s |x-strong="H3068" x-occurrence="1" x-occurrences="2" x-content="יְהוָ֣ה"\\*')).toBe(
      '\\zaln-s |x-strong="H3068" x-align="יְהוָ֣ה:1:2"\\*'
    );
  });

  test('keeps the x-ref of a word in a verse bridge', () => {
    // DAN 9:20-21 in the UST
    expect(
      rejigAlignment('\\zaln-s |x-strong="c:H6419" x-occurrence="1" x-occurrences="1" x-content="וּ⁠מִתְפַּלֵּ֔ל" x-ref="9:20"\\*')
    ).toBe('\\zaln-s |x-strong="c:H6419" x-align="וּ⁠מִתְפַּלֵּ֔ל:1:1:9:20"\\*');
  });
});

describe('getAlignedRef', () => {
  test('reads the x-ref from an x-align scope', () => {
    expect(getAlignedRef('attribute/milestone/zaln/x-align/0/אֶת:1:2:2:12')).toEqual({ chapter: '2', verse: '12' });
  });

  test('returns null when the alignment has no x-ref', () => {
    expect(getAlignedRef('attribute/milestone/zaln/x-align/0/אֶת:1:2')).toBeNull();
  });
});
