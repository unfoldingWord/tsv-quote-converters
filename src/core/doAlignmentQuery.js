/**
 * Does the alignment query
 * @param {Promise<Proskomma>} pk - The Proskomma object
 * @returns {Object} The token lookup object 
 */
export async function doAlignmentQuery(pk) {
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
          console.error(`Error processing itemGroup with scopeLabels ${itemGroup.scopeLabels}:`, error);
          continue;
        }
        try {
        for (const verse of itemGroup.scopeLabels
          .filter((s) => s.startsWith('verses/'))[0]
          .split('/')[1]
          .split('-')) {
          for (let i = 0; i < itemGroup.tokens.length; i++) {
            if (docSet.repo === 'el-x-koine_ugnt' && i < itemGroup.tokens.length - 1 && itemGroup.tokens[i].subType === 'wordLike' && itemGroup.tokens[i + 1].payload === '’') {
              // Need to put the single right curly quote with the Greek word if the Bible is el-x-koine_ugnt
              itemGroup.tokens[i].payload += '’';
              itemGroup.tokens[i + 1].payload = '';
            }
            itemGroup.tokens[i].chapter = chapter;
            itemGroup.tokens[i].verse = verse;
          }
          tokenLookup[docSet.repo][document.book][`${chapter}:${verse}`] = itemGroup.tokens;
          console.log(`Loaded ${itemGroup.tokens.length} tokens for ${document.book} ${chapter}:${verse}`);
        }
        } catch (error) {
          console.error(`Error processing itemGroup with scopeLabels ${itemGroup.scopeLabels}:`, error);
          continue;
        }
      }
    }
  }
  return tokenLookup;
}
