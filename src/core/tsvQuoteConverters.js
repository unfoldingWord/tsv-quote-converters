import axios from 'axios';
import { Proskomma } from 'proskomma';

import { BibleBookData } from '../common/books';
import { parseTsvToObjects,  tsvRecordToTSV7String, tsvRecordToTSV9String } from '../utils/tsv';
import { rejigAlignment } from '../utils/rejig_alignment';
import { getAlignedQuote } from './getAlignedQuote';

const pk = new Proskomma([
  {
    name: 'org',
    type: 'string',
    regex: '^[^\\s]+$',
  },
  {
    name: 'lang',
    type: 'string',
    regex: '^[^\\s]+$',
  },
  {
    name: 'abbr',
    type: 'string',
    regex: '^[A-za-z0-9_-]+$',
  },
]);
let tokenLookup = {};
const importedBooks = [];

// Adapted from https://github.com/unfoldingWord-box3/uw-proskomma/blob/main/src/utils/download.js May 2021
const getDocuments = async (book, dcsUrl = 'https://git.door43.org') => {
  book = book.toLowerCase();

  if (importedBooks.includes(book)) {
    return;
  }

  const ol_bible = BibleBookData?.[book]?.testament === 'old' ? 'hbo_uhb' : 'el-x-koine_ugnt';
  if (!ol_bible) {
    console.error(`ERROR: Book ${book} not a valid Bible book`);
    return;
  }
  const baseURLs = [
    ['unfoldingWord', ...ol_bible.split('_'), `${dcsUrl}/api/v1/repos/unfoldingWord/${ol_bible}/contents/${BibleBookData[book].usfm}.usfm`],
    ['unfoldingWord', 'en', 'ult', `${dcsUrl}/api/v1/repos/unfoldingWord/en_ult/contents/${BibleBookData[book].usfm}.usfm`],
  ];
  // console.log('Download USFM');
  for (const [org, lang, abbr, baseURL] of baseURLs) {
    const selectors = {
      org,
      lang,
      abbr,
    };
    // console.log(`  ${org}/${lang}/${abbr}`);
    let content = [];
    await axios.request({ method: 'get', url: baseURL }).then(async (response) => {
      const decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
      content.push(decodedContent);
    });
    if (content.length === 0) {
      // console.log(`      Book ${book} not found`);
      continue;
    }
    // console.log(`      Downloaded ${book} ${content.length.toLocaleString()} bytes`);

    const startTime = Date.now();
    if (abbr === 'ult') {
      content = [rejigAlignment(content)]; // Tidy-up ULT USFM alignment info
    }
    try {
      pk.importDocuments(selectors, 'usfm', content, {});
    } catch (err) {
      if (!err.message.includes('already exists in docSet')) {
        console.error(`ERROR: ${err}`);
      }
    }
    // console.log(`      Imported in ${Date.now() - startTime} msec`);
  }
  importedBooks.push(book);
  return;
};

// Adapted from https://github.com/unfoldingWord-box3/uw-proskomma/blob/main/src/utils/query.js May 2021
// Called from main
const doAlignmentQuery = async () => {
  const query =
    '{' +
    'docSets {' +
    '  abbr: selector(id:"abbr")' +
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
    tokenLookup[docSet.abbr] = {};
    for (const document of docSet.documents) {
      tokenLookup[docSet.abbr][document.book] = {};
      for (const itemGroup of document.mainSequence.itemGroups) {
        const chapter = itemGroup.scopeLabels.filter((s) => s.startsWith('chapter/'))[0].split('/')[1];
        for (const verse of itemGroup.scopeLabels
          .filter((s) => s.startsWith('verses/'))[0]
          .split('/')[1]
          .split('-')) {
          const cv = `${chapter}:${verse}`;
          tokenLookup[docSet.abbr][document.book][cv] = itemGroup.tokens;
        }
      }
    }
  }
  console.log(tokenLookup);
};

const containsHebrewOrGreek = (text) => /[\u0590-\u05FF\uFB1D-\uFB4F\u0370-\u03FF\u1F00-\u1FFF]/.test(text);

export function convertULTQuotes2OL(book, tsvContent, dcsUrl = 'https://git.door43.org') {
  return new Promise((resolve, reject) => {
    let output = [];
    let errors = [];

    const testament = BibleBookData[book.toLowerCase()]?.testament;
    if (!testament) {
      const errorMsg = `ERROR: Book ${book} not a valid Bible book`;
      console.error(errorMsg);
      reject(errorMsg);
    }

    getDocuments(book, dcsUrl)
      .then(async () => {
        // Query Proskomma which now contains the books
        if (!tokenLookup?.ult?.[book.toUpperCase()] || !tokenLookup[testament === 'old' ? 'uhb' : 'ugnt']?.[book.toUpperCase()]) {
          await doAlignmentQuery();
        }
        let nRecords = 0;
        let counts = { pass: 0, fail: 0 };
        const tsvRecords = parseTsvToObjects(tsvContent);
        for (const tsvRecord of tsvRecords) {
          nRecords++;
          if (!tsvRecord.ref || !tsvRecord.quote?.trim() || !tsvRecord.occurrence || tsvRecord.ref == 'Reference' || containsHebrewOrGreek(tsvRecord.quote)) {
            if (tsvRecord.ref === 'Reference') {
              tsvRecord.occurrence = 'Occurrence';
            }
            // Last condition checks for Greek or Hebrew characters. If they exist, we don't need to process this record since not an English ULT quote
            output.push(tsvRecordToTSV7String(tsvRecord));
            continue;
          }
          const quote = tsvRecord.quote.replace('QUOTE_NOT_FOUND: ', '').replace(/\s*…\s*/g, ' & ');
          const [chapter, verseRef] = tsvRecord.ref.split(':');
          // console.log(`chapter: ${chapter}, verseRef: ${verseRef}`);
          const verses = [];
          const verseCommaParts = verseRef.trim().split(',');
          // console.log("CHAPTER: ", chapter, verseRef);
          // console.log("verseCommaParts:", verseCommaParts);
          for (const commaPart of verseCommaParts) {
            if (commaPart.includes('-')) {
              const verseRange = commaPart.trim().split('-');
              if (verseRange.length > 1) {
                for (let i = parseInt(verseRange[0]); i <= parseInt(verseRange[1]); i++) {
                  verses.push(i);
                }
              }
            } else {
              verses.push(parseInt(commaPart));
            }
          }
          // console.log('VERSES:', verses);
          for (const verseIdx in verses) {
            const verse = verses[verseIdx];
            const cv = `${chapter}:${verse}`;
            const source = testament === 'old' ? tokenLookup.uhb : tokenLookup.ugnt;
            const sourceTokens = source[book.toUpperCase()][cv];
            const allULTTokens = tokenLookup.ult?.[book.toUpperCase()][cv];
          
            let resultObject = null;

            let err =  null;
            try {
              let occurrence = 1;
              if (tsvRecord.occurrence && tsvRecord.occurrence !== '1') {
                occurrence = parseInt(tsvRecord.occurrence);
              }
              resultObject = getAlignedQuote(allULTTokens, sourceTokens, quote, occurrence);
            } catch (e) {
              err = e;
            }

            if (resultObject) {
              counts.pass++;
              // console.log(resultObject);
              tsvRecord.quote = resultObject.quote;
              tsvRecord.occurrence = resultObject.occurrence;
              output.push(tsvRecordToTSV7String(tsvRecord));
              break;
            } else {
              if (verseIdx < verses.length - 1) {
                continue;
              }
              tsvRecord.quote = 'QUOTE_NOT_FOUND: ' + tsvRecord.quote;
              output.push(tsvRecordToTSV7String(tsvRecord));
              counts.fail++;
              const errorMsg = `Error: ${book} ${cv} ${tsvRecord.id} ${err}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        }
        resolve({ output, errors });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

export function addGLQuoteCols(book, tsvContent, dcsUrl = 'https://git.door43.org') {
  return new Promise((resolve, reject) => {
    let output = [];
    let errors = [];

    const testament = BibleBookData[book.toLowerCase()]?.testament;
    if (!testament) {
      const errorMsg = `ERROR: Book ${book} not a valid Bible book`;
      console.error(errorMsg);
      reject(errorMsg);
    }

    getDocuments(book, dcsUrl)
      .then(async () => {
        // Query Proskomma which now contains the books
        if (!tokenLookup?.ult?.[book.toUpperCase()] || !tokenLookup[testament === 'old' ? 'uhb' : 'ugnt']?.[book.toUpperCase()]) {
          await doAlignmentQuery();
        }
        let nRecords = 0;
        let counts = { pass: 0, fail: 0 };
        const tsvRecords = parseTsvToObjects(tsvContent);
        for (const tsvRecord of tsvRecords) {
          nRecords++;
          if (!tsvRecord.ref || !tsvRecord.quote.trim() || !tsvRecord.occurrence || tsvRecord.ref === 'Reference') {
            // Last condition checks for Greek or Hebrew characters. If they exist, we don't need to process this record since not an English ULT quote
            if (tsvRecord.ref === 'Reference') {
              tsvRecord.occurrence = 'Occurrence';
              tsvRecord.glQuote = 'GLQuote';
              tsvRecord.glOccurrence = 'GLOccurrence';
            }
            output.push(tsvRecordToTSV9String(tsvRecord));
            continue;
          }
          const quote = tsvRecord.quote.replace('QUOTE_NOT_FOUND: ', '').replace(/\s*…\s*/g, ' & ');;
          const [chapter, verseRef] = tsvRecord.ref.split(':');
          // console.log(`chapter: ${chapter}, verseRef: ${verseRef}`);
          const verses = [];
          const verseCommaParts = verseRef.trim().split(',');
          // console.log("CHAPTER: ", chapter, verseRef);
          // console.log("verseCommaParts:", verseCommaParts);
          for (const commaPart of verseCommaParts) {
            if (commaPart.includes('-')) {
              const verseRange = commaPart.trim().split('-');
              if (verseRange.length > 1) {
                for (let i = parseInt(verseRange[0]); i <= parseInt(verseRange[1]); i++) {
                  verses.push(i);
                }
              }
            } else {
              verses.push(parseInt(commaPart));
            }
          }
          // console.log('VERSES:', verses);
          for (const verseIdx in verses) {
            const verse = verses[verseIdx];
            const cv = `${chapter}:${verse}`;
            const source = testament === 'old' ? tokenLookup.uhb : tokenLookup.ugnt;
            const sourceTokens = source[book.toUpperCase()][cv];
            const allULTTokens = tokenLookup.ult?.[book.toUpperCase()][cv];

            let resultObject = null;

            let err =  null;
            try {
              resultObject = getAlignedQuote(sourceTokens, allULTTokens, quote, tsvRecord.occurrence);
            } catch (e) {
              err = e;
            }

            if (resultObject) {
              counts.pass++;
              // console.log(resultObject);
              tsvRecord.glQuote = resultObject.quote;
              tsvRecord.glOccurrence = resultObject.occurrence;
              output.push(tsvRecordToTSV9String(tsvRecord));
              break;
            } else {
              if (verseIdx < verses.length - 1) {
                continue;
              }
              tsvRecord.glQuote = 'QUOTE_NOT_FOUND: ' + tsvRecord.quote;
              output.push(tsvRecordToTSV9String(tsvRecord));
              counts.fail++;
              const errorMsg = `Error: ${book} ${cv} ${tsvRecord.id} ${err}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        }
        resolve({ output, errors });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
