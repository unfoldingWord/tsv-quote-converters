// index.test.js
import { convertGLQuotes2OLQuotes, addGLQuoteCols } from "./index";
import { BibleBookData } from "./common/books";
import fs from "fs";
import path from "path";


const TEST_TIMEOUT = 1000000;

const tests = [
  {
    params: {
      name: "",
      bookId: "PSA",
      ref: "6:8-9",
      olQuote: "יְ֭הוָה & יְ֝הוָ֗ה",
      olOccurrence: 1,
      ultQuote: "Yahweh & Yahweh",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "Middle word not being highlighted",
      bookId: "PSA",
      ref: "6:8-9",
      olQuote: "יְ֝הוָ֗ה & יְ֭הוָה & יְ֝הוָ֗ה",
      olOccurrence: 1,
      ultQuote: "Yahweh & Yahweh & Yahweh",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "Test 1",
      bookId: "JUD",
      ref: "1:10",
      olQuote: "ὅσα & φυσικῶς ὡς τὰ ἄλογα ζῷα ἐπίστανται",
      occurrence: 2,
      olOccurrence: 1,
      ultQuote: "what they understand by instinct as the unreasoning animals",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "3JN",
      ref: "1:6-7",
      olQuote: "οὓς καλῶς ποιήσεις, προπέμψας ἀξίως τοῦ Θεοῦ; ὑπὲρ γὰρ τοῦ ὀνόματος ἐξῆλθον, μηδὲν λαμβάνοντες ἀπὸ τῶν ἐθνικῶν",
      olOccurrence: 1,
      ultQuote: "whom you will do well to send on worthily of God & for they went out for the sake of the name, receiving nothing from the Gentiles",
      ultOccurrence: 1,
    },
    only: true,
  },
  {
    params: {
      name: "",
      bookId: "2JN",
      ref: "1:2",
      olQuote: "καὶ μεθ’ ἡμῶν ἔσται",
      olOccurrence: 1,
      olOccurrence: 1,
      ultQuote: "and will be with us",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "2JN",
      ref: "1:2",
      olQuote: "μεθ’ ἡμῶν",
      olOccurrence: 1,
      olOccurrence: 1,
      ultQuote: "with us",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "2JN",
      ref: "1:2",
      olQuote: "καὶ μεθ’",
      olOccurrence: 1,
      olOccurrence: 1,
      ultQuote: "and & with",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "TIT",
      ref: "1:4,9",
      olQuote: "καὶ & καὶ",
      occurrence: 3,
      olOccurrence: 1,
      ultQuote: "both & and",
      ultOccurrence: 1,
    },
  },

  {
    params: {
      name: "Testing deuteronomy highlighting error",
      bookId: "DEU",
      ref: "1:5-6",
      olQuote: "מֹשֶׁ֔ה בֵּאֵ֛ר אֶת־הַ⁠תּוֹרָ֥ה הַ⁠זֹּ֖את לֵ⁠אמֹֽר׃ & יְהוָ֧ה אֱלֹהֵ֛י⁠נוּ דִּבֶּ֥ר אֵלֵ֖י⁠נוּ בְּ⁠חֹרֵ֣ב לֵ⁠אמֹ֑ר",
      olOccurrence: 1,
      ultQuote: "Moses & explaining this law, saying & Yahweh our God spoke to us at Horeb, saying",
      ultOccurrence: 1,
    }
  },
  {
    params: {
      name: "",
      bookId: "JOS",
      ref: "21:27",
      olQuote: "אֶת־גּוֹלָ֤ן & בְּעֶשְׁתְּרָ֖ה",
      olOccurrence: 1,
      ultQuote: "Golan & Be Eshterah",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "GEN",
      ref: "7:11",
      olQuote: "בִּ⁠שְׁנַ֨ת שֵׁשׁ־מֵא֤וֹת שָׁנָה֙ לְ⁠חַיֵּי נֹ֔חַ",
      olOccurrence: 1,
      ultQuote: "In the six hundredth year of Noah’s life",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "GEN",
      ref: "1:21",
      olQuote: "וְ⁠אֵ֣ת כָּל נֶ֣פֶשׁ הַֽ⁠חַיָּ֣ה הָֽ⁠רֹמֶ֡שֶׂת",
      olOccurrence: 1,
      ultQuote: "and every living creature that moves",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "GEN",
      ref: "1:3",
      olQuote: "וַֽ⁠יְהִי אֽוֹר",
      olOccurrence: 1,
      ultQuote: "And there was light",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "PSA",
      ref: "3:2",
      olQuote: "סֶֽלָה",
      olOccurrence: 1,
      ultQuote: "Selah",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "JOS",
      ref: "24:10",
      olQuote: "וָ⁠אַצִּ֥ל אֶתְ⁠כֶ֖ם מִ⁠יָּדֽ⁠וֹ",
      olOccurrence: 1,
      ultQuote: "and I rescued you from his hand",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "JOS",
      ref: "1:11",
      olQuote: "בְּ⁠ע֣וֹד׀ שְׁלֹ֣שֶׁת יָמִ֗ים",
      olOccurrence: 1,
      ultQuote: "within three days",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookId: "JOS",
      ref: "15:7",
      olQuote: "דְּבִרָ⁠ה֮ מֵ⁠עֵ֣מֶק עָכוֹר֒ & הַ⁠גִּלְגָּ֗ל & לְ⁠מַעֲלֵ֣ה אֲדֻמִּ֔ים & מֵי־עֵ֣ין שֶׁ֔מֶשׁ & עֵ֥ין רֹגֵֽל",
      olOccurrence: 1,
      ultQuote: "to Debir from the Valley of Trouble, & the Gilgal, & of the ascent of Adummim, & the waters of En Shemesh & En Rogel",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookId: "JOS",
      ref: "15:7",
      quote:
        "דְּבִרָ⁠ה֮ מֵ⁠עֵ֣מֶק עָכוֹר֒ & הַ⁠גִּלְגָּ֗ל & לְ⁠מַעֲלֵ֣ה אֲדֻמִּ֔ים & מֵי־עֵ֣ין שֶׁ֔מֶ & עֵ֥ין רֹגֵֽל",
      olOccurrence: 1,
      ultQuote: "",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookId: "PHP",
      ref: "1:1-20",
      olQuote: "τινὲς μὲν καὶ & τὸν Χριστὸν κηρύσσουσιν",
      olOccurrence: 1,
      ultQuote: "Some indeed even proclaim Christ",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookId: "GEN",
      ref: "2:23",
      olQuote: "עֶ֚צֶם מֵֽ⁠עֲצָמַ֔⁠י וּ⁠בָשָׂ֖ר מִ⁠בְּשָׂרִ֑⁠י",
      olOccurrence: 1,
      ultQuote: "is} bone from my bones\nand flesh from my flesh",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      bookId: "GEN",
      ref: "4:23",
      olQuote: "כִּ֣י אִ֤ישׁ הָרַ֨גְתִּי֙ לְ⁠פִצְעִ֔⁠י וְ⁠יֶ֖לֶד לְ⁠חַבֻּרָתִֽ⁠י",
      olOccurrence: 1,
      ultQuote: "For I killed a man for my wound,\neven a young man for my bruise",
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "1PE",
      ref: "1:24",
      quote:
        "πᾶσα σὰρξ ὡς χόρτος, καὶ πᾶσα δόξα αὐτῆς ὡς ἄνθος χόρτου. ἐξηράνθη ὁ χόρτος, καὶ τὸ ἄνθος ἐξέπεσεν,",
      olOccurrence: 1,
      ultQuote: `All flesh {is} like grass,
and all its glory {is} like the flower of the grass.
The grass was dried up, and the flower fell off`,
      ultOccurrence: 1,
    },
  },
  {
    params: {
      name: "",
      bookId: "1CO",
      ref: "1:2",
      olQuote: "τῇ ἐκκλησίᾳ τοῦ Θεοῦ & τῇ οὔσῃ ἐν Κορίνθῳ",
      olOccurrence: 1,
      ultQuote: "to the church of God that is in Corinth",
      ultOccurrence: 1,
    },
  }
];

describe("test1-convertGLQuotes2OLQuotes", () => {
  it('convertGLQuotes2OLQuotes with book "jol" and provided tsvContent', async () => {
    const book = "jol";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4-6	q7n2		rc://*/ta/man/translate/figs-idiom	it has been cut & from your mouth	1	This is an expression that means that something is no longer available. Your language may have a comparable expression that you can use in your translation. Alternate translation: “it is no longer available for you to drink”
1:5	e2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל שֹׁ֣תֵי יָ֑יִן עַל עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”
1:5	f2g7		rc://*/ta/man/translate/grammar-connect-logic-result	Wake up, drunkards, and weep! And wail, all of the drinkers of wine, upon the sweet wine, for it has been cut off from your mouth	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”
1:5	v7w2		rc://*/ta/man/translate/grammar-collectivenouns	from your mouth	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”
1:5	v3w2		rc://*/ta/man/translate/grammar-collectivenouns	from your mouthhhh	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”
1:6	zo55		rc://*/ta/man/translate/figs-infostructure	כִּ֤י שָֽׁמְעָה֙ בִּ⁠שְׂדֵ֣ה מוֹאָ֔ב כִּֽי־פָקַ֤ד יְהוָה֙ אֶת־עַמּ֔⁠וֹ\\nלָ⁠תֵ֥ת לָ⁠הֶ֖ם לָֽחֶם	1	Naomi first heard about Yahweh visiting his people and then decided to return to Bethlehem, so it might be more natural to put this information first, as in the UST.`;

    try {
      const { output, errors } = await convertGLQuotes2OLQuotes(
        'unfoldingWord/en_ult/v84',
        book,
        tsvContent
      );

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
'1:4-6	q7n2		rc://*/ta/man/translate/figs-idiom	נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	This is an expression that means that something is no longer available. Your language may have a comparable expression that you can use in your translation. Alternate translation: “it is no longer available for you to drink”',
'1:5	e2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל שֹׁ֣תֵי יָ֑יִן עַל עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”',
'1:5	f2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל־שֹׁ֣תֵי יָ֑יִן עַל־עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”',
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
        const result = await convertGLQuotes2OLQuotes(
          'unfoldingWord/en_ult/v84',
          book,
          rows[i]
        );
        expect(result.output).toEqual(expectedOutput.output[i]);
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Test failed with error:", error);
      throw error;
    }
  }, TEST_TIMEOUT);
});

describe("test12-convertGLQuotes2OLQuotes-joshua_16_10_split_duplicate", () => {
  it('convertGLQuotes2OLQuotes with book "jos" and provided tsvContent', async () => {
    const book = "jos";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
16:10	g4k8		rc://*/ta/man/translate/figs-genericnoun	the Canaanite the Canaanite	1	The author is not referring to a specific **Canaanite**. He means Canaanites in general. It may be more natural in your language to express this meaning by using a plural form. Alternate translation: “the Canaanites … the Canaanites”`;

    try {
      const { output, errors } = await convertGLQuotes2OLQuotes(
        'unfoldingWord/en_ult/v84',
        book,
        tsvContent,
        true,
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
        const result = await convertGLQuotes2OLQuotes(
          'unfoldingWord/en_ult/v84',
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
  }, TEST_TIMEOUT);
});

describe("test3-convertGLQuotes2OLQuotes-test_mat_1_4_duplicate", () => {
  it('convertGLQuotes2OLQuotes with book "mat" and provided tsvContent', async () => {
    debugger;
    const book = "mat";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4	g4k8		rc://*/ta/man/translate/figs-genericnoun	fathered & and Nahshon fathered Salmon	2	test`;

    try {
      const { output, errors } = await convertGLQuotes2OLQuotes(
        'unfoldingWord/en_ult/v84',
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
        const result = await convertGLQuotes2OLQuotes(
          'unfoldingWord/en_ult/v84',
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
  }, TEST_TIMEOUT);
});

describe("test4-convertGLQuotes2OLQuotes-jud_1-1", () => {
  it('test1', async () => {
    debugger; // Add this line to pause execution for debugging
    const book = "jud";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:1	g4k8		rc://*/ta/man/translate/figs-genericnoun	a servant of Jesus Christ	1	test`;

    const expectedTsvContent = [`Reference	ID	Tags	SupportReference	Quote	Occurrence	Note`,
`1:1	g4k8		rc://*/ta/man/translate/figs-genericnoun	Ἰησοῦ Χριστοῦ δοῦλος	1	test`];

    try {
      const { output, errors } = await convertGLQuotes2OLQuotes(
        'unfoldingWord/en_ult/v84',
        book,
        tsvContent
      );
      expect(output).toBeDefined();
      expect(output).toEqual(expectedTsvContent);
    } catch (error) {
      console.log(error.message);
    }
  }, TEST_TIMEOUT)
});

describe("test5-convertGLQuotes2OLQuotes-many-books", () => {
  for (const key of Object.keys(BibleBookData)) {
    it(`convertGLQuotes2OLQuotes with book "${key}"`, async () => {
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
        const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, tsvContent);

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
    }, TEST_TIMEOUT);
  }
});

describe("test6-addGLQuotes-all-many-books", () => {
  for (const key of Object.keys(BibleBookData)) {
    it(`addGLQuoteCols with book "${key}"`, async () => {
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
        const { output, errors } = await addGLQuoteCols('unfoldingWord/en_ult/v84', book, tsvContent);

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
    }, TEST_TIMEOUT);
  }
});

describe("test7-addGLQuoteCols-mat-verse-span", () => {
  it('addGLQuoteCols test of mat 1:8-9 for verse spans', async () => {
    const book = "mat";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	Ἰωρὰμ δὲ ἐγέννησεν τὸν Ὀζείαν, Ὀζείας δὲ ἐγέννησεν τὸν Ἰωαθάμ	1	note....`;

    try {
      const { output, errors } = await addGLQuoteCols(
        'unfoldingWord/en_ult/v84', 
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
  }, TEST_TIMEOUT);
});

describe("test8-convertGLQuotes2OLQuotes-mat-verse-span", () => {
  it('convertULTQuote2OL mat verse span', async () => {
    const book = "mat";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:8-9	ei0o		rc://*/ta/man/translate/figs-explicit	and Joram fathered Ozias, and Ozias fathered Jotham	1	note...`;

    try {
      const { output, errors } = await convertGLQuotes2OLQuotes(
        'unfoldingWord/en_ult/v84',
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
  }, TEST_TIMEOUT);
});

describe("test9-addGLQuoteCols-jud-1-4", () => {
  it('addGLQuoteCols jude test', async () => {
    const book = "jud";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:4	he1b		rc://*/ta/man/translate/grammar-connect-logic-result	γάρ	1	Here, **For** indicates that Jude is giving a reason for why he said in the previous verse that he wants his readers to “contend for the faith.” Alternate translation: [I want you do to this because]
1:4	v94i			παρεισέδυσαν γάρ τινες ἄνθρωποι	1	Alternate translation: [For some men have snuck in unnoticed] or [For some men have come in without drawing attention to themselves]
1:4	qevn		rc://*/ta/man/translate/figs-ellipsis	παρεισέδυσαν γάρ τινες ἄνθρωποι	1	In this phrase, Jude is leaving out words from this sentence that it would need in many languages in order to be complete. If this phrase is required in your language, it can be supplied from verse [12](../01/12.md). Alternate translation: [For certain men have entered secretly into your love feasts] or [For certain men have entered secretly into your gatherings]
1:4	wwz3		rc://*/ta/man/translate/figs-activepassive	οἱ πάλαι προγεγραμμένοι εἰς τοῦτο τὸ κρίμα	1	If your language does not use this passive form **having been designated**, you could state who did the action. Alternate translation: [men whom God long ago designated beforehand for this condemnation]
`;

    try {
      const result = await addGLQuoteCols('unfoldingWord/en_ult/v84', book, tsvContent);
      console.log(result);
      let result2;
      if (result.output) {
          const updatedRows = result.output.map((row, idx) => {
            const columns = row.split('\t');
            if (idx !== 0 && columns[6] && columns[6] !== 'QUOTE_NOT_FOUND') {
              columns[4] = columns[6];
              columns[5] = columns[7];
            }
            return [...columns.slice(0, 6), columns[8]].join('\t');
          });
        console.log(updatedRows);
        result2 = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', book, updatedRows.join("\n"));
      }

      const expectedOutput = {
        output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	Note',
`1:4	he1b		rc://*/ta/man/translate/grammar-connect-logic-result	γάρ	1	Here, **For** indicates that Jude is giving a reason for why he said in the previous verse that he wants his readers to “contend for the faith.” Alternate translation: [I want you do to this because]`,
`1:4	v94i			παρεισέδυσαν γάρ τινες ἄνθρωποι	1	Alternate translation: [For some men have snuck in unnoticed] or [For some men have come in without drawing attention to themselves]`,
`1:4	qevn		rc://*/ta/man/translate/figs-ellipsis	παρεισέδυσαν γάρ τινες ἄνθρωποι	1	In this phrase, Jude is leaving out words from this sentence that it would need in many languages in order to be complete. If this phrase is required in your language, it can be supplied from verse [12](../01/12.md). Alternate translation: [For certain men have entered secretly into your love feasts] or [For certain men have entered secretly into your gatherings]`,
`1:4	wwz3		rc://*/ta/man/translate/figs-activepassive	οἱ πάλαι προγεγραμμένοι εἰς τοῦτο τὸ κρίμα	1	If your language does not use this passive form **having been designated**, you could state who did the action. Alternate translation: [men whom God long ago designated beforehand for this condemnation]`],
        errors: [],
      };

      // Check the output
      expect(result2).toBeDefined();
      console.log(result2);
      expect(result2.output).toEqual(expectedOutput.output);

      // Check the errors
      expect(result2.errors).toBeDefined();
      // expect(errors).toEqual(expectedOutput.errors);
    } catch (error) {
      // Handle any unexpected errors
      console.error("Test failed with error:", error);
      throw error;
    }
  }, TEST_TIMEOUT);
});

describe("test10-addGLQuoteCols-but-in-greek", () => {
  it('addGLQuoteCols for "but" in greek', async () => {
    const book = "1co";
    const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
2:4	chtx		rc://*/ta/man/translate/figs-ellipsis	ἀλλ’ ἐν ἀποδείξει Πνεύματος καὶ δυνάμεως;	1	Here Paul has omitted some words that may be necessary to make a complete thought in your language. If your language needs these words, you could add them here, supplying the idea from earlier in the verse. Alternate translation: [but my word and my proclamation were with a demonstration of the Spirit and of power]
2:5	av3t		rc://*/ta/man/translate/figs-idiom	ἡ πίστις ὑμῶν, μὴ ᾖ ἐν σοφίᾳ ἀνθρώπων, ἀλλ’ ἐν δυνάμει Θεοῦ	1	Here, when someone has **faith** that is **in** something, the word **in** signals what the **faith** is based on. Unlike in many other cases, **in** does not introduce what it is that people trust. If it would be helpful in your language, you could express the meaning of this phrase by translating **in** with a word or phrase that indicates the basis of the **faith**. Alternate translation: [your faith might not be based on the wisdom of men but be based on the power of God]
3:2	i3r5		rc://*/ta/man/translate/figs-idiom	ἀλλ’	1	Here, **But** is used to introduce a contrast. It is not necessary to translate it in many languages. If it would be helpful in your language, you could translate it with a word that indicates a contrast. Alternate translation: [Indeed]
`;
      
      try {
        const {output, errors} = await addGLQuoteCols('unfoldingWord/en_ult/v84', book, tsvContent);  
        const expectedOutput = {
          output: ['Reference	ID	Tags	SupportReference	Quote	Occurrence	GLQuote	GLOccurrence	Note',
            `2:4	chtx		rc://*/ta/man/translate/figs-ellipsis	ἀλλ’ ἐν ἀποδείξει Πνεύματος καὶ δυνάμεως;	1	but with a demonstration of the Spirit and of power	1	Here Paul has omitted some words that may be necessary to make a complete thought in your language. If your language needs these words, you could add them here, supplying the idea from earlier in the verse. Alternate translation: [but my word and my proclamation were with a demonstration of the Spirit and of power]`,
            `2:5	av3t		rc://*/ta/man/translate/figs-idiom	ἡ πίστις ὑμῶν, μὴ ᾖ ἐν σοφίᾳ ἀνθρώπων, ἀλλ’ ἐν δυνάμει Θεοῦ	1	your faith might not be in the wisdom of men but in the power of God	1	Here, when someone has **faith** that is **in** something, the word **in** signals what the **faith** is based on. Unlike in many other cases, **in** does not introduce what it is that people trust. If it would be helpful in your language, you could express the meaning of this phrase by translating **in** with a word or phrase that indicates the basis of the **faith**. Alternate translation: [your faith might not be based on the wisdom of men but be based on the power of God]`,
            `3:2	i3r5		rc://*/ta/man/translate/figs-idiom	ἀλλ’	1	Indeed	1	Here, **But** is used to introduce a contrast. It is not necessary to translate it in many languages. If it would be helpful in your language, you could translate it with a word that indicates a contrast. Alternate translation: [Indeed]`
          ],
          errors: [],
        };
        expect(output).toEqual(expectedOutput.output);
      } catch (error) {
        console.error("Test failed with error:", error);
        throw error;
      }
  }, TEST_TIMEOUT);
});

describe("test11-convertULTQuote2OL-all-tests", () => {
  it.each(tests)(
    `REF: "$params.bookId $params.ref" | EXPECTED: "$expected"`,
    async ({ params }) => {
      const { bookId, ref, olQuote, olOccurrence = 1, ultQuote, ultOccurrence = 1 } = params;

      const tsvContent = `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
${ref}	abcd			${ultQuote}	${ultOccurrence || occurrence}	note`;

      const expectedTsvContent = [`Reference	ID	Tags	SupportReference	Quote	Occurrence	Note`,
`${ref}	abcd			${olQuote}	${olOccurrence}	note`];

      const { output, errors } = await convertGLQuotes2OLQuotes('unfoldingWord/en_ult/v84', bookId, tsvContent);

      try {
        expect(output).toEqual(expectedTsvContent);
      } catch (e) {
        console.log({ params, received: {output, errors}, expected: expectedTsvContent});
        throw e;
      }
    },
    TEST_TIMEOUT
  );
});
