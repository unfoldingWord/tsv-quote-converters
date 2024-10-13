// index.test.js
import TSV7ULTQuotesToOrigLQuotes from "./index";

describe("TSV7ULTQuotesToOrigLQuotes", () => {
  it('TSV7ULTQuotesToOrigLQuotes with book "jol" and provided tsvContent', async () => {
    const book = "jol";
    const tsvContent = `
Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:5	f2g7		rc://*/ta/man/translate/grammar-connect-logic-result	Wake up, drunkards, and weep! And wail, all of the drinkers of wine, upon the sweet wine, for it has been cut off from your mouth	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”
1:5	q7n2		rc://*/ta/man/translate/figs-idiom	it has been cut off from your mouth	1	This is an expression that means that something is no longer available. Your language may have a comparable expression that you can use in your translation. Alternate translation: “it is no longer available for you to drink”
1:5	v7w2		rc://*/ta/man/translate/grammar-collectivenouns	from your mouth	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”
  `;

    try {
      const { output, errors } = await TSV7ULTQuotesToOrigLQuotes(
        book,
        tsvContent
      );

      const expectedOutput = {
        output: `Reference	ID	Tags	SupportReference	Quote	Occurrence	Note
1:5	f2g7		rc://*/ta/man/translate/grammar-connect-logic-result	הָקִ֤יצוּ שִׁכּוֹרִים֙ וּ⁠בְכ֔וּ וְ⁠הֵילִ֖לוּ כָּל שֹׁ֣תֵי יָ֑יִן עַל עָסִ֕יס כִּ֥י נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	See the discussion in the General Introduction to Joel of places such as this where the speaker describes a result before giving the reason for it. If it would be more natural in your language, you could reverse the order of these phrases, since the second phrase gives the reason for the result that the first phrase describes. Alternate translation: “The sweet wine has been cut off from your mouth, so wail upon it, all of the drinkers of wine”
1:5	q7n2		rc://*/ta/man/translate/figs-idiom	נִכְרַ֖ת מִ⁠פִּי⁠כֶֽם	1	This is an expression that means that something is no longer available. Your language may have a comparable expression that you can use in your translation. Alternate translation: “it is no longer available for you to drink”
1:5	v7w2		rc://*/ta/man/translate/grammar-collectivenouns	מִ⁠פִּי⁠כֶֽם	1	Since Joel is referring to a group of people, it might be more natural in your language to use the plural form of **mouth**. Alternate translation: “from your mouths”`,
        errors: "",
      };

      // Check the output
      expect(output).toBeDefined();
      expect(output).toEqual(expectedOutput.output);

      // Check the errors
      expect(errors).toBeDefined();
      expect(errors).toEqual(expectedOutput.errors);
    } catch (error) {
      // Handle any unexpected errors
      console.error("Test failed with error:", error);
      throw error;
    }
  });
});
