```js
import { addGLQuoteCols } from '../core/addGLQuoteCols.js';
import { parse } from 'csv-parse/sync';

const defaultBookCode = 'eph';
const defaultTsvInput = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	ilf2		rc://*/ta/man/translate/writing-participants	Παῦλος, ἀπόστολος Χριστοῦ Ἰησοῦ & τοῖς ἁγίοις τοῖς οὖσιν	1	Your language may have a particular way of introducing the author of a letter and the intended audience. Alternate translation: [I, Paul, an apostle of Jesus Christ … write this letter to you, God’s holy people]
`;
const defaultTsvFileURL = `https://git.door43.org/worldview/en_sq/raw/branch/master/sq_${defaultBookCode.toUpperCase()}.tsv`;
const defaultBiblesToUse = `worldview/en_bsb/master`;

function handleFetchTSVContent(e) {
  e.preventDefault();
  fetch(document.querySelector('#addGLQuoteCols #tsvFileURL').value)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('tsvInput').value = data;
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
    trySeparatorsAndOccurrences: true
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
    <textarea name="tsvInput" id="tsvInput" rows="10" cols="100" style={{ whiteSpace: 'nowrap', overflow: 'auto' }} defaultValue={defaultTsvInput} />
    <br />
    <button type="submit">Submit&nbsp;</button>
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
