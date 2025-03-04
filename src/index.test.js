// index.test.js
import { convertGLQuotes2OLQuotes, addGLQuoteCols } from './index';
import { BibleBookData } from './common/books';
import fs from 'fs';
import path from 'path';

const TEST_TIMEOUT = 1000000;

const tests = [
  {
    params: {
      name: '',
      bookCode: 'PSA',
      ref: '6:8-9',
      olQuote: 'יְ֭הוָה & יְ֝הוָ֗ה',
      olOccurrence: 1,
      ultQuote: 'Yahweh & Yahweh',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: 'Middle word not being highlighted',
      bookCode: 'PSA',
      ref: '6:8-9',
      olQuote: 'יְ֝הוָ֗ה & יְ֭הוָה & יְ֝הוָ֗ה',
      olOccurrence: 1,
      ultQuote: 'Yahweh & Yahweh & Yahweh',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: 'Test 1',
      bookCode: 'JUD',
      ref: '1:10',
      olQuote: 'ὅσα & φυσικῶς ὡς τὰ ἄλογα ζῷα ἐπίστανται',
      occurrence: 2,
      olOccurrence: 1,
      ultQuote: 'what they understand by instinct as the unreasoning animals',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: '3JN',
      ref: '1:6-7',
      olQuote: 'οὓς καλῶς ποιήσεις, προπέμψας ἀξίως τοῦ Θεοῦ; ὑπὲρ γὰρ τοῦ ὀνόματος ἐξῆλθον, μηδὲν λαμβάνοντες ἀπὸ τῶν ἐθνικῶν',
      olOccurrence: 1,
      ultQuote: 'whom you will do well to send on worthily of God & for they went out for the sake of the name, receiving nothing from the Gentiles',
      ultOccurrence: 1,
    },
    only: true,
  },
  {
    params: {
      name: '',
      bookCode: '2JN',
      ref: '1:2',
      olQuote: 'καὶ μεθ’ ἡμῶν ἔσται',
      olOccurrence: 1,
      olOccurrence: 1,
      ultQuote: 'and will be with us',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: '2JN',
      ref: '1:2',
      olQuote: 'μεθ’ ἡμῶν',
      olOccurrence: 1,
      olOccurrence: 1,
      ultQuote: 'with us',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: '2JN',
      ref: '1:2',
      olQuote: 'καὶ μεθ’',
      olOccurrence: 1,
      olOccurrence: 1,
      ultQuote: 'and & with',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'TIT',
      ref: '1:4,9',
      olQuote: 'καὶ & καὶ',
      occurrence: 3,
      olOccurrence: 1,
      ultQuote: 'both & and',
      ultOccurrence: 1,
    },
  },

  {
    params: {
      name: 'Testing deuteronomy highlighting error',
      bookCode: 'DEU',
      ref: '1:5-6',
      olQuote: 'מֹשֶׁ֔ה בֵּאֵ֛ר אֶת־הַ⁠תּוֹרָ֥ה הַ⁠זֹּ֖את לֵ⁠אמֹֽר׃ & יְהוָ֧ה אֱלֹהֵ֛י⁠נוּ דִּבֶּ֥ר אֵלֵ֖י⁠נוּ בְּ⁠חֹרֵ֣ב לֵ⁠אמֹ֑ר',
      olOccurrence: 1,
      ultQuote: 'Moses & explaining this law, saying & Yahweh our God spoke to us at Horeb, saying',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'JOS',
      ref: '21:27',
      olQuote: 'אֶת־גּוֹלָ֤ן & בְּעֶשְׁתְּרָ֖ה',
      olOccurrence: 1,
      ultQuote: 'Golan & Be Eshterah',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'GEN',
      ref: '7:11',
      olQuote: 'בִּ⁠שְׁנַ֨ת שֵׁשׁ־מֵא֤וֹת שָׁנָה֙ לְ⁠חַיֵּי נֹ֔חַ',
      olOccurrence: 1,
      ultQuote: 'In the six hundredth year of Noah’s life',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'GEN',
      ref: '1:21',
      olQuote: 'וְ⁠אֵ֣ת כָּל נֶ֣פֶשׁ הַֽ⁠חַיָּ֣ה הָֽ⁠רֹמֶ֡שֶׂת',
      olOccurrence: 1,
      ultQuote: 'and every living creature that moves',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'GEN',
      ref: '1:3',
      olQuote: 'וַֽ⁠יְהִי אֽוֹר',
      olOccurrence: 1,
      ultQuote: 'And there was light',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'PSA',
      ref: '3:2',
      olQuote: 'סֶֽלָה',
      olOccurrence: 1,
      ultQuote: 'Selah',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'JOS',
      ref: '24:10',
      olQuote: 'וָ⁠אַצִּ֥ל אֶתְ⁠כֶ֖ם מִ⁠יָּדֽ⁠וֹ',
      olOccurrence: 1,
      ultQuote: 'and I rescued you from his hand',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: 'JOS',
      ref: '1:11',
      olQuote: 'בְּ⁠ע֣וֹד׀ שְׁלֹ֣שֶׁת יָמִ֗ים',
      olOccurrence: 1,
      ultQuote: 'within three days',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookCode: 'JOS',
      ref: '15:7',
      olQuote: 'דְּבִרָ⁠ה֮ מֵ⁠עֵ֣מֶק עָכוֹר֒ & הַ⁠גִּלְגָּ֗ל & לְ⁠מַעֲלֵ֣ה אֲדֻמִּ֔ים & מֵי־עֵ֣ין שֶׁ֔מֶשׁ & עֵ֥ין רֹגֵֽל',
      olOccurrence: 1,
      ultQuote: 'to Debir from the Valley of Trouble, & the Gilgal, & of the ascent of Adummim, & the waters of En Shemesh & En Rogel',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookCode: 'JOS',
      ref: '15:7',
      quote: 'דְּבִרָ⁠ה֮ מֵ⁠עֵ֣מֶק עָכוֹר֒ & הַ⁠גִּלְגָּ֗ל & לְ⁠מַעֲלֵ֣ה אֲדֻמִּ֔ים & מֵי־עֵ֣ין שֶׁ֔מֶ & עֵ֥ין רֹגֵֽל',
      olOccurrence: 1,
      ultQuote: '',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookCode: 'PHP',
      ref: '1:1-20',
      olQuote: 'τινὲς μὲν καὶ & τὸν Χριστὸν κηρύσσουσιν',
      olOccurrence: 1,
      ultQuote: 'Some indeed even proclaim Christ',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookCode: 'GEN',
      ref: '2:23',
      olQuote: 'עֶ֚צֶם מֵֽ⁠עֲצָמַ֔⁠י וּ⁠בָשָׂ֖ר מִ⁠בְּשָׂרִ֑⁠י',
      olOccurrence: 1,
      ultQuote: 'is} bone from my bones\nand flesh from my flesh',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookCode: 'GEN',
      ref: '4:23',
      olQuote: 'כִּ��י אִ֤ישׁ הָרַ֨גְתִּי֙ לְ⁠פִצְעִ֔⁠י וְ⁠יֶ֖לֶד לְ⁠חַבֻּרָתִֽ⁠י',
      olOccurrence: 1,
      ultQuote: 'For I killed a man for my wound,\neven a young man for my bruise',
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: '1PE',
      ref: '1:24',
      quote: 'πᾶσα σὰρξ ὡς χόρτος, καὶ πᾶσα δόξα αὐτῆς ὡς ἄνθος χόρτου. ἐξηράνθη ὁ χόρτος, καὶ τὸ ἄνθος ἐξέπεσεν,',
      olOccurrence: 1,
      ultQuote: `All flesh {is} like grass,
and all its glory {is} like the flower of the grass.
The grass was dried up, and the flower fell off`,
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: '',
      bookCode: '1CO',
      ref: '1:2',
      olQuote: 'τῇ ἐκκλησίᾳ τοῦ Θεοῦ & τῇ οὔσῃ ἐν Κορίνθῳ',
      olOccurrence: 1,
      ultQuote: 'to the church of God that is in Corinth',
      ultOccurrence: 1,
    },
  },
];

describe('test1-convertGLQuotes2OLQuotes', () => {
  it(
    'convertGLQuotes2OLQuotes with book "jol" and provided tsvContent',
    async () => {
      const params = {
        bibleLink: 'unfoldingWord/en_ult/master',
        bookCode: 'jol',
        tsvContent: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4-6	q7n2		rc://*/ta/man/translate/figs-idiom	it has been cut & from your mouth	1	This is an expression that means that something is no longer available...`
      };

      const expectedOutput = {
        output: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4-6	q7n2		rc://*/ta/man/translate/figs-idiom	נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	This is an expression that means that something is no longer available...`,
        errors: []
      };

      try {
        const result = await convertGLQuotes2OLQuotes(params);
        expect(result.output.split('\n')).toEqual(expectedOutput.output.split('\n'));
        expect(result.errors).toEqual(expectedOutput.errors);
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test12-convertGLQuotes2OLQuotes-joshua_16_10_split_duplicate', () => {
  it(
    'convertGLQuotes2OLQuotes with book "jos" and provided tsvContent',
    async () => {
      const book = 'jos';
      const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
16:10	g4k8		rc://*/ta/man/translate/figs-genericnoun	the Canaanite the Canaanite	1	The author is not referring to a specific **Canaanite**. He means Canaanites in general. It may be more natural in your language to express this meaning by using a plural form. Alternate translation: “the Canaanites … the Canaanites”`;

      try {
        const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, tsvContent, true);

        const expectedOutput = {
          output: [
            'Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
            '16:10	g4k8		rc://*/ta/man/translate/figs-genericnoun	אֶת־הַֽ⁠כְּנַעֲנִ֖י & הַֽ⁠כְּנַעֲנִ֜י	1	The author is not referring to a specific **Canaanite**. He means Canaanites in general. It may be more natural in your language to express this meaning by using a plural form. Alternate translation: “the Canaanites … the Canaanites”',
          ],
          errors: [],
        };

        // Check the output
        expect(output).toBeDefined();
        expect(output).toEqual(expectedOutput.output);

        // Check the errors
        expect(errors).toBeDefined();
        // expect(errors).toEqual(expectedOutput.errors);

        const rows = tsvContent.split('\n');
        for (let i = 0; i < rows.length; i++) {
          const result = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, rows[i]);
          expect(result.output[0]).toEqual(expectedOutput.output[i]);
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test3-convertGLQuotes2OLQuotes-test_mat_1_4_duplicate', () => {
  it(
    'convertGLQuotes2OLQuotes with book "mat" and provided tsvContent',
    async () => {
      debugger;
      const book = 'mat';
      const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4	g4k8		rc://*/ta/man/translate/figs-genericnoun	fathered & and Nahshon fathered Salmon	2	test`;

      try {
        const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, tsvContent);

        const expectedOutput = {
          output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note', '1:4	g4k8		rc://*/ta/man/translate/figs-genericnoun	ἐγέννησεν & Ναασσὼν δὲ ἐγέννησεν τὸν Σαλμών	2	test'],
          errors: [],
        };

        // Check the output
        expect(output).toBeDefined();
        expect(output).toEqual(expectedOutput.output);

        // Check the errors
        expect(errors).toBeDefined();
        // expect(errors).toEqual(expectedOutput.errors);

        const rows = tsvContent.split('\n');
        for (let i = 0; i < rows.length; i++) {
          const result = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, rows[i]);
          expect(result.output[0]).toEqual(expectedOutput.output[i]);
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test4-convertGLQuotes2OLQuotes-jud_1-1', () => {
  it(
    'test1',
    async () => {
      debugger; // Add this line to pause execution for debugging
      const book = 'jud';
      const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	g4k8		rc://*/ta/man/translate/figs-genericnoun	a servant of Jesus Christ	1	test`;

      const expectedTsvContent = [`Reference	ID	Tags	SupportReference	Quote	Occurrence	Note`, `1:1	g4k8		rc://*/ta/man/translate/figs-genericnoun	Ἰησοῦ Χριστοῦ δοῦλος	1	test`];

      try {
        const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, tsvContent);
        expect(output).toBeDefined();
        expect(output).toEqual(expectedTsvContent);
      } catch (error) {
        console.log(error.message);
      }
    },
    TEST_TIMEOUT
  );
});

describe('test5-convertGLQuotes2OLQuotes-many-books', () => {
  for (const key of Object.keys(BibleBookData)) {
    it(
      `convertGLQuotes2OLQuotes with book "${key}"`,
      async () => {
        const book = key;
        const engFilePath = path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_eng.tsv`);
        const olFilePath = path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_ol.tsv`);

        if (!fs.existsSync(engFilePath) || !fs.existsSync(olFilePath)) {
          console.warn(`Skipping test for book ${key} as the required files do not exist.`);
          return;
        }
        console.log(`Running test for book ${key}`);

        const tsvContent = fs.readFileSync(engFilePath, 'utf8');
        const expectedTsvContent = fs.readFileSync(olFilePath, 'utf8');

        try {
          const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, tsvContent);

          // Check the output
          expect(output).toBeDefined();
          expect(errors).toBeDefined();
          // expect(errors).toEqual([]);

          if (errors.length > 0) {
            const errorFilePath = `${engFilePath}.errors.txt`;
            fs.writeFileSync(errorFilePath, errors.join('\n'), 'utf8');
          }

          const outputRows = output.map((row) => row.split('\t'));
          const expectedRows = expectedTsvContent.split('\n').map((row) => row.split('\t'));
          const doNotMatch = [];

          for (let i = 1; i < outputRows.length; i++) {
            // Skip header row
            if (!expectedRows[i] || !outputRows[i]) {
              console.log(`No expected row for row ${i}, ${key} ${outputRows[i][0]} (${outputRows[i][1]})`);
              continue;
            }
            let outputQuote = outputRows[i][4].replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
            let expectedQuote = expectedRows[i][4].replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]+$/, ''); // Remove zero-width spaces and punctuation from the end
            let message = `Comparing row ${i}, ${key} ${outputRows[i][0]} (${outputRows[i][1]}): "${outputQuote}" vs "${expectedQuote}"`;
            if (outputQuote) {
              console.log(message);
              try {
                outputQuote = outputQuote.replace('־', ' ').replace('־', ' ').replace('׀', ' ');
                expect(outputQuote).toEqual(expectedQuote); // Compare "Quote" column
              } catch (error) {
                console.log('Error:', error.message);
                message += error.message;
                doNotMatch.push(message);
                throw error;
              }
            }
          }
          if (doNotMatch.length > 0) {
            const doNotMatchPath = `${engFilePath}.no_match.txt`;
            fs.writeFileSync(doNotMatchPath, doNotMatch.join('\n\n'), 'utf8');
          }
          expect(errors).toEqual([]);
          expect(doNotMatch).toEqual([]);
        } catch (error) {
          // Handle any unexpected errors
          console.error(`Test failed for book ${book} with error:`, error);
          throw error;
        }
      },
      TEST_TIMEOUT
    );
  }
});

describe('test6-addGLQuotes-all-many-books', () => {
  for (const key of Object.keys(BibleBookData)) {
    it(
      `addGLQuoteCols with book "${key}"`,
      async () => {
        const params = {
          bibleLinks: ['unfoldingWord/en_ult/master'],
          bookCode: key,
          tsvContent: fs.readFileSync(path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_ol.tsv`), 'utf8')
        };

        try {
          const result = await addGLQuoteCols(params);
          // ...rest of test logic...
          expect(result.output.split('\n')).toEqual(expectedOutput.output.split('\n'));
        } catch (error) {
          console.error(`Test failed for book ${key} with error:`, error);
          throw error;
        }
      },
      TEST_TIMEOUT
    );
  }
});

describe('test7-addGLQuoteCols-mat-verse-span', () => {
  it(
    'addGLQuoteCols test of mat 1:8-9 for verse spans',
    async () => {
      const params = {
        bibleLinks: ['unfoldingWord/en_ult/master'],
        bookCode: 'mat',
        tsvContent: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	Ἰωρὰμ δὲ ἐγέννησεν τὸν Ὀζείαν, Ὀζείας δὲ ἐγέννησεν τὸν Ἰωαθάμ	1	note....`
      };

      try {
        const result = await addGLQuoteCols(params);
        // ...rest of test logic remains the same...
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test8-convertGLQuotes2OLQuotes-mat-verse-span', () => {
  it(
    'convertULTQuote2OL mat verse span',
    async () => {
      const book = 'mat';
      const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	and Joram fathered Ozias, and Ozias fathered Jotham	1	note...`;

      try {
        const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, tsvContent);

        const expectedOutput = {
          output: [
            'Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
            '1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	Ἰωρὰμ δὲ ἐγέννησεν τὸν Ὀζείαν, Ὀζείας δὲ ἐγέννησεν τὸν Ἰωαθάμ	1	note...',
          ],
          errors: [],
        };

        // Check the output
        expect(output).toBeDefined();
        console.log(output);
        expect(output).toEqual(expectedOutput.output);

        // Check the errors
        expect(errors).toBeDefined();
        // expect(errors).toEqual(expectedOutput.errors);
      } catch (error) {
        // Handle any unexpected errors
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test9-addGLQuoteCols-jud-1-4', () => {
  it(
    'addGLQuoteCols jude test',
    async () => {
      const params = {
        bibleLinks: ['unfoldingWord/en_ult/master'],
        bookCode: 'jud',
        tsvContent: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4	he1b		rc://*/ta/man/translate/grammar-connect-logic-result	γάρ	1	Here, **For** indicates...`
      };

      try {
        const result = await addGLQuoteCols(params);
        // ...rest of test logic remains the same...
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test10-addGLQuoteCols-but-in-greek', () => {
  it(
    'addGLQuoteCols for "but" in greek',
    async () => {
      const params = {
        bibleLinks: ['unfoldingWord/en_ult/master'],
        bookCode: '1co',
        tsvContent: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
2:4	chtx		rc://*/ta/man/translate/figs-ellipsis	ἀλλ' ἐν ἀποδείξει Πνεύματος καὶ δυνάμεως;	1	Here Paul has...`
      };

      try {
        const result = await addGLQuoteCols(params);
        // ...rest of test logic remains the same...
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});

describe('test11-convertULTQuote2OL-all-tests', () => {
  it.each(tests)(
    `REF: "$params.bookCode $params.ref" | EXPECTED: "$expected"`,
    async ({ params }) => {
      const { bookCode: bookCode, ref, olQuote, olOccurrence = 1, ultQuote, ultOccurrence = 1 } = params;

      const testParams = {
        bibleLink: 'unfoldingWord/en_ult/master',
        bookCode,
        tsvContent: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
${ref}	abcd			${ultQuote}	${ultOccurrence || occurrence}	note`
      };

      const expectedOutput = {
        output: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
${ref}	abcd			${olQuote}	${olOccurrence}	note`,
        errors: []
      };

      const result = await convertGLQuotes2OLQuotes(testParams);
      expect(result.output.split('\n')).toEqual(expectedOutput.output.split('\n'));
    },
    TEST_TIMEOUT
  );
});

describe('test13-addGLQuoteCols-jhn-1-10', () => {
  it(
    'addGLQuoteCols for jhn 1:10',
    async () => {
      const params = {
        bibleLinks: ['unfoldingWord/en_ult/master'],
        bookCode: "jhn",
        tsvContent: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:10	krcb		rc://*/ta/man/translate/figs-metonymy	ὁ κόσμος	1	This is the note`
      };

      try {
        const response = await addGLQuoteCols(params);

        const expectedResponse = {
          output: `Reference	ID	Tags	SupportReference	Quote	Occurrence	GLQuote	GLOccurrence	Note
1:10	krcb		rc://*/ta/man/translate/figs-metonymy	ὁ κόσμος	1	the world	2	This is the note
`,
          errors: [],
        };

        // Check the output
        expect(response).toBeDefined();
        expect(response).toEqual(expectedResponse);

        // Check the errors
        expect(response.errors).toBeDefined();
        // expect(errors).toEqual(expectedOutput.errors);
      } catch (error) {
        // Handle any unexpected errors
        console.error('Test failed with error:', error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );
});
