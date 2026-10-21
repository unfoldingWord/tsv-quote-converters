// Unit tests for supplying Bible content instead of downloading it.
// axios is mocked: nothing here touches the network.
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { loadResourceFilesIntoProskomma } from './loadResourceFilesIntoProskomma';
import { addGLQuoteCols } from './addGLQuoteCols';

jest.mock('axios');

const FIXTURES = path.join(__dirname, '../../fixtures/bibles');
const read = (f) => fs.readFileSync(path.join(FIXTURES, f), 'utf8');

const ULT_LINK = 'unfoldingWord/en_ult/v91';
const UGNT_LINK = 'unfoldingWord/el-x-koine_ugnt/v0.34';
const ultUsfm = read('en_ult_v91_3jn.usfm');
const ugntUsfm = read('ugnt_v0.34_3jn.usfm');
// A handful of rows is enough to prove the alignment ran; the whole file is slow.
const tnTsv = read('en_tn_v91_3jn.tsv').split('\n').slice(0, 16).join('\n');

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

// Serve the fixtures the way the DCS contents API does.
function serveFixtures() {
  axios.get.mockImplementation(async (url) => {
    if (url.endsWith('/repos/unfoldingWord/el-x-koine_ugnt')) {
      return { data: { catalog: { prod: { branch_or_tag_name: 'v0.34' } } } };
    }
    throw new Error(`unexpected GET ${url}`);
  });
  axios.request.mockImplementation(async ({ url }) => {
    if (url.includes('/en_ult/contents/65-3JN.usfm')) return { data: { content: b64(ultUsfm) } };
    if (url.includes('/el-x-koine_ugnt/contents/65-3JN.usfm')) return { data: { content: b64(ugntUsfm) } };
    throw new Error(`unexpected request ${url}`);
  });
}

function refuseNetwork() {
  axios.get.mockImplementation(async (url) => {
    throw new Error(`network call not allowed: GET ${url}`);
  });
  axios.request.mockImplementation(async ({ url }) => {
    throw new Error(`network call not allowed: ${url}`);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadResourceFilesIntoProskomma with supplied content', () => {
  test('imports supplied USFM without any HTTP call', async () => {
    refuseNetwork();
    const pk = await loadResourceFilesIntoProskomma({
      bibleLinks: [ULT_LINK],
      bookCode: '3jn',
      bibleContents: { [ULT_LINK]: ultUsfm },
      olBibleContent: ugntUsfm,
    });
    expect(axios.get).not.toHaveBeenCalled();
    expect(axios.request).not.toHaveBeenCalled();
    const { data } = await pk.gqlQuery('{ docSets { repo: selector(id:"repo") documents { book: header(id:"bookCode") } } }');
    const repos = data.docSets.map((d) => d.repo).sort();
    expect(repos).toEqual(['el-x-koine_ugnt', 'en_ult']);
    expect(data.docSets.every((d) => d.documents[0].book === '3JN')).toBe(true);
  });

  test('downloads only the links without content, and pins the original-language ref from olBibleLink', async () => {
    serveFixtures();
    await loadResourceFilesIntoProskomma({
      bibleLinks: [ULT_LINK],
      bookCode: '3jn',
      olBibleLink: UGNT_LINK,
      bibleContents: { [ULT_LINK]: ultUsfm },
    });
    // No production-release lookup: the ref was given.
    expect(axios.get).not.toHaveBeenCalled();
    // Exactly one download, for the original-language book, at the pinned ref.
    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request.mock.calls[0][0].url).toContain('/el-x-koine_ugnt/contents/65-3JN.usfm?ref=v0.34');
  });

  test('warns and downloads when a bibleContents key matches no link', async () => {
    serveFixtures();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await loadResourceFilesIntoProskomma({
      bibleLinks: [ULT_LINK],
      bookCode: '3jn',
      olBibleContent: ugntUsfm,
      bibleContents: { en_ult: ultUsfm, 'unfoldingWord/en_ult/master': ultUsfm },
      quiet: false,
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('match no bibleLinks entry'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('en_ult, unfoldingWord/en_ult/master'));
    expect(axios.request).toHaveBeenCalledTimes(1); // the ULT was downloaded after all
    expect(axios.request.mock.calls[0][0].url).toContain('/en_ult/contents/65-3JN.usfm?ref=v91');
    warn.mockRestore();
  });

  test('rejects a malformed olBibleLink or bibleLinks entry', async () => {
    refuseNetwork();
    await expect(
      loadResourceFilesIntoProskomma({ bibleLinks: [ULT_LINK], bookCode: '3jn', olBibleLink: 'el-x-koine_ugnt' })
    ).rejects.toThrow('Invalid DCS link: el-x-koine_ugnt');
    await expect(
      loadResourceFilesIntoProskomma({ bibleLinks: ['https://git.door43.org/unfoldingWord/en_ult'], bookCode: '3jn', olBibleContent: ugntUsfm })
    ).rejects.toThrow('Invalid DCS link');
    expect(axios.request).not.toHaveBeenCalled();
  });

  test('honours only the owner and ref of olBibleLink, warning when its repo is not the canonical one', async () => {
    serveFixtures();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await loadResourceFilesIntoProskomma({
      bibleLinks: [ULT_LINK],
      bookCode: '3jn',
      olBibleLink: 'Door43-Catalog/ugnt/v0.34',
      bibleContents: { [ULT_LINK]: ultUsfm },
      quiet: false,
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('is not the original-language repo for 3JN (el-x-koine_ugnt)'));
    expect(axios.request).toHaveBeenCalledTimes(1);
    expect(axios.request.mock.calls[0][0].url).toContain('/repos/Door43-Catalog/el-x-koine_ugnt/contents/65-3JN.usfm?ref=v0.34');
    warn.mockRestore();
  });

  test('falls back to downloading everything when no content is supplied', async () => {
    serveFixtures();
    await loadResourceFilesIntoProskomma({ bibleLinks: [ULT_LINK], bookCode: '3jn' });
    expect(axios.get).toHaveBeenCalledTimes(1); // production-release lookup for the OL Bible
    expect(axios.request).toHaveBeenCalledTimes(2); // OL book + ULT book
  });
});

describe('addGLQuoteCols with supplied content', () => {
  test('produces the same output as the download path, with no HTTP calls', async () => {
    serveFixtures();
    const downloaded = await addGLQuoteCols({
      bibleLinks: [ULT_LINK],
      bookCode: '3jn',
      tsvContent: tnTsv,
      trySeparatorsAndOccurrences: true,
    });
    expect(axios.request).toHaveBeenCalledTimes(2);

    jest.clearAllMocks();
    refuseNetwork();
    const supplied = await addGLQuoteCols({
      bibleLinks: [ULT_LINK],
      bookCode: '3jn',
      tsvContent: tnTsv,
      trySeparatorsAndOccurrences: true,
      bibleContents: { [ULT_LINK]: ultUsfm },
      olBibleLink: UGNT_LINK,
      olBibleContent: ugntUsfm,
    });
    expect(axios.get).not.toHaveBeenCalled();
    expect(axios.request).not.toHaveBeenCalled();

    expect(supplied.output).toBe(downloaded.output);
    expect(supplied.errors).toEqual(downloaded.errors);

    // And the alignment really ran: 3 John 1:1 "ὁ πρεσβύτερος" → "The elder".
    const rows = supplied.output.split('\n').map((l) => l.split('\t'));
    const header = rows[0];
    const glQuoteIdx = header.indexOf('GLQuote');
    expect(glQuoteIdx).toBeGreaterThan(-1);
    const row11 = rows.find((r) => r[0] === '1:1' && r[1] === 'w99t');
    expect(row11[glQuoteIdx]).toBe('The elder');
  });
});
