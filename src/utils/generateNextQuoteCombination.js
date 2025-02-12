/**
 * Generator function that yields quote combinations one at a time
 * @param {string} str - The quote to split
 */
export function* generateNextQuoteCombination(str) {
  let result;
  const words = str.normalize('NFKC').split(/[\s&]+/).filter(Boolean);
  if (words.length <= 1) {
    yield str;
    return;
  }

  // First yield the original str
  yield str;

  // Next yield the original string with no ampersands
  result = words.join(' ');
  if (result !== str) {
    yield result;
  }

  // Try single ampersand at each position
  for (let i = 0; i < words.length - 1; i++) {
    result = [...words.slice(0, i), 
                words.slice(i, i + 2).join(' & '),
                ...words.slice(i + 2)].join(' ');
    if (result !== str) {
      yield result;
    }
  }

  // Try combinations with multiple ampersands
  for (let numAmpersands = 2; numAmpersands < words.length; numAmpersands++) {
    // Generate combinations with increasing number of ampersands
    const positions = [];
    for (let i = 0; i < numAmpersands; i++) {
      positions.push(i);
    }
    
    while (positions[positions.length - 1] < words.length - 1) {
      // Generate result for current positions
      result = words[0];
      let wordIndex = 1;
      for (let i = 0; i < words.length - 1; i++) {
        if (positions.includes(i)) {
          result += ' & ' + words[wordIndex];
        } else {
          result += ' ' + words[wordIndex];
        }
        wordIndex++;
      }
      if (result !== str) {
        yield result;
      }

      // Move to next valid position combination
      let posIndex = positions.length - 1;
      while (posIndex >= 0 && positions[posIndex] === words.length - numAmpersands + posIndex) {
        posIndex--;
      }
      if (posIndex < 0) break;
      
      positions[posIndex]++;
      for (let i = posIndex + 1; i < positions.length; i++) {
        positions[i] = positions[i - 1] + 1;
      }
    }
  }
}