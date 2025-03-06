import { BibleBookData } from '../common/books';
import { loadResourceFilesIntoProskomma } from './loadResourceFilesIntoProskomma';
import { doAlignmentQuery } from './doAlignmentQuery';
import { getAlignedQuote, getAlignedQuoteTryingDifferentSeparators } from './getAlignedQuote';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { parseBibleReference } from '../utils/parseBibleReference';

const containsHebrewOrGreek = (text) => /[\u0590-\u05FF\uFB1D-\uFB4F\u0370-\u03FF\u1F00-\u1FFF]/.test(text);

/**
 * Converts GL Quotes to OL Quotes.
 * @param {string} bibleLinks - DCS owner/repo/ref link.
 * @param {string} bookCode - The book to process.
 * @param {string} tsvContent - The TSV content.
 * @param {boolean} [trySeparatorsAndOccurrences=false] - Whether to try different separators and occurrences.
 * @param {string} [dcsUrl='https://git.door43.org'] - The DCS URL.
 * @param {boolean} [quiet=true] - Whether to suppress console output.
 * @returns {Promise<Object>} The result object containing output and errors.
 */
export function convertGLQuotes2OLQuotes({ bibleLink, bookCode, tsvContent, trySeparatorsAndOccurrences = false, dcsUrl = 'https://git.door43.org', quiet = true }) {
  return new Promise((resolve, reject) => {
    let errors = [];

    if (!bibleLink) {
      bibleLink = 'unfoldingWord/en_ult/master';
    }

    const testament = BibleBookData[bookCode.toLowerCase()]?.testament;
    if (!testament) {
      const errorMsg = `ERROR: Book ${bookCode} not a valid Bible book`;
      if (!quiet) console.error(errorMsg);
      reject(errorMsg);
    }

    loadResourceFilesIntoProskomma({ bibleLinks: [bibleLink], bookCode, dcsUrl, quiet })
      .then(doAlignmentQuery)
      .then((tokenLookup) => {
        // Query Proskomma which now contains the books
        const repo = bibleLink.split('/')[1];
        let nRecords = 0;
        let counts = { pass: 0, fail: 0 };
        const tsvRecords = parse(tsvContent, {
          columns: true,
          delimiter: '\t',
          quote: '',
          skip_empty_lines: true,
        });
        const columns = tsvContent.split('\n')[0].split('\t');
        for (const tsvRecord of tsvRecords) {
          nRecords++;
          if (
            !tsvRecord['Reference'] ||
            !tsvRecord['Quote']?.trim() ||
            !tsvRecord['Occurrence'] ||
            tsvRecord['Reference'] == 'Reference' ||
            containsHebrewOrGreek(tsvRecord['Quote'])
          ) {
            if (tsvRecord['Reference'] === 'Reference') {
              tsvRecord['Occurrence'] = 'Occurrence';
            }
            // Last condition checks for Greek or Hebrew characters. If they exist, we don't need to process this record since not an English ULT quote
            continue;
          }
          const quote = tsvRecord['Quote'].replace('QUOTE_NOT_FOUND: ', '').replace(/\s*…\s*/g, ' & ');
          const sourceTokens = [];
          const targetTokens = [];
          const targetBible = testament === 'old' ? 'hbo_uhb' : 'el-x-koine_ugnt';

          const allCVs = parseBibleReference(tsvRecord['Reference']);
          for (const cv of allCVs) {
            sourceTokens.push(...tokenLookup[repo]?.[bookCode.toUpperCase()][cv]);
            targetTokens.push(...tokenLookup[targetBible][bookCode.toUpperCase()][cv]);
          }

          let resultObject = null;

          let err = null;
          try {
            let occurrence = 1;
            if (tsvRecord['Occurrence'] && tsvRecord['Occurrence'] !== '1') {
              occurrence = parseInt(tsvRecord['Occurrence']);
            }
            if (trySeparatorsAndOccurrences) {
              resultObject = getAlignedQuoteTryingDifferentSeparators({
                sourceTokens,
                targetTokens,
                sourceQuote: quote,
                sourceFirstGroupOccurrence: occurrence,
                sourceIsOrigLang: false,
                quiet,
              });
            } else {
              resultObject = getAlignedQuote({
                sourceTokens,
                targetTokens,
                sourceQuote: quote,
                sourceFirstGroupOccurrence: occurrence,
                sourceIsOrigLang: false,
                quiet,
              });
            }
          } catch (e) {
            err = e;
          }

          if (resultObject) {
            counts.pass++;
            tsvRecord['Quote'] = resultObject.quote;
            if (tsvRecord['Occurrence'] != -1) {
              tsvRecord['Occurrence'] = resultObject.occurrence;
            }
          } else {
            tsvRecord['Quote'] = 'QUOTE_NOT_FOUND: ' + tsvRecord['Quote'].replace('QUOTE_NOT_FOUND: ', '');
            counts.fail++;
            const errorMsg = `Error: ${bookCode} ${tsvRecord['Reference']} ${tsvRecord['ID']} ${err}`;
            if (!quiet) console.error(errorMsg);
            errors.push(errorMsg);
          }
        }
        const outputTsv = stringify(tsvRecords, { header: true, quote: '', delimiter: '\t', columns });
        resolve({ output: outputTsv, errors });
      })
      .catch((err) => {
        if (!quiet) console.error(err);
        reject(err);
      });
  });
}
