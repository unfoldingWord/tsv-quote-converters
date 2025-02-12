```js
import { convertGLQuotes2OLQuotes } from '../core/convertGLQuotes2OLQuotes.js';
import { parse } from 'csv-parse/sync';

const defaultBookCode = 'eph';
const defaultTsvInput = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	ilf2		rc://*/ta/man/translate/writing-participants	Paul, an apostle of Christ Jesus & to the saints, the ones being	1	Your language may have a particular way of introducing the author of a letter and the intended audience. Alternate translation: [I, Paul, an apostle of Jesus Christ … write this letter to you, God’s holy people]

`;
const defaultTsvFileURL = `https://git.door43.org/unfoldingWord/en_tn/raw/branch/master/tn_${defaultBookCode.toUpperCase()}.tsv`;
const defaultBiblesToUse = `unfoldingWord/en_ult/master`;

function handleFetchTSVContent(e) {
  e.preventDefault();
  fetch(document.querySelector('#convertGLQuotes #tsvFileURL').value)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('tsvInput').value = data;
    });
}

function submitForm(e) {
  e.preventDefault();
  console.log(e.target.elements.biblesToUse.value);
  convertGLQuotes2OLQuotes({
    bibleLinks: e.target.elements.biblesToUse.value.split('\n').filter((v) => v.trim()),
    bookCode: e.target.elements.bookCode.value,
    tsvContent: e.target.elements.tsvInput.value,
    trySeparatorsAndOccurrences: true
  }).then((results) => {
    document.querySelector('#convertGLQuotes #results').value = results.output || 'No results';
    document.querySelector('#convertGLQuotes #errors').value = results.errors.join('\n') || 'No errors';
  });
}

// wrapped in a React fragment for rendering output:
<div id="convertGLQuotes">
  <form onSubmit={submitForm}>
    <h3>Target Bibles to Get Quotes From:</h3>
    <p> (one per line)</p>
    <textarea name="biblesToUse" cols="100" rows="3" defaultValue={defaultBiblesToUse} />
    <h3>Bible Book Code:</h3>
    <input type="text" name="bookCode" defaultValue={defaultBookCode} />
    <h3>TSV Input:</h3>
    <input nae="tsvFileURL" id="tsvFileURL" type="text" size="70" defaultValue={defaultTsvFileURL} /> <button onClick={handleFetchTSVContent}>Fetch</button> or paste below
    <br />
    <textarea name="tsvInput" id="tsvInput" rows="10" cols="100" style={{ whiteSpace: 'nowrap', overflow: 'auto' }} defaultValue={defaultTsvInput} />
    <br />
    <button type="submit">Submit</button>
  </form>
  <p>
    <strong>TSV w/Quotes:</strong>
  </p>
  <textarea name="results" rows="10" cols="100" style={{ whiteSpace: 'nowrap', overflow: 'auto' }} id="results"></textarea>
  <p>
    <strong>Errors:</strong>
  </p>
  <textarea name="errors" rows="10" cols="100" style={{ whiteSpace: 'nowrap', overflow: 'auto' }} id="errors"></textarea>
</div>;
```
