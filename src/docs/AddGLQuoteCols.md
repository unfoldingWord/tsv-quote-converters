## Add GL Quote Columns

Adds two columns per target Bible as GLQuote and GLOccurrence. If there are two or more Bibles given, GLQuote/Occurrence will be suffixed with the Bible's repo name, .e.g. GLQuote:en_ult 

```js
import { addGLQuoteCols } from '../core/addGLQuoteCols.js';
import { parse } from 'csv-parse/sync';

const defaultBookCode = 'jhn';
const defaultTsvInput = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:10	krcb		rc://*/ta/man/translate/figs-metonymy	ὁ κόσμος	1	This is the note`;
const defaultTsvFileURL = `https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/tn_${defaultBookCode.toUpperCase()}.tsv`;
const defaultBiblesToUse = `unfoldingWord/en_ult/master`;

function handleFetchTSVContent(e) {
  e.preventDefault();
  fetch(document.querySelector('#addGLQuoteCols #tsvFileURL').value)
    .then((response) => response.text())
    .then((data) => {
      // Normalize line endings
      const normalizedData = data.replace(/\r\n?/g, '\n');
      document.querySelector('#addGLQuoteCols #tsvInput').value = normalizedData;
    });
}

function submitForm(e) {
  e.preventDefault();
  const submitButton = e.target.querySelector('button[type="submit"]');
  const spinner = document.createElement('span');
  spinner.className = 'fas fa-spinner fa-spin';
  submitButton.appendChild(spinner);
  addGLQuoteCols({
    bibleLinks: e.target.elements.biblesToUse.value.split('\n').filter((v) => v.trim()),
    bookCode: e.target.elements.bookCode.value,
    tsvContent: e.target.elements.tsvInput.value,
    trySeparatorsAndOccurrences: true,
    usePreviousGLQuotes: true,
    quiet: false,
  }).then((results) => {
    spinner.remove();
    document.querySelector('#addGLQuoteCols #results').value = results.output || 'No results';
    document.querySelector('#addGLQuoteCols #errors').value = results.errors.join('\n') || 'No errors';
  });
}

// wrapped in a React fragment for rendering output:
<div id="addGLQuoteCols">
  <form onSubmit={submitForm}>
    <h3>Target Bibles to Get Quotes From:</h3>
    <p> (one per line)</p>
    <textarea name="biblesToUse" cols="30" rows="3" defaultValue={defaultBiblesToUse} />
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
    <strong>TSV w/GL Quotes:</strong>
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
