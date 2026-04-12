/**
 * Does the alignment query
 * @param {Promise<Proskomma>} pk - The Proskomma object
 * @param {boolean} [quiet=true] - Whether to suppress console output
 * @returns {Object} The token lookup object
 */
export async function doAlignmentQuery(pk, quiet = true) {
  let tokenLookup = {};
  const query =
    '{' +
    'docSets {' +
    '  repo: selector(id:"repo")' +
    '  documents {' +
    '    book: header(id:"bookCode")' +
    '    mainSequence {' +
    '      itemGroups (' +
    '        byScopes:["chapter/", "verses/"]' +
    '      ) {' +
    '        scopeLabels' +
    '        tokens {' +
    '          subType' +
    '          payload' +
    '          position' +
    '          scopes(startsWith:"attribute/milestone/zaln/x-align")' + // This line was changed (and assumes preprocessing of alignment info)
    '        }' +
    '      }' +
    '    }' +
    '  }' +
    '}' +
    '}';
  const result = await pk.gqlQuery(query);
  if (result.errors) {
    throw new Error(result.errors);
  }
  tokenLookup = {};
  for (const docSet of result.data.docSets) {
    tokenLookup[docSet.repo] = {};
    for (const document of docSet.documents) {
      tokenLookup[docSet.repo][document.book] = {};
      for (const itemGroup of document.mainSequence.itemGroups) {
        let chapter = 0;
        try {
          chapter = itemGroup.scopeLabels.filter((s) => s.startsWith('chapter/'))[0].split('/')[1];
        } catch (error) {
          if (!quiet) console.error(`Error processing itemGroup with scopeLabels ${itemGroup.scopeLabels}:`, error);
          continue;
        }
        try {
          const verseScope = itemGroup.scopeLabels.filter((s) => s.startsWith('verses/'))[0].split('/')[1];
          // For verse spans (e.g. "5-6"), annotate all tokens and store under each verse.
          // The same array reference is stored under each key; callers must deduplicate
          // when collecting tokens for a span reference.
          for (const verse of verseScope.split('-')) {
            for (let i = 0; i < itemGroup.tokens.length; i++) {
              if (docSet.repo === 'el-x-koine_ugnt' && i < itemGroup.tokens.length - 1 && itemGroup.tokens[i].subType === 'wordLike' && itemGroup.tokens[i + 1].payload === '\u2019') {
                // Need to put the single right curly quote with the Greek word if the Bible is el-x-koine_ugnt
                itemGroup.tokens[i].payload += '\u2019';
                itemGroup.tokens[i + 1].payload = '';
              }
              itemGroup.tokens[i].chapter = chapter;
              itemGroup.tokens[i].verse = verse;
            }
            tokenLookup[docSet.repo][document.book][`${chapter}:${verse}`] = itemGroup.tokens;
          }
          if (!quiet) console.log(`Loaded ${itemGroup.tokens.length} tokens for ${document.book} ${chapter}:${verseScope}`);
        } catch (error) {
          if (!quiet) console.error(`Error processing itemGroup with scopeLabels ${itemGroup.scopeLabels}:`, error);
          continue;
        }
      }
    }
  }
  return tokenLookup;
}
