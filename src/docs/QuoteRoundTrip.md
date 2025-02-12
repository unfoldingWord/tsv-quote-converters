```js
import { addGLQuoteCols } from '../core/addGLQuoteCols.js';
import { convertGLQuotes2OLQuotes } from '../core/convertGLQuotes2OLQuotes.js';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const defaultBookCode = 'eph';
const defaultTsvInput = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	ilf2		rc://*/ta/man/translate/writing-participants	Παῦλος, ἀπόστολος Χριστοῦ Ἰησοῦ & τοῖς ἁγίοις τοῖς οὖσιν	1	Your language may have a particular way of introducing the author of a letter and the intended audience. Alternate translation: [I, Paul, an apostle of Jesus Christ … write this letter to you, God’s holy people]
`;
const defaultTsvFileURL = `https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/tn_${defaultBookCode.toUpperCase()}.tsv`;
const defaultBibleToUse = `unfoldingWord/en_ult/master`;

function handleFetchTSVContent(e) {
  e.preventDefault();
  fetch(document.querySelector('#quoteRoundTrip #tsvFileURL').value)
    .then((response) => response.text())
    .then((data) => {
      const normalizedData = data.replace(/\r\n?/g, '\n');
      document.querySelector('#quoteRoundTrip #tsvInput').value = normalizedData;
    });
}

function submitForm(e) {
  e.preventDefault();
  const submitButton = e.target.querySelector('button[type="submit"]');
  const spinner = document.createElement('span');
  spinner.className = 'fas fa-spinner fa-spin';
  submitButton.appendChild(spinner);
  addGLQuoteCols({
    bibleLinks: [e.target.elements.bibleToUse.value],
    bookCode: e.target.elements.bookCode.value,
    tsvContent: e.target.elements.tsvInput.value,
    trySeparatorsAndOccurrences: true,
  }).then((results) => {
    let tsvRecords = parse(results.output, {
      columns: true,
      delimiter: '\t',
      skip_empty_lines: true,
    });
    tsvRecords.forEach((rec) => {rec['Quote'] = rec['GLQuote']; rec['Occcurence'] = rec['GLOccurrence']});
    const outputTsv = stringify(tsvRecords, {
      header: true,
      delimiter: '\t',
      columns: e.target.elements.tsvInput.value.split('\n')[0].split('\t'),
    });
    convertGLQuotes2OLQuotes({
      bibleLinks: [e.target.elements.bibleToUse.value],
      bookCode: e.target.elements.bookCode.value,
      tsvContent: outputTsv,
    }).then((results) => {
      spinner.remove();
      document.querySelector('#quoteRoundTrip #results').value = results.output || 'No results';
      document.querySelector('#quoteRoundTrip #errors').value = results.errors.join('\n') || 'No errors';
    });
  });
}

// wrapped in a React fragment for rendering output:
<div id="quoteRoundTrip">
  <form onSubmit={submitForm}>
    <h3>GL Bible to use to Align Quate Column:</h3>
    <input type="text" name="bibleToUse" size="30" defaultValue={defaultBibleToUse} />
    <h3>Bible Book Code:</h3>
    <input type="text" name="bookCode" defaultValue={defaultBookCode} />
    <h3>TSV Input:</h3>
    <input nae="tsvFileURL" id="tsvFileURL" type="text" size="70" defaultValue={defaultTsvFileURL} /> <button onClick={handleFetchTSVContent}>Fetch</button> or paste below
    <br />
    <textarea 
      name="tsvInput" 
      id="tsvInput" 
      rows="10" 
      cols="100" 
      style={{ 
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        overflow: 'auto',
        fontFamily: 'monospace'
      }} 
      defaultValue={defaultTsvInput} 
    />
    <br />
    <button type="submit">Submit&nbsp;</button>
  </form>
  <p>
    <strong>TSV w/Fixed Quotes:</strong>
  </p>
  <textarea 
    name="results"
    id="results"
    rows="10"
    cols="100"
    style={{ 
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        overflow: 'auto',
        fontFamily: 'monospace'
      }}
  />
  <p>
    <strong>Errors:</strong>
  </p>
  <textarea 
    name="errors"
    id="errors"
    rows="10"
    cols="100"
    style={{ 
        whiteSpace: 'pre',
        overflowWrap: 'normal',
        overflow: 'auto',
        fontFamily: 'monospace'
      }}
  />
</div>;
```
