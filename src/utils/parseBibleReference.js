/**
 * Parse a Bible reference string into an array of individual chapter:verse references
 * @param {string} reference - A Bible reference string like "1:23,24;2:28-29,3:15"
 * @returns {string[]} - Array of individual chapter:verse references
 */
export function parseBibleReference(reference) {
  const singleCVs = [];
  let currentChapter = null;

  if (!reference || !reference.includes(':')) {
    return singleCVs;
  }

  // Split on semicolons first
  const semicolonParts = reference.split(';');

  for (const scPart of semicolonParts) {
    const commaParts = scPart.trim().split(',');
    for (const commaPart of commaParts) {
      if (commaPart.includes(':')) {
        // This part contains a chapter reference
        const [chapter, verse] = commaPart.trim().split(':');
        currentChapter = chapter;
        
        // Handle verse range if present
        if (verse.includes('-')) {
          const [start, end] = verse.split('-').map((v) => parseInt(v));
          for (let v = start; v <= end; v++) {
            singleCVs.push(`${currentChapter}:${v}`);
          }
        } else {
          singleCVs.push(`${currentChapter}:${verse}`);
        }
      } else {
        // This part is just a verse or verse range using previous chapter
        if (!currentChapter) {
          throw new Error('Verse reference without chapter');
        }

        if (commaPart.includes('-')) {
          const [start, end] = commaPart
            .trim()
            .split('-')
            .map((v) => parseInt(v));
          for (let v = start; v <= end; v++) {
            singleCVs.push(`${currentChapter}:${v}`);
          }
        } else {
          singleCVs.push(`${currentChapter}:${commaPart.trim()}`);
        }
      }
    }
  }
  
  return singleCVs;
}
