export function getSingleCVsFromReference(reference) {
  const singleCVs = [];
  let currentChapter = null;
  
  // Split on commas first
  const parts = reference.split(',');
  
  for (const part of parts) {
    if (part.includes(':')) {
      // This part contains a chapter reference
      const [chapter, verse] = part.trim().split(':');
      currentChapter = chapter;
      
      // Handle verse range if present
      if (verse.includes('-')) {
        const [start, end] = verse.split('-').map(v => parseInt(v));
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
      
      if (part.includes('-')) {
        const [start, end] = part.trim().split('-').map(v => parseInt(v));
        for (let v = start; v <= end; v++) {
          singleCVs.push(`${currentChapter}:${v}`);
        }
      } else {
        singleCVs.push(`${currentChapter}:${part.trim()}`);
      }
    }
  }
  
  return singleCVs;
}