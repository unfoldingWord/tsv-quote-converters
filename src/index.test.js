// index.test.js
import ConvertULTQuotesToOLQuotes from './index';

test('ConvertULTQuotesToOLQuotes with book "jdg" and provided tsvContent', () => {
  const book = 'jdg';
  const tsvContent = `
  15:1	k3p9		rc://*/ta/man/translate/writing-newevent	And it happened	1	The author is using this phrase to introduce a new event in the story. Use a word, phrase, or other method in your language that is natural for introducing a new event.
  15:1	m2q4		rc://*/ta/man/translate/figs-metonymy	in the days of	1	The author is using the word **days** by association to mean ”time.” Alternate translation: “at the time of”
  `;

  const result = ConvertULTQuotesToOLQuotes(book, tsvContent);

  // Add your expected output here
  const expectedOutput = {
    output: '', // Replace with expected output
    errors: ''  // Replace with expected errors
  };

  expect(result).toEqual(expectedOutput);
});
