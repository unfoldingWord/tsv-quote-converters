import { BibleBookData } from '../common/books';
import { getAlignedQuote, getAlignedQuoteTryingDifferentSeparators } from './getAlignedQuote';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { loadResourceFilesIntoProskomma } from './loadResourceFilesIntoProskomma';
import { doAlignmentQuery } from './doAlignmentQuery';
import { getSingleCVsFromReference } from '../utils/getSingleCVsFromReference';

/**
 * Adds GL quote columns.
 * @param {Array} bibleLinks - Array of DCS owner/repo/ref links.
 * @param {string} bookCode - The book code to process.
 * @param {string} tsvContent - The TSV content.
 * @param {boolean} [trySeparatorsAndOccurrences=false] - Whether to try different separators and occurrences.
 * @param {string} [dcsUrl='https://git.door43.org'] - The DCS URL.
 * @returns {Promise<Object>} The result object containing output and errors.
 */
export function addGLQuoteCols({ bibleLinks, bookCode, tsvContent, trySeparatorsAndOccurrences = false, dcsUrl = 'https://git.door43.org' }) {
  return new Promise((resolve, reject) => {
    let errors = [];

    if (!Array.isArray(bibleLinks)) {
      bibleLinks = [bibleLinks];
    }

    const columns = tsvContent.split('\n')[0].split('\t');

    const testament = BibleBookData[bookCode.toLowerCase()]?.testament;
    if (!testament) {
      const errorMsg = `ERROR: Book ${bookCode} not a valid Bible book`;
      console.error(errorMsg);
      reject(errorMsg);
    }

    loadResourceFilesIntoProskomma({ bibleLinks, bookCode, dcsUrl })
      .then(doAlignmentQuery)
      .then(tokenLookup => {
        let nRecords = 0;
        let counts = { pass: 0, fail: 0 };
        const tsvRecords = parse(tsvContent, {
          columns: true,
          delimiter: '\t',
          skip_empty_lines: true,
        });
        for (const tsvRecord of tsvRecords) {
          nRecords++;
          if (!tsvRecord['Reference'] || !tsvRecord['Quote'].trim() || !tsvRecord['Occurrence']) {
            continue;
          }
          if (tsvRecord['Quote'].includes('QUOTE_NOT_FOUND')) {
            tsvRecord['GLQuote'] = tsvRecord['Quote'];
            continue;
          }
          const quote = tsvRecord['Quote'].replace(/\s*…\s*/g, ' & ');
          const sourceTokens = [];
          const sourceBible = testament === 'old' ? 'hbo_uhb' : 'el-x-koine_ugnt';
          const singleCVs = getSingleCVsFromReference(tsvRecord['Reference']);

          // Handle verse ranges
          for (const cv of singleCVs) {
            sourceTokens.push(...tokenLookup[sourceBible][bookCode.toUpperCase()][cv]);
          }

          for (const link of bibleLinks) {
            const targetTokens = [];

            const repo = link.split('/')[1];
            for (const cv of singleCVs) {
              targetTokens.push(...tokenLookup[repo]?.[bookCode.toUpperCase()][cv]);
            }

            let resultObject = null;
            let err = null;
            try {
              if (trySeparatorsAndOccurrences) {
                resultObject = getAlignedQuoteTryingDifferentSeparators({
                  sourceTokens,
                  targetTokens,
                  sourceQuote: quote,
                  sourceFirstGroupOccurrence: parseInt(tsvRecord['Occurrence']),
                  sourceIsOrigLang: true,
                });
              } else {
                resultObject = getAlignedQuote({
                  sourceTokens,
                  targetTokens,
                  sourceQuote: quote,
                  sourceFirstGroupOccurrence: parseInt(tsvRecord['Occurrence']),
                  sourceIsOrigLang: true,
                });
              }
            } catch (e) {
              err = e;
            }

            const glQuoteColName = bibleLinks.length > 1 ? `GLQuote:${repo}` : 'GLQuote';
            const glOccurrenceColName = bibleLinks.length > 1 ? `GLOccurrence:${repo}` : 'GLOccurrence';
            if (!columns.includes(glQuoteColName)) {
              let occurrenceIndex = columns.findIndex((col) => col.startsWith('GLOccurrence'));
              if (occurrenceIndex === -1) {
                occurrenceIndex = columns.findIndex((col) => col === 'Occurrence');
              }
              if (occurrenceIndex !== -1) {
                columns.splice(occurrenceIndex + 1, 0, glQuoteColName);
                columns.splice(occurrenceIndex + 2, 0, glOccurrenceColName);
              } else {
                columns.push(glQuoteColName);
                columns.push(glOccurrenceColName);
              }
            }
            if (resultObject && resultObject.quote && resultObject.occurrence) {
              counts.pass++;
              tsvRecord[glQuoteColName] = resultObject.quote;
              if (tsvRecord['Occurrence'] != -1) {
                tsvRecord[glOccurrenceColName] = resultObject.occurrence;
              } else {
                tsvRecord[glOccurrenceColName] = -1;
              }
            } else {
              tsvRecord[glQuoteColName] = 'QUOTE_NOT_FOUND: ' + tsvRecord['Quote'].replace('QUOTE_NOT_FOUND: ', '');
              tsvRecord[glOccurrenceColName] = tsvRecord['Occurrence'];
              counts.fail++;
              const errorMsg = `Error: ${bookCode} ${tsvRecord['Reference']} ${tsvRecord['ID']} ${err}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        }
        const outputTsv = stringify(tsvRecords, { header: true, quote: '', delimiter: '\t', columns });
        resolve({ output: outputTsv, errors });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
