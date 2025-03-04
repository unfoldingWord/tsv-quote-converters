import { tokenize, tokenizeOrigLang } from 'string-punctuation-tokenizer';

/**
 * Finds the occurrence of a phrase in a sentence given the occurrence of the starter word.
 * @param {Object} params - The parameters for the function.
 * @param {string} params.sentence - The sentence to search in.
 * @param {string} params.phrase - The phrase to search for.
 * @param {string} params.starterWord - The starter word of the phrase.
 * @param {number} params.firstTokenOccurrence - The occurrence of the starter word in the sentence.
 * @param {boolean} [params.isOrigLang=false] - Flag indicating if the sentence is in the original language to know how to tokenize.
 */
export function findPhraseOccurrenceInSentence({ sentence, phrase, firstWordOccurrence, isOrigLang = false }) {
  let tokenizeFunctionToUse = tokenize;
  if (isOrigLang) {
    tokenizeFunctionToUse = tokenizeOrigLang;
  }
  const phraseTokens = tokenizeFunctionToUse({
    text: phrase,
    includePunctuation: false,
    normalize: true,
  });
  const firstWord = phraseTokens[0];
  const sentenceTokens = tokenizeFunctionToUse({
    text: sentence,
    includePunctuation: false,
    normalize: true,
  });

  const occurrencesMap = {};
  let phraseOccurrence = 0;
  let starterWordOccurrence = 0;

  for (let i = 0; i < sentenceTokens.length; i++) {
    if (sentenceTokens[i] === firstWord) {
      starterWordOccurrence++;
    }

    if (sentenceTokens.slice(i, i + phraseTokens.length).join(' ') === phraseTokens.join(' ')) {
      phraseOccurrence++;
      occurrencesMap[starterWordOccurrence] = phraseOccurrence;
    }
  }

  return occurrencesMap[firstWordOccurrence];
}
