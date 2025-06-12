import axios from 'axios';
import { Proskomma } from 'proskomma-core';
import { rejigAlignment } from '../utils/rejig_alignment';
import { BibleBookData } from '../common/books';

/**
 * Load resource files into Proskomma
 * @param {Array} bibeLinks - Array of DCS owner/repo/ref links
 * @param {string} bookCode - The book code to process
 * @param {string} [dcsUrl='https://git.door43.org'] - The DCS URL
 * @returns {Promise<Proskomma>} The Proskomma object
 */
export async function loadResourceFilesIntoProskomma({ bibleLinks, bookCode, dcsUrl = 'https://git.door43.org', quiet = true, removeHiddenHebrew = false }) {
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
  const olBibleUrl = `${dcsUrl}/api/v1/repos/unfoldingWord/${ol_bible}`;
  let ol_ref;
  try {
    const response = await axios.get(olBibleUrl);
    ol_ref = response.data.catalog.prod.branch_or_tag_name;
  } catch (error) {
    if (!quiet) console.error(`ERROR: Unable to fetch data from ${olBibleUrl}`, error);
    if (!quiet) console.error(`Using master branch for ${ol_bible}`);
    ol_ref = 'master';
  }
  const baseURLs = [['unfoldingWord', ol_bible, `${dcsUrl}/api/v1/repos/unfoldingWord/${ol_bible}/contents/${BibleBookData[bookCode].usfm}.usfm?ref=${ol_ref}`]];
  for (const link of bibleLinks) {
    let [org, repo, ref] = link.split('/');
    if (!org || !repo) {
      throw new Error(`Invalid DCS link: ${link}`);
    }
    if (!ref) {
      ref = 'master';
    }
    baseURLs.push([org, repo, `${dcsUrl}/api/v1/repos/${org}/${repo}/contents/${BibleBookData[bookCode].usfm}.usfm?ref=${ref}`]);
  }
  console.log('Download USFM');
  for (const [org, repo, baseURL] of baseURLs) {
    const selectors = {
      org,
      repo,
    };
    if (!quiet) console.log(`  ${org}/${repo}`);
    let content = [];
    await axios.request({ method: 'get', url: baseURL }).then(async (response) => {
      let decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

      // Remove hidden character U+2060 (word joiner) from Hebrew text
      if (removeHiddenHebrew) {
        // decodedContent = decodedContent.replace(/\u2060/g, '');
        console.log(`      Removed word joiner characters (U+2060) from Hebrew text`);
      } else {
        console.log(`      No Hebrew text found`);
      }

      content.push(decodedContent);
    });
    if (content.length === 0) {
      if (!quiet) console.log(`      Book ${bookCode} not found`);
      continue;
    }
    if (!quiet) console.log(`      Downloaded ${bookCode} ${content.length.toLocaleString()} bytes`);

    if (repo !== 'hbo_uhb' && repo !== 'el-x-koine_ugnt') {
      content = [rejigAlignment(content)]; // Tidy-up USFM alignment info
    }
    try {
      pk.importDocuments(selectors, 'usfm', content, {});
    } catch (err) {
      if (!err.message.includes('already exists in docSet')) {
        if (!quiet) console.error(`ERROR: ${err}`);
      }
    }
  }
  return pk;
}

