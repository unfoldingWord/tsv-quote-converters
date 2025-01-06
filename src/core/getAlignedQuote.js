/**
 * Gets the target quote to from the given quote based on alignment scopes
 * @param {Array} sourceVerseObjects - Array of verse objects from the source language
 * @param {Array} targetVerseObjects - Array of verse objects from target language
 * @param {string} sourceQuote - quote from the source language to convert to a target quote (groups separated by ' & ')
 * @param {number} sourceFirstGroupOccurrence - occurrence of the first group in the quote (groups separated by ` & `) in the source verse
 * @returns {string} Corresponding target quote separated by ' & ' if multiple groups
 */
export function getAlignedQuote(sourceTokens, targetTokens, sourceQuote, sourceFirstGroupOccurrence = 1) {
  let targetOccurrence = 0;
  // Split the quote into groups of words
  const wordGroups = sourceQuote.split(' & ').map((group) => group.split(/[\s\p{P}\p{S}]+/u).filter((word) => word !== ''));
  // console.log(wordGroups);
  // Find the specific occurrence for each group, ensuring sequential order
  const sourceMatches = [];
  let searchStartIndex = 0;

  for (const groupIdx in wordGroups) {
    const group = wordGroups[groupIdx];
    const groupOccurrence = groupIdx == 0 ? sourceFirstGroupOccurrence : 1;
    // console.log(groupIdx, occurrence, groupOccurrence)
    let currentOccurrence = 0;
    let currentIndex = searchStartIndex;
    let found = false;

    // console.log(`Searching for group: ${group} from position ${currentIndex} for occurrence ${groupOccurrence}`);
    while (currentIndex < sourceTokens.length) {
      // console.log(`findConsecutiveWords: ${group}, ${currentIndex}`);
      const match = findConsecutiveTokens(sourceTokens, group, currentIndex);
      if (match) {
        currentOccurrence++;
        // console.log(`currentOccurrence: ${currentOccurrence}`);
        // console.log(`groupOccurrence: ${groupOccurrence}`);
        if (currentOccurrence === groupOccurrence) {
          sourceMatches.push(match.tokens);
          searchStartIndex = match.endIndex;
          found = true;
          // console.log(`Found group: ${group} at position ${currentIndex}`);
          break;
        }
        currentIndex = match.endIndex;
      } else {
        currentIndex++;
      }
    }

    if (!found) {
      throw new Error(`Occurrence ${sourceFirstGroupOccurrence} not found for "${group}" after position ${searchStartIndex}`);
    }
  }

  // console.log(JSON.stringify(targetMatches, null, 2));

  const sourceScopes = sourceMatches.map((tokens) => tokens.map(token => token.scopes || []).flat()).flat(); // This may be an empty array if source is Greek or Hebrew

  // console.log(flattenedArray);

  let targetGroups = [];
  const wordOccurrences = {};
  let currentString = '';
  let otherText = '';
  let firstGroupOccurrence = 1;

  for(let idx = 0; idx < targetTokens.length; idx++) {
    const targetToken = targetTokens[idx];
    // console.log(idx, token);
    if (targetToken.subType === 'wordLike') {
      if (!wordOccurrences[targetToken.payload]) {
        wordOccurrences[targetToken.payload] = 0;
      }
      wordOccurrences[targetToken.payload]++;
      const occurrence = wordOccurrences[targetToken.payload];
      targetToken.occurrence = occurrence;

      let targetIsMatch = false;
      if (sourceScopes.length > 0) {
        for (const scope of sourceScopes) {
          if (scope.includes(`/${targetToken.payload}:${occurrence}:`)) {
            targetIsMatch = true;
            break;
          }
        }
      } else {
        for (const sourceMatch of sourceMatches.flat()) {
          for (const scope of targetToken.scopes) {
            if (scope.includes(`/${sourceMatch.payload}:${sourceMatch.occurrence}:`)) {
              targetIsMatch = true;
              break;
            }
          }
          if (targetIsMatch) {
            break;
          }
        }
      }

      if (targetIsMatch) {
        if (!currentString && targetGroups.length == 0) {
          firstGroupOccurrence = occurrence;
        }
        if (currentString) {
          if (otherText) {
            currentString += otherText.replace(/\n+/, " ").replace(/\s+/g, " ");
            otherText = '';
          }
          if(targetGroups.length == 0) {
            firstGroupOccurrence = 1;
          }
        }
        currentString += targetToken.payload;
      } else if (currentString) {
        // console.log("PUSHING", currentString);
        targetGroups.push(currentString);
        currentString = '';
        otherText = '';
      }
    } else {
      if (currentString) {
        otherText += targetToken.payload;
      }
    }
  }
  if (currentString) {
    targetGroups.push(currentString);
  }

  // console.log(targetGroups, firstGroupOccurrence);
  return { quote: targetGroups.join(' & '), occurrence: firstGroupOccurrence };
}

/**
 * Helper function to find consecutive words in tokens
 * @param {Array} tokens - Array of verse objects
 * @param {Array} words - Array of words (string) to find consecutively
 * @param {number} startIndex - Index to start searching from in the verse objects
 * @returns {Object|null} Match object with tokens and endIndex, or null if no match
 */
function findConsecutiveTokens(tokens, words, startIndex) {
  let tokenIndex = startIndex;
  let wordIndex = 0;
  let matchedTokens = [];

  const wordOccurrences = {};
  for(let i = 0; i < startIndex; i++) {
    if (tokens[i].subType === 'wordLike' && !wordOccurrences[tokens[i].payload]) {
      wordOccurrences[tokens[i].payload] = 0;
    }
    wordOccurrences[tokens[i].payload]++;
    tokens[i].occurrence = wordOccurrences[tokens[i].payload];
  }

  while (tokenIndex < tokens.length && wordIndex < words.length) {
    const token = tokens[tokenIndex];
    if (token.subType === "wordLike" && !wordOccurrences[token.payload]) {
      wordOccurrences[token.payload] = 0;
    }
    wordOccurrences[token.payload]++;
    token.occurrence = wordOccurrences[token.payload];
    
    const word = words[wordIndex];
    // console.log(tokenIndex, token, wordIndex, word);
    if (token.subType != 'wordLike') {
      tokenIndex++;
      // console.log("not wordLike subType: |"+token.subType+"|");
      continue;
    }
    // console.log("have wordLike payload: |"+token.payload+"| Word: |"+word+"|");
    if (token.payload.toLowerCase() != word.toLowerCase()) {
      break;
    }
    // console.log("MATCH!");
    matchedTokens.push(token);
    wordIndex++;
    tokenIndex++;
  }

  if (wordIndex >= words.length) {
    return {
      tokens: matchedTokens,
      endIndex: tokenIndex,
    };
  }
  return null;
}