# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test               # Run all tests (Jest)
npm run build          # Build to dist/ via Vite
npm run styleguide     # Serve interactive component docs
```

To run a single test, use the `only: true` property on a test case object in `src/index.test.js`, then run `npm test`.

## Architecture

This package converts biblical quotes between original languages (Hebrew/Greek) and Gateway Languages in TSV files. It resolves alignment data from USFM Bible resources hosted on DCS (Door43 Content Service).

### Two exported functions (`src/index.js`)

- **`addGLQuoteCols(params)`** — Takes a TSV with original-language quotes, fetches aligned Bible resources from DCS via Proskomma, and returns the TSV with added GL (Gateway Language) quote and occurrence columns.
- **`convertGLQuotes2OLQuotes(params)`** — Reverse direction: takes GL quotes and maps them back to original-language quotes.

### Core pipeline (`src/core/`)

1. **`loadResourceFilesIntoProskomma.js`** — Fetches USFM Bible resources (original + target language) from DCS via HTTP, normalizes to NFC Unicode, and loads into a Proskomma instance.
2. **`doAlignmentQuery.js`** — Runs GraphQL queries against Proskomma to extract token and zaln (alignment milestone) data.
3. **`getAlignedQuote.js`** — Core alignment algorithm: matches quote phrases in source tokens (using occurrence counting) and maps to target tokens via alignment data.

### Utilities (`src/utils/`)

- **`parseBibleReference.js`** — Parses references like `"1:1-3"` into arrays of chapter/verse pairs.
- **`findPhraseInSentence.js`** — Finds phrase occurrences in tokenized text.
- **`generateNextQuoteCombination.js`** — Generates quote variations for fuzzy matching when exact match fails.
- **`rejig_alignment.js`** — Preprocesses USFM alignment information before querying.

### Tests

Tests in `src/index.test.js` are integration tests that make live HTTP requests to DCS to fetch real Bible data. `TEST_TIMEOUT` is set to 1,000,000 ms. Each test case object can have `only: true` to run that single case in isolation.

### Build output

Vite builds a single ES module: `dist/tsv-quote-converters.mjs`. The package exposes this as both `main` and `module` in `package.json`.
