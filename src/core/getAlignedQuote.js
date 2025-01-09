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
  const wordGroups = sourceQuote.split(/ *& */).map((group) =>
    group
      .replaceAll('\\n', ' ')
      .split(/[\s\p{P}\p{S}]+/u)
      .filter((word) => word !== '')
  );
  // Find the specific occurrence for each group, ensuring sequential order
  const sourceMatches = [];
  let currentIndex = 0;

  for (let groupIdx = 0; groupIdx < wordGroups.length; groupIdx++) {
    const group = wordGroups[groupIdx];
    const groupOccurrence = sourceFirstGroupOccurrence === -1 || groupIdx !== 0 ? 1 : sourceFirstGroupOccurrence;
    // console.log(groupIdx, occurrence, groupOccurrence)
    let currentOccurrence = 0;
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
          currentIndex = match.endIndex;
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
      throw new Error(`Occurrence ${sourceFirstGroupOccurrence} not found for "${group}" after position ${currentIndex}`);
    }
  }

  // console.log(JSON.stringify(targetMatches, null, 2));

  const sourceScopes = sourceMatches.map((tokens) => tokens.map((token) => token.scopes.map(scope => `${scope}:${token.chapter}:${token.verse}`) || []).flat()).flat(); // This may be an empty array if source is Greek or Hebrew

  // console.log(flattenedArray);

  let targetGroups = [];
  const wordOccurrences = {};
  let currentString = '';
  let otherText = '';
  let firstGroupOccurrence = 1;

  for (let idx = 0; idx < targetTokens.length; idx++) {
    const targetToken = targetTokens[idx];
    // console.log(idx, token);
    if (targetToken.subType === 'wordLike') {
      if (!wordOccurrences[targetToken.chapter]) {
        wordOccurrences[targetToken.chapter] = {};
      }
      if (!wordOccurrences[targetToken.chapter][targetToken.verse]) { 
        wordOccurrences[targetToken.chapter][targetToken.verse] = {};
      }
      if (!wordOccurrences[targetToken.chapter][targetToken.verse][targetToken.payload]) {
        wordOccurrences[targetToken.chapter][targetToken.verse][targetToken.payload] = 0;
      }
      wordOccurrences[targetToken.chapter][targetToken.verse][targetToken.payload]++;

      const occurrence = wordOccurrences[targetToken.chapter][targetToken.verse][targetToken.payload];
      targetToken.occurrence = occurrence;

      let targetIsMatch = false;
      if (sourceScopes.length > 0) {
        for (const scope of sourceScopes) {
          if (scope.includes(`/${targetToken.payload}:${occurrence}:`) && scope.endsWith(`:${targetToken.chapter}:${targetToken.verse}`)) {
            targetIsMatch = true;
            break;
          }
        }
      } else {
        for (const sourceMatch of sourceMatches.flat().filter((t) => t.chapter = targetToken.chapter && t.verse === targetToken.verse)) {
          for (const scope of targetToken.scopes) {
            if (scope.includes(`/${sourceMatch.payload}:${sourceMatch.occurrence}`)) {
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
            currentString += otherText.replace(/\n+/, ' ').replace(/\s+/g, ' ');
            otherText = '';
          }
          if (targetGroups.length == 0) {
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

  if (!targetGroups.length) {
    throw new Error('No target groups found');
  }

  if (!firstGroupOccurrence) {
    throw new Error('No first group occurrence found');
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
  for (let i = 0; i < startIndex; i++) {
    if (tokens[i].subType === 'wordLike') {
      if (!wordOccurrences[tokens[i].chapter]) {
        wordOccurrences[tokens[i].chapter] = {};
      }
      if (!wordOccurrences[tokens[i].chapter][tokens[i].verse]) { 
        wordOccurrences[tokens[i].chapter][tokens[i].verse] = {};
      }
      if (!wordOccurrences[tokens[i].chapter][tokens[i].verse][tokens[i].payload]) {
        wordOccurrences[tokens[i].chapter][tokens[i].verse][tokens[i].payload] = 0;
      }
      wordOccurrences[tokens[i].chapter][tokens[i].verse][tokens[i].payload]++;

      const occurrence = wordOccurrences[tokens[i].chapter][tokens[i].verse][tokens[i].payload];
      tokens[i].occurrence = wordOccurrences[tokens[i].chapter][tokens[i].verse][tokens[i].payload];
    }
  }

  while (tokenIndex < tokens.length && wordIndex < words.length) {
    const token = tokens[tokenIndex];
    if (token.subType === 'wordLike') {
      if (!wordOccurrences[token.chapter]) {
        wordOccurrences[token.chapter] = {};
      }
      if (!wordOccurrences[token.chapter][token.verse]) { 
        wordOccurrences[token.chapter][token.verse] = {};
      }
      if (!wordOccurrences[token.chapter][token.verse][token.payload]) {
        wordOccurrences[token.chapter][token.verse][token.payload] = 0;
      }
      wordOccurrences[token.chapter][token.verse][token.payload]++;

      const occurrence = wordOccurrences[token.chapter][token.verse][token.payload];
      token.occurrence = occurrence;
    }

    const word = words[wordIndex];
    // console.log(tokenIndex, token, wordIndex, word);
    if (token.subType != 'wordLike') {
      tokenIndex++;
      // console.log("not wordLike subType: |"+token.subType+"|");
      continue;
    }
    // console.log("have wordLike payload: |"+token.payload+"| Word: |"+word+"|");
    if (token.payload.normalize() != word.normalize()) {
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
