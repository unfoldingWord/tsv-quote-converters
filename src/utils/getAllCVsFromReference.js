export const getAllCVsFromReference = (reference) => {
  const cvs = [];
  // Handle verse ranges
  const verseSemicolonParts = reference.trim().split(';');
  for (const semicolonPart of verseSemicolonParts) {
    const [chapter, verseRef] = semicolonPart.split(':');
    const verseCommaParts = verseRef.trim().split(',');
    for (const commaPart of verseCommaParts) {
      if (commaPart.includes(':')) {
        [chapter, commaPart] = commaPart.split(':');
      }
      if (commaPart.includes('-')) {
        const verseRange = commaPart.trim().split('-');
        if (verseRange.length > 1) {
          for (let i = parseInt(verseRange[0]); i <= parseInt(verseRange[1]); i++) {
            cvs.push(`${chapter}:${i}`);
          }
        }
      } else {
        cvs.push(`${chapter}:${commaPart}`);
      }
    }
  }
  return cvs;
};

