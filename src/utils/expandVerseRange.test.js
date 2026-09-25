import { expandVerseRange } from './expandVerseRange.js';

/**
 * A bridged \v marker (e.g. `\v 11-13`) covers every verse in the span, not just its
 * first and last, so a reference to a middle verse (JDG 2:12) must find the span.
 */
describe('expandVerseRange', () => {
  test('returns a single verse as-is', () => {
    expect(expandVerseRange('6')).toEqual(['6']);
    expect(expandVerseRange(6)).toEqual(['6']);
  });

  test('expands a two-verse span', () => {
    // DAN 9:20-21 in the UST
    expect(expandVerseRange('20-21')).toEqual(['20', '21']);
  });

  test('includes the middle verses of a longer span', () => {
    // JDG 2:11-13 and 1CH 4:34-38 in the UST
    expect(expandVerseRange('11-13')).toEqual(['11', '12', '13']);
    expect(expandVerseRange('34-38')).toEqual(['34', '35', '36', '37', '38']);
  });

  test('leaves labels that are not numeric spans alone', () => {
    expect(expandVerseRange('front')).toEqual(['front']);
    expect(expandVerseRange('7-5')).toEqual(['7-5']);
  });
});
