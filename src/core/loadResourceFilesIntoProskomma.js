import axios from 'axios';
import { Proskomma } from 'proskomma-core';
import { rejigAlignment } from '../utils/rejig_alignment';
import { BibleBookData } from '../common/books';

const OL_REPOS = new Set(['hbo_uhb', 'el-x-koine_ugnt']);

/**
 * Prepare a USFM string for import, whether it was downloaded or supplied by the caller.
 *
 * Normalize to NFC to ensure consistent Unicode combining character order.
 * Hebrew text in different USFM files may have combining characters (e.g., dagesh
 * and sheva) in different orders. For example, the UHB may store "dagesh then sheva"
 * while ULT x-content stores "sheva then dagesh" (NFC canonical order). Without
 * normalization, the string comparison in getAlignedQuote would fail even when the
 * characters are visually identical.
 *
 * Gateway Language Bibles also get their alignment milestones folded into a single
 * x-align attribute (see rejigAlignment); the original-language Bibles carry no
 * alignment and are imported as-is.
 */
function prepareUsfm(content, repo) {
  const normalized = String(content).normalize('NFC');
  return OL_REPOS.has(repo) ? normalized : rejigAlignment(normalized);
}

/**
 * Split an `owner/repo/ref` link into its parts. `ref` defaults to `master`.
 */
function parseLink(link) {
  const [org, repo, ref] = String(link).split('/');
  if (!org || !repo) {
    throw new Error(`Invalid DCS link: ${link}`);
  }
  return { org, repo, ref: ref || 'master' };
}

/**
 * Load resource files into Proskomma
 *
 * Every Bible is either taken from the content the caller already holds, or
 * downloaded from DCS. A caller that has fetched the USFM for its own purposes
 * (a renderer, a cache) passes it in so the same file is not downloaded again.
 *
 * @param {Array} bibleLinks - Array of DCS owner/repo/ref links for the Gateway Language Bibles
 * @param {string} bookCode - The book code to process
 * @param {string} [dcsUrl='https://git.door43.org'] - The DCS URL
 * @param {boolean} [quiet=true] - Whether to suppress console output
 * @param {Object<string,string>} [bibleContents={}] - USFM content for the requested book,
 *   keyed by the exact `owner/repo/ref` string used in `bibleLinks`. A link with an entry
 *   here is imported from that content instead of being downloaded.
 * @param {string} [olBibleLink] - `owner/repo/ref` of the original-language Bible to use
 *   (hbo_uhb for Old Testament books, el-x-koine_ugnt for New Testament). When omitted,
 *   the unfoldingWord repo's current production release is looked up on DCS, as before.
 * @param {string} [olBibleContent] - USFM content of the original-language book. When
 *   given, the original-language Bible is not downloaded (and not looked up).
 * @returns {Promise<Proskomma>} The Proskomma object
 */
export async function loadResourceFilesIntoProskomma({
  bibleLinks,
  bookCode,
  dcsUrl = 'https://git.door43.org',
  quiet = true,
  bibleContents = {},
  olBibleLink,
  olBibleContent,
}) {
  bookCode = bookCode.toLowerCase();

  const pk = new Proskomma([
    {
      name: 'org',
      type: 'string',
      regex: '^[^\\s]+$',
    },
    {
      name: 'repo',
      type: 'string',
      regex: '^[A-za-z0-9_-]+$',
    },
  ]);

  if (!bibleLinks || bibleLinks.length < 1) {
    return;
  }

  const ol_bible = BibleBookData?.[bookCode]?.testament === 'old' ? 'hbo_uhb' : 'el-x-koine_ugnt';
  if (!ol_bible) {
    if (!quiet) console.error(`ERROR: Book ${bookCode} not a valid Bible book`);
    return;
  }

  // The original-language Bible. The Proskomma selector keeps the canonical repo
  // name (hbo_uhb / el-x-koine_ugnt) because the alignment lookups are keyed by it;
  // olBibleLink only decides where (and which ref) the book comes from.
  let olOrg = 'unfoldingWord';
  let olRef;
  if (olBibleLink) {
    const parsed = parseLink(olBibleLink);
    olOrg = parsed.org;
    olRef = parsed.ref;
    if (parsed.repo !== ol_bible && !quiet) {
      console.warn(`olBibleLink repo ${parsed.repo} is not ${ol_bible}; importing it as ${ol_bible}`);
    }
  }
  if (olBibleContent == null && !olRef) {
    const olBibleUrl = `${dcsUrl}/api/v1/repos/unfoldingWord/${ol_bible}`;
    try {
      const response = await axios.get(olBibleUrl);
      olRef = response.data.catalog.prod.branch_or_tag_name;
    } catch (error) {
      if (!quiet) console.error(`ERROR: Unable to fetch data from ${olBibleUrl}`, error);
      if (!quiet) console.error(`Using master branch for ${ol_bible}`);
      olRef = 'master';
    }
  }

  const usfmFile = `${BibleBookData[bookCode].usfm}.usfm`;
  const sources = [
    {
      org: olOrg,
      repo: ol_bible,
      url: olRef ? `${dcsUrl}/api/v1/repos/${olOrg}/${ol_bible}/contents/${usfmFile}?ref=${olRef}` : null,
      content: olBibleContent,
    },
  ];
  for (const link of bibleLinks) {
    const { org, repo, ref } = parseLink(link);
    sources.push({
      org,
      repo,
      url: `${dcsUrl}/api/v1/repos/${org}/${repo}/contents/${usfmFile}?ref=${ref}`,
      content: bibleContents?.[link],
    });
  }

  if (!quiet) console.log('Loading USFM');
  for (const { org, repo, url, content } of sources) {
    const selectors = {
      org,
      repo,
    };
    if (!quiet) console.log(`  ${org}/${repo}`);
    let usfm = null;
    if (content != null) {
      usfm = String(content);
      if (!quiet) console.log(`      Using supplied ${bookCode} ${usfm.length.toLocaleString()} bytes`);
    } else {
      await axios.request({ method: 'get', url }).then((response) => {
        usfm = Buffer.from(response.data.content, 'base64').toString('utf-8');
      });
      if (usfm != null && !quiet) console.log(`      Downloaded ${bookCode} ${usfm.length.toLocaleString()} bytes`);
    }
    if (!usfm) {
      if (!quiet) console.log(`      Book ${bookCode} not found`);
      continue;
    }

    try {
      pk.importDocuments(selectors, 'usfm', [prepareUsfm(usfm, repo)], {});
    } catch (err) {
      if (!err.message.includes('already exists in docSet')) {
        if (!quiet) console.error(`ERROR: ${err}`);
      }
    }
  }
  return pk;
}
