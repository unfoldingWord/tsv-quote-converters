```js
import { convertGLQuotes2OLQuotes } from '../core/convertGLQuotes2OLQuotes.js';
import { parse } from 'csv-parse/sync';

const defaultBookCode = 'jhn';
const defaultTsvInput = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:10	krcb		rc://*/ta/man/translate/figs-metonymy	the world	2	This is the note`;
const defaultTsvFileURL = `https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/tn_${defaultBookCode.toUpperCase()}.tsv`;
const defaultBibleToUse = `unfoldingWord/en_ult/master`;

function handleFetchTSVContent(e) {
  e.preventDefault();
  fetch(document.querySelector('#convertGLQuotes #tsvFileURL').value)
    .then((response) => response.text())
    .then((data) => {
      const normalizedData = data.replace(/\r\n?/g, '\n');
      document.querySelector('#convertGLQuotes #tsvInput').value = normalizedData;
    });
}

function submitForm(e) {
  e.preventDefault();
  const submitButton = e.target.querySelector('button[type="submit"]');
  const spinner = document.createElement('span');
  spinner.className = 'fas fa-spinner fa-spin';
  submitButton.appendChild(spinner);
  convertGLQuotes2OLQuotes({
    bibleLinks: [e.target.elements.bibleToUse.value],
    bookCode: e.target.elements.bookCode.value,
    tsvContent: e.target.elements.tsvInput.value,
    trySeparatorsAndOccurrences: true
  }).then((results) => {
    spinner.remove();
    document.querySelector('#convertGLQuotes #results').value = results.output || 'No results';
    document.querySelector('#convertGLQuotes #errors').value = results.errors.join('\n') || 'No errors';
  });
}

// wrapped in a React fragment for rendering output:
<div id="convertGLQuotes">
  <form onSubmit={submitForm}>
    <h3>GL Bible that the Quotes column currently displays:</h3>
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
    <strong>TSV w/OrigLang Quotes:</strong>
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
