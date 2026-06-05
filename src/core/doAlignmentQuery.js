/**
 * Does the alignment query
 * @param {Promise<Proskomma>} pk - The Proskomma object
 * @param {boolean} [quiet=true] - Whether to suppress console output
 * @returns {Object} The token lookup object
 */
export async function doAlignmentQuery(pk, quiet = true) {
  const tokenLookup = {};

  const tokenFields =
    '        scopeLabels' +
    '        tokens {' +
    '          subType' +
    '          payload' +
    '          position' +
    '          scopes(startsWith:"attribute/milestone/zaln/x-align")' + // This line was changed (and assumes preprocessing of alignment info)
    '        }';

  // Verse-scoped tokens: grouped by chapter + verse.
  const verseQuery =
    '{' +
    'docSets {' +
    '  repo: selector(id:"repo")' +
    '  documents {' +
    '    book: header(id:"bookCode")' +
    '    mainSequence {' +
    '      itemGroups (' +
    '        byScopes:["chapter/", "verses/"]' +
    '      ) {' +
    tokenFields +
    '      }' +
    '    }' +
    '  }' +
    '}' +
    '}';

  // Front-matter tokens: \d blocks (e.g. psalm superscriptions) carry a chapter
  // scope but no verses scope, so the verse query (which requires a verses scope)
  // excludes them entirely. Query them separately and key under `${chapter}:front`.
  const frontQuery =
    '{' +
    'docSets {' +
    '  repo: selector(id:"repo")' +
    '  documents {' +
    '    book: header(id:"bookCode")' +
    '    mainSequence {' +
    '      itemGroups (' +
    '        byScopes:["chapter/", "blockTag/d"]' +
    '      ) {' +
    tokenFields +
    '      }' +
    '    }' +
    '  }' +
    '}' +
    '}';

  const verseResult = await pk.gqlQuery(verseQuery);
  if (verseResult.errors) {
    throw new Error(verseResult.errors);
  }
  const frontResult = await pk.gqlQuery(frontQuery);
  if (frontResult.errors) {
    throw new Error(frontResult.errors);
  }

  const ensureBook = (repo, book) => {
    if (!tokenLookup[repo]) tokenLookup[repo] = {};
    if (!tokenLookup[repo][book]) tokenLookup[repo][book] = {};
    return tokenLookup[repo][book];
  };

  // Annotate tokens with chapter/verse and apply the el-x-koine_ugnt curly-quote fixup.
  const annotateTokens = (repo, tokens, chapter, verse) => {
    for (let i = 0; i < tokens.length; i++) {
      if (repo === 'el-x-koine_ugnt' && i < tokens.length - 1 && tokens[i].subType === 'wordLike' && tokens[i + 1].payload === '’') {
        // Need to put the single right curly quote with the Greek word if the Bible is el-x-koine_ugnt
        tokens[i].payload += '’';
        tokens[i + 1].payload = '';
      }
      tokens[i].chapter = chapter;
      tokens[i].verse = verse;
    }
  };

  // Verse pass.
  for (const docSet of verseResult.data.docSets) {
    for (const document of docSet.documents) {
      const bookLookup = ensureBook(docSet.repo, document.book);
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
            annotateTokens(docSet.repo, itemGroup.tokens, chapter, verse);
            bookLookup[`${chapter}:${verse}`] = itemGroup.tokens;
          }
          if (!quiet) console.log(`Loaded ${itemGroup.tokens.length} tokens for ${document.book} ${chapter}:${verseScope}`);
        } catch (error) {
          if (!quiet) console.error(`Error processing itemGroup with scopeLabels ${itemGroup.scopeLabels}:`, error);
          continue;
        }
      }
    }
  }

  // Front-matter pass. Each group is a \d block; key it under `${chapter}:front`.
  // A chapter may have more than one \d block, so concatenate when present.
  for (const docSet of frontResult.data.docSets) {
    for (const document of docSet.documents) {
      const bookLookup = ensureBook(docSet.repo, document.book);
      for (const itemGroup of document.mainSequence.itemGroups) {
        if (!itemGroup.scopeLabels.some((s) => s === 'blockTag/d')) continue;
        let chapter = 0;
        try {
          chapter = itemGroup.scopeLabels.filter((s) => s.startsWith('chapter/'))[0].split('/')[1];
        } catch (error) {
          if (!quiet) console.error(`Error processing front-matter itemGroup with scopeLabels ${itemGroup.scopeLabels}:`, error);
          continue;
        }
        annotateTokens(docSet.repo, itemGroup.tokens, chapter, 'front');
        const frontKey = `${chapter}:front`;
        bookLookup[frontKey] = bookLookup[frontKey] ? bookLookup[frontKey].concat(itemGroup.tokens) : itemGroup.tokens;
        if (!quiet) console.log(`Loaded ${itemGroup.tokens.length} front-matter tokens for ${document.book} ${frontKey}`);
      }
    }
  }

  return tokenLookup;
}
