# TSV Quote Converters package (tsv-quote-converters)

A Node.js package for converting quotes between original biblical languages (Greek/Hebrew) and Gateway Languages in TSV files.

## Installation

```bash
npm install tsv-quote-converters
```

## Features

- Convert original language quotes to Gateway Language quotes (`addGLQuoteCols`)
- Convert Gateway Language quotes back to original language quotes (`convertGLQuotes2OLQuotes`)
- Handles complex quote alignments and multiple occurrences
- Supports multiple target Gateway Language Bibles
- Maintains TSV format integrity

## Usage

### Adding Gateway Language Quote Columns

Convert original language quotes to Gateway Language quotes by adding new columns:

```javascript
import { addGLQuoteCols } from 'tsv-quote-converters';

const params = {
  // Required parameters
  bibleLinks: ['unfoldingWord/en_ult/master'],  // Array of Bible repos to use
  bookCode: 'eph',                              // Bible book code (e.g., 'eph', 'gen')
  tsvContent: yourTsvString,                    // TSV content with 'Quote' column

  // Optional parameters
  trySeparatorsAndOccurrences: true,           // Try different quote separators
};

const result = await addGLQuoteCols(params);
console.log(result.output);  // Modified TSV with new GLQuote/GLOccurrence columns
console.log(result.errors);  // Array of any errors encountered
```

### Converting Gateway Language Quotes to Original Language

Convert Gateway Language quotes in the Quote column back to original language:

```javascript
import { convertGLQuotes2OLQuotes } from 'tsv-quote-converters';

const params = {
  // Required parameters
  bibleLinks: ['unfoldingWord/en_ult/master'],  // Bible used for current quotes
  bookCode: 'eph',                              // Bible book code
  tsvContent: yourTsvString,                    // TSV content with GL quotes

  // Optional parameters
  trySeparatorsAndOccurrences: true,           // Try different quote separators
};

const result = await convertGLQuotes2OLQuotes(params);
console.log(result.output);  // Modified TSV with original language quotes
console.log(result.errors);  // Array of any errors encountered
```

## Input TSV Format

Your input TSV must include these columns:
- `Reference` - Chapter:verse reference
- `Quote` - The quote to convert
- `Occurrence` - Occurrence number of the quote

Example input:
```
Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	abc1			Παῦλος	1	Note text here
```

## Output Format

### addGLQuoteCols
Adds two columns per target Bible:
- `GLQuote` - The converted Gateway Language quote
- `GLOccurrence` - The occurrence number in the Gateway Language

### convertGLQuotes2OLQuotes
Updates existing columns:
- `Quote` - Replaced with original language quote
- `Occurrence` - Updated to match original language occurrence

## Error Handling

Both functions return an object with:
- `output` - The modified TSV content (string)
- `errors` - Array of error messages for any failed conversions

## Live Demo

Try it out in our [interactive documentation](https://unfoldingword.github.io/tsv-quote-converters/)

## Contributing

Visit our [GitHub repository](https://github.com/unfoldingWord/tsv-quote-converters) to contribute.

## License

ISC

See: [LICENSE.md](https://github.com/unfoldingWord/tsv-quote-converters/blob/main/LICENSE.md)
```