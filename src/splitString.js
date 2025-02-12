/**
 * Splits a sentence or phrase by spaces in all possible ways.
 * @param {string} str - The sentence or phrase to split.
 * @returns {Array} An array of arrays, each containing a different split of the string.
 */
function splitStringBySpaces(str) {
  const words = str.split(' ');
  const results = [];

  function generateSplits(start, currentSplit) {
    if (start >= words.length) {
      results.push(currentSplit.join(' & '));
      return;
    }

    for (let i = start; i < words.length; i++) {
      const newSplit = currentSplit.concat([words.slice(start, i + 1).join(' ')]);
      generateSplits(i + 1, newSplit);
    }
  }

  generateSplits(0, []);
  return results.reverse();
}

// Example usage:
const sentence = "This is a test sentence";
console.log(splitStringBySpaces(sentence));
