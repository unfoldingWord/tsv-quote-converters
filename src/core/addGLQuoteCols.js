import { BibleBookData } from '../common/books';
import { getAlignedQuote, getAlignedQuoteTryingDifferentSeparators } from './getAlignedQuote';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { loadResourceFilesIntoProskomma } from './loadResourceFilesIntoProskomma';
import { doAlignmentQuery } from './doAlignmentQuery';
import { parseBibleReference } from '../utils/parseBibleReference';

/**
 * Adds GL quote columns.
 * @param {Array} bibleLinks - Array of DCS owner/repo/ref links.
 * @param {string} bookCode - The book code to process.
 * @param {string} tsvContent - The TSV content.
 * @param {boolean} [trySeparatorsAndOccurrences=false] - Whether to try different separators and occurrences.
 * @param {string} [dcsUrl='https://git.door43.org'] - The DCS URL.
 * @param {boolean} [quiet=true] - Whether to suppress console output.
 * @returns {Promise<Object>} The result object containing output and errors.
 */
export function addGLQuoteCols({ bibleLinks, bookCode, tsvContent, trySeparatorsAndOccurrences = false, dcsUrl = 'https://git.door43.org', usePreviousGLQuotes = false, quiet = true }) {
  return new Promise((resolve, reject) => {
    let errors = [];

    if (!Array.isArray(bibleLinks)) {
      bibleLinks = [bibleLinks];
    }

    const columns = tsvContent.split('\n')[0].split('\t');

    const testament = BibleBookData[bookCode.toLowerCase()]?.testament;
    if (!testament) {
      const errorMsg = `ERROR: Book ${bookCode} not a valid Bible book`;
      if (!quiet) console.error(errorMsg);
      reject(errorMsg);
    }

    // Parse TSV records first to check if we need to load resources
    const tsvRecords = parse(tsvContent, {
      columns: true,
      delimiter: '\t',
      quote: '',
      skip_empty_lines: true,
    });

    // Check if we need to load resources
    let needsResourceLoading = !usePreviousGLQuotes;

    if (usePreviousGLQuotes) {
      // Check if any rows are missing valid GLQuote and GLOccurrence
      for (const tsvRecord of tsvRecords) {
        // Skip rows that have no quote text to begin with
        let quote = tsvRecord['Quote'] || tsvRecord['OrigQuote'] || tsvRecord['OrigWords'] || tsvRecord['OrigWord'] || '';
        quote = quote.replace(/\s*…\s*/g, ' & ').trim();

        if (!quote) {
          // No quote text, skip this row
          continue;
        }

        for (const link of bibleLinks) {
          const repo = link.split('/')[1];
          const glQuoteColName = bibleLinks.length > 1 ? `GLQuote:${repo}` : 'GLQuote';
          const glOccurrenceColName = bibleLinks.length > 1 ? `GLOccurrence:${repo}` : 'GLOccurrence';

          if (!tsvRecord[glQuoteColName] ||
            !tsvRecord[glOccurrenceColName] ||
            tsvRecord[glOccurrenceColName].includes('QUOTE_NOT_FOUND') ||
            tsvRecord[glOccurrenceColName] == "0") {
            needsResourceLoading = true;
            if (!quiet) console.log(`Row ${tsvRecord.Reference} requires resource loading - missing or invalid GLQuote/GLOccurrence`);
            break;
          }
        }
        if (needsResourceLoading) break;
      }
    }

    // Function to process records with tokenLookup
    const processRecords = (tokenLookup) => {
      let nRecords = 0;
      let counts = { pass: 0, fail: 0 };

      for (const tsvRecord of tsvRecords) {
        nRecords++;

        let quote = tsvRecord['Quote'] || tsvRecord['OrigQuote'] || tsvRecord['OrigWords'] || tsvRecord['OrigWord'] || '';
        quote = quote.replace(/\s*…\s*/g, ' & ').trim();
        tsvRecord['Quote'] = quote;
        const sourceTokens = [];
        const sourceBible = testament === 'old' ? 'hbo_uhb' : 'el-x-koine_ugnt';

        const singleCVs = parseBibleReference(tsvRecord['Reference']);

        // Only get sourceTokens if we have tokenLookup and need to process this record
        if (tokenLookup) {
          for (const cv of singleCVs) {
            if (tokenLookup[sourceBible][bookCode.toUpperCase()]?.[cv]) {
              sourceTokens.push(...tokenLookup[sourceBible][bookCode.toUpperCase()][cv]);
            }
          }
        }

        for (const link of bibleLinks) {
          const repo = link.split('/')[1];
          const glQuoteColName = bibleLinks.length > 1 ? `GLQuote:${repo}` : 'GLQuote';
          const glOccurrenceColName = bibleLinks.length > 1 ? `GLOccurrence:${repo}` : 'GLOccurrence';

          if (usePreviousGLQuotes && tsvRecord[glQuoteColName] && tsvRecord[glOccurrenceColName] && !tsvRecord[glOccurrenceColName].includes('QUOTE_NOT_FOUND') && tsvRecord[glOccurrenceColName] != "0") {
            continue;
          }

          if (!tsvRecord['Reference'] || !tsvRecord['Quote'] || !parseInt(tsvRecord['Occurrence'])) {
            tsvRecord[glQuoteColName] = tsvRecord['Quote'];
            tsvRecord[glOccurrenceColName] = tsvRecord['Occurrence'];
            continue;
          }
          if (tsvRecord['Quote'].includes('QUOTE_NOT_FOUND')) {
            tsvRecord[glQuoteColName] = tsvRecord['Quote'].replace('QUOTE_NOT_FOUND: ', '');
            tsvRecord[glOccurrenceColName] = tsvRecord['Occurrence'];
            continue;
          }

          // Only process alignment if we have tokenLookup
          if (tokenLookup) {
            const targetTokens = [];

            for (const cv of singleCVs) {
              if (tokenLookup[repo]?.[bookCode.toUpperCase()]?.[cv]) {
                targetTokens.push(...tokenLookup[repo]?.[bookCode.toUpperCase()][cv]);
              }
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
                  quiet,
                });
              } else {
                resultObject = getAlignedQuote({
                  sourceTokens,
                  targetTokens,
                  sourceQuote: quote,
                  sourceFirstGroupOccurrence: parseInt(tsvRecord['Occurrence']),
                  sourceIsOrigLang: true,
                  quiet,
                });
              }
            } catch (e) {
              err = e;
            }

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
              const errorMsg = `Error: line #${nRecords} -- ${bookCode} ${tsvRecord['Reference']} -- ${tsvRecord['ID']} -- ${err}`;
              if (!quiet) console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        }
      }

      const outputTsv = stringify(tsvRecords, { header: true, quote: '', delimiter: '\t', columns });
      resolve({ output: outputTsv, errors });
    };

    // Only load resources if needed
    if (needsResourceLoading) {
      if (!quiet) console.log('Loading resources for quote alignment...');
      loadResourceFilesIntoProskomma({ bibleLinks, bookCode, dcsUrl, quiet, removeHiddenHebrew: true })
        .then(doAlignmentQuery)
        .then(tokenLookup => {
          processRecords(tokenLookup);
        })
        .catch((err) => {
          if (!quiet) console.error(err);
          reject(err);
        });
    } else {
      if (!quiet) console.log('Skipping resource loading - using existing GLQuotes');
      processRecords(null);
    }
  });
}
