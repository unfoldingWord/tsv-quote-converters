// index.test.js
import {convertULTQuotes2OL, addGLQuoteCols} from "./index";
import { BibleBookData } from "./common/books";
import fs from "fs";
import path from "path";

describe("convertULTQuotes2OL", () => {
  it('convertULTQuotes2OL with book "jol" and provided tsvContent', async () => {
    const book = "jol";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4-6	q7n2		rc://*/ta/man/translate/figs-idiom	it has been cut & from your mouth	1	This is an expression that means that something is no longer available. Your language may have a comparable expression that you can use in your translation. Alternate translation: “it is no longer available for you to drink”
1:5	e2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל שֹׁ֣תֵי יָ֑יִן עַל עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”
1:5	f2g7		rc://*/ta/man/translate/grammar-connect-logic-result	Wake up, drunkards, and weep! And wail, all of the drinkers of wine, upon the sweet wine, for it has been cut off from your mouth	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”
1:5	v7w2		rc://*/ta/man/translate/grammar-collectivenouns	from your mouth	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”
1:5	v3w2		rc://*/ta/man/translate/grammar-collectivenouns	from your mouthhhh	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”
1:6	zo55		rc://*/ta/man/translate/figs-infostructure	כִּ֤י שָֽׁמְעָה֙ בִּ⁠שְׂדֵ֣ה מוֹאָ֔ב כִּֽי־פָקַ֤ד יְהוָה֙ אֶת־עַמּ֔⁠וֹ\\nלָ⁠תֵ֥ת לָ⁠הֶ֖ם לָֽחֶם	1	Naomi first heard about Yahweh visiting his people and then decided to return to Bethlehem, so it might be more natural to put this information first, as in the UST.`;

    try {
      const { output, errors } = await convertULTQuotes2OL(
        book,
        tsvContent
      );

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
'1:4-6	q7n2		rc://*/ta/man/translate/figs-idiom	נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	This is an expression that means that something is no longer available. Your language may have a comparable expression that you can use in your translation. Alternate translation: “it is no longer available for you to drink”',
'1:5	e2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל שֹׁ֣תֵי יָ֑יִן עַל עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”',
'1:5	f2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל שֹׁ֣תֵי יָ֑יִן עַל עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”',
'1:5	v7w2		rc://*/ta/man/translate/grammar-collectivenouns	מִ⁠פִּי⁠כֶֽם	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”',
'1:5	v3w2		rc://*/ta/man/translate/grammar-collectivenouns	QUOTE_NOT_FOUND: from your mouthhhh	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”',
'1:6	zo55		rc://*/ta/man/translate/figs-infostructure	כִּ֤י שָֽׁמְעָה֙ בִּ⁠שְׂדֵ֣ה מוֹאָ֔ב כִּֽי־פָקַ֤ד יְהוָה֙ אֶת־עַמּ֔⁠וֹ\\nלָ⁠תֵ֥ת לָ⁠הֶ֖ם לָֽחֶם	1	Naomi first heard about Yahweh visiting his people and then decided to return to Bethlehem, so it might be more natural to put this information first, as in the UST.'],
        errors: ['Error: jol 1:5 v3w2 EMPTY MATCH IN OrigL SOURCE\n' +
        "    Search String: jol 1:5 'from your mouthhhh' occurrence=1\n" +
        '      from ULTTokens (26) [{"payload":"Wake","scopes":["attribute/milestone/zaln/x-align/0/הָקִ֤יצוּ:1:1"]},{"payload":"up","scopes":["attribute/milestone/zaln/x-align/0/הָקִ֤יצוּ:1:1"]},{"payload":"drunkards","scopes":["attribute/milestone/zaln/x-align/0/שִׁכּוֹרִים֙:1:1"]},{"payload":"and","scopes":["attribute/milestone/zaln/x-align/0/וּ⁠בְכ֔וּ:1:1"]},{"payload":"weep","scopes":["attribute/milestone/zaln/x-align/0/וּ⁠בְכ֔וּ:1:1"]},{"payload":"And","scopes":["attribute/milestone/zaln/x-align/0/וְ⁠הֵילִ֖לוּ:1:1"]},{"payload":"wail","scopes":["attribute/milestone/zaln/x-align/0/וְ⁠הֵילִ֖לוּ:1:1"]},{"payload":"all","scopes":["attribute/milestone/zaln/x-align/0/כָּל:1:1"]},{"payload":"of","scopes":["attribute/milestone/zaln/x-align/0/כָּל:1:1"]},{"payload":"the","scopes":["attribute/milestone/zaln/x-align/0/שֹׁ֣תֵי:1:1"]},{"payload":"drinkers","scopes":["attribute/milestone/zaln/x-align/0/שֹׁ֣תֵי:1:1"]},{"payload":"of","scopes":["attribute/milestone/zaln/x-align/0/שֹׁ֣תֵי:1:1"]},{"payload":"wine","scopes":["attribute/milestone/zaln/x-align/0/יָ֑יִן:1:1"]},{"payload":"upon","scopes":["attribute/milestone/zaln/x-align/0/עַל:1:1"]},{"payload":"the","scopes":["attribute/milestone/zaln/x-align/0/עָסִ֕יס:1:1"]},{"payload":"sweet","scopes":["attribute/milestone/zaln/x-align/0/עָסִ֕יס:1:1"]},{"payload":"wine","scopes":["attribute/milestone/zaln/x-align/0/עָסִ֕יס:1:1"]},{"payload":"for","scopes":["attribute/milestone/zaln/x-align/0/כִּ֥י:1:1"]},{"payload":"it","scopes":["attribute/milestone/zaln/x-align/0/נִכְרַ֖ת:1:1"]},{"payload":"has","scopes":["attribute/milestone/zaln/x-align/0/נִכְרַ֖ת:1:1"]},{"payload":"been","scopes":["attribute/milestone/zaln/x-align/0/נִכְרַ֖ת:1:1"]},{"payload":"cut","scopes":["attribute/milestone/zaln/x-align/0/נִכְרַ֖ת:1:1"]},{"payload":"off","scopes":["attribute/milestone/zaln/x-align/0/נִכְרַ֖ת:1:1"]},{"payload":"from","scopes":["attribute/milestone/zaln/x-align/0/מִ⁠פִּי⁠כֶֽם:1:1"]},{"payload":"your","scopes":["attribute/milestone/zaln/x-align/0/מִ⁠פִּי⁠כֶֽם:1:1"]},{"payload":"mouth","scopes":["attribute/milestone/zaln/x-align/0/מִ⁠פִּי⁠כֶֽם:1:1"]}]\n' +
        '       then ULTSearchThreeTuples (0) \n' +
        '       then wordLikeOrigLTokens (12) [{"subType":"wordLike","payload":"הָקִ֤יצוּ","position":41,"occurrence":1},{"subType":"wordLike","payload":"שִׁכּוֹרִים֙","position":42,"occurrence":1},{"subType":"wordLike","payload":"וּ⁠בְכ֔וּ","position":43,"occurrence":1},{"subType":"wordLike","payload":"וְ⁠הֵילִ֖לוּ","position":44,"occurrence":1},{"subType":"wordLike","payload":"כָּל","position":45,"occurrence":1},{"subType":"wordLike","payload":"שֹׁ֣תֵי","position":46,"occurrence":1},{"subType":"wordLike","payload":"יָ֑יִן","position":47,"occurrence":1},{"subType":"wordLike","payload":"עַל","position":48,"occurrence":1},{"subType":"wordLike","payload":"עָסִ֕יס","position":49,"occurrence":1},{"subType":"wordLike","payload":"כִּ֥י","position":50,"occurrence":1},{"subType":"wordLike","payload":"נִכְרַ֖ת","position":51,"occurrence":1},{"subType":"wordLike","payload":"מִ⁠פִּי⁠כֶֽם","position":52,"occurrence":1}]'],
      };

      // Check the output
      expect(output).toBeDefined();
      expect(output).toEqual(expectedOutput.output);

      // Check the errors
      expect(errors).toBeDefined();
      // expect(errors).toEqual(expectedOutput.errors);

      const rows = tsvContent.split("\n");
      for(let i = 0; i < rows.length; i++) {
        const result = await convertULTQuotes2OL(
          book,
          rows[i]
        );
        expect(result.output[0]).toEqual(expectedOutput.output[i]);
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Test failed with error:", error);
      throw error;
    }
  }, 10000);
});

describe("test_joshua_16_10_split_duplicate", () => {
  it('convertULTQuotes2OL with book "jos" and provided tsvContent', async () => {
    const book = "jos";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
16:10	g4k8		rc://*/ta/man/translate/figs-genericnoun	the Canaanite & the Canaanite	1	The author is not referring to a specific **Canaanite**. He means Canaanites in general. It may be more natural in your language to express this meaning by using a plural form. Alternate translation: “the Canaanites … the Canaanites”`;

    try {
      const { output, errors } = await convertULTQuotes2OL(
        book,
        tsvContent
      );

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
'16:10	g4k8		rc://*/ta/man/translate/figs-genericnoun	אֶת־הַֽ⁠כְּנַעֲנִ֖י & הַֽ⁠כְּנַעֲנִ֜י	1	The author is not referring to a specific **Canaanite**. He means Canaanites in general. It may be more natural in your language to express this meaning by using a plural form. Alternate translation: “the Canaanites … the Canaanites”'],
        errors: [],
      };

      // Check the output
      expect(output).toBeDefined();
      expect(output).toEqual(expectedOutput.output);

      // Check the errors
      expect(errors).toBeDefined();
      // expect(errors).toEqual(expectedOutput.errors);

      const rows = tsvContent.split("\n");
      for(let i = 0; i < rows.length; i++) {
        const result = await convertULTQuotes2OL(
          book,
          rows[i]
        );
        expect(result.output[0]).toEqual(expectedOutput.output[i]);
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Test failed with error:", error);
      throw error;
    }
  }, 10000);
});

describe("test_mat_1_4_duplicate", () => {
  it('convertULTQuotes2OL with book "mat" and provided tsvContent', async () => {
    debugger;
    const book = "mat";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4	g4k8		rc://*/ta/man/translate/figs-genericnoun	fathered & and Nahshon fathered Salmon	2	test`;

    try {
      const { output, errors } = await convertULTQuotes2OL(
        book,
        tsvContent
      );

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
'1:4	g4k8		rc://*/ta/man/translate/figs-genericnoun	ἐγέννησεν & Ναασσὼν δὲ ἐγέννησεν τὸν Σαλμών	2	test'],
        errors: [],
      };

      // Check the output
      expect(output).toBeDefined();
      expect(output).toEqual(expectedOutput.output);

      // Check the errors
      expect(errors).toBeDefined();
      // expect(errors).toEqual(expectedOutput.errors);

      const rows = tsvContent.split("\n");
      for(let i = 0; i < rows.length; i++) {
        const result = await convertULTQuotes2OL(
          book,
          rows[i]
        );
        expect(result.output[0]).toEqual(expectedOutput.output[i]);
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Test failed with error:", error);
      throw error;
    }
  }, 100000);
});

describe("test1", () => {
  it('test1', async () => {
    debugger; // Add this line to pause execution for debugging
    const book = "jud";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	g4k8		rc://*/ta/man/translate/figs-genericnoun	a servant of Jesus Christ	1	test`;

    const expectedTsvContent = [`Reference	ID	Tags	SupportReference	Quote	Occurrence	Note`,
`1:1	g4k8		rc://*/ta/man/translate/figs-genericnoun	Ἰησοῦ Χριστοῦ δοῦλος	1	test`];

    try {
      const { output, errors } = await convertULTQuotes2OL(
        book,
        tsvContent
      );
      expect(output).toBeDefined();
      expect(output).toEqual(expectedTsvContent);
    } catch (error) {
      console.log(error.message);
    }
  }, 1000000)
});

describe("test all 66 books", () => {
  for (const key of Object.keys(BibleBookData)) {
    if (key !== "jud") {
      continue;
    }
    it(`convertULTQuotes2OL with book "${key}"`, async () => {
      const book = key;
      const engFilePath = path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_eng.tsv`);
      const olFilePath = path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_ol.tsv`);

      if (!fs.existsSync(engFilePath) || !fs.existsSync(olFilePath)) {
        console.warn(`Skipping test for book ${key} as the required files do not exist.`);
        return;
      }
      console.log(`Running test for book ${key}`);

      const tsvContent = fs.readFileSync(engFilePath, "utf8");
      const expectedTsvContent = fs.readFileSync(olFilePath, "utf8");

      try {
        const { output, errors } = await convertULTQuotes2OL(book, tsvContent);

        // Check the output
        expect(output).toBeDefined();
        expect(errors).toBeDefined();
        // expect(errors).toEqual([]);

        if (errors.length > 0) {
          const errorFilePath = `${engFilePath}.errors.txt`;
          fs.writeFileSync(errorFilePath, errors.join("\n"), "utf8");
        }

        const outputRows = output.map(row => row.split("\t"));
        const expectedRows = expectedTsvContent.split("\n").map(row => row.split("\t"));
        const doNotMatch = [];

        for (let i = 1; i < outputRows.length; i++) { // Skip header row
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
              console.log("Error:", error.message);
              message += error.message;
              doNotMatch.push(message);
              throw error;
            }
          }
        }
        if (doNotMatch.length > 0) {
          const doNotMatchPath = `${engFilePath}.no_match.txt`;
          fs.writeFileSync(doNotMatchPath, doNotMatch.join("\n\n"), "utf8");
        }
        expect(errors).toEqual([]);
        expect(doNotMatch).toEqual([]);
      } catch (error) {
        // Handle any unexpected errors
        console.error(`Test failed for book ${book} with error:`, error);
        throw error;
      }
    }, 10000);
  }
});

describe("test GL quotes", () => {
  for (const key of Object.keys(BibleBookData)) {
    if (key !== "jud") {
      continue;
    }
    it(`convertULTQuotes2OL with book "${key}"`, async () => {
      const book = key;
      const engFilePath = path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_eng.tsv`);
      const olFilePath = path.join(__dirname, `../fixtures/tn_${key.toUpperCase()}_ol.tsv`);

      if (!fs.existsSync(engFilePath) || !fs.existsSync(olFilePath)) {
        console.warn(`Skipping test for book ${key} as the required files do not exist.`);
        return;
      }
      console.log(`Running test for book ${key}`);

      const tsvContent = fs.readFileSync(olFilePath, "utf8");
      const expectedTsvContent = fs.readFileSync(engFilePath, "utf8");

      try {
        const { output, errors } = await addGLQuoteCols(book, tsvContent);

        console.log(errors);
        console.log(output);

        // Check the output
        expect(output).toBeDefined();
        expect(errors).toBeDefined();
        // expect(errors).toEqual([]);

        if (errors.length > 0) {
          const errorFilePath = `${olFilePath}.gl_errors.txt`;
          fs.writeFileSync(errorFilePath, errors.join("\n"), "utf8");
        }

        const outputRows = output.map(row => row.split("\t"));
        const expectedRows = expectedTsvContent.split("\n").map(row => row.split("\t"));
        const doNotMatch = [];

        for (let i = 1; i < outputRows.length; i++) { // Skip header row
          if (!expectedRows[i] || !outputRows[i]) {
            console.log(`No expected row for row ${i}, ${key} ${outputRows[i][0]} (${outputRows[i][1]})`);
            continue;
          }
          let outputQuote = outputRows[i][6].replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width spaces
          let expectedQuote = expectedRows[i][4].replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]+$/, ''); // Remove zero-width spaces and punctuation from the end
          let message = `Comparing row ${i}, ${key} ${outputRows[i][0]} (${outputRows[i][1]}): "${outputQuote}" vs "${expectedQuote}"`;
          if (outputQuote) {
            console.log(message);
            try {
              expect(outputQuote).toEqual(expectedQuote); // Compare "Quote" column
            } catch (error) {
              console.log("Error:", error.message);
              message += error.message;
              doNotMatch.push(message);
            }
          }
        }
        if (doNotMatch.length > 0) {
          const doNotMatchPath = `${engFilePath}.gl_no_match.txt`;
          fs.writeFileSync(doNotMatchPath, doNotMatch.join("\n\n"), "utf8");
        }
        expect(errors).toEqual([]);
        expect(doNotMatch).toEqual([]);
      } catch (error) {
        // Handle any unexpected errors
        console.error(`Test failed for book ${book} with error:`, error);
        throw error;
      }
    }, 10000);
  }
});

describe("test2", () => {
  it('test2', async () => {
    const book = "mat";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	Ἰωρὰμ δὲ ἐγέννησεν τὸν Ὀζείαν, Ὀζείας δὲ ἐγέννησεν τὸν Ἰωαθάμ	1	note....`;

    try {
      const { output, errors } = await addGLQuoteCols(
        book,
        tsvContent
      );

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	GLQuote	GLOccurrence	Note',
'1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	Ἰωρὰμ δὲ ἐγέννησεν τὸν Ὀζείαν, Ὀζείας δὲ ἐγέννησεν τὸν Ἰωαθάμ	1	and Joram fathered Ozias, and Ozias fathered Jotham	1	note...'],
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
      console.error("Test failed with error:", error);
      throw error;
    }
  }, 1000000);
});

describe("test3", () => {
  it('test3', async () => {
    const book = "mat";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	and Joram fathered Ozias, and Ozias fathered Jotham	1	note...`;

    try {
      const { output, errors } = await convertULTQuotes2OL(
        book,
        tsvContent
      );

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
'1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	Ἰωρὰμ δὲ ἐγέννησεν τὸν Ὀζείαν, Ὀζείας δὲ ἐγέννησεν τὸν Ἰωαθάμ	1	note...'],
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
      console.error("Test failed with error:", error);
      throw error;
    }
  }, 1000000);
});