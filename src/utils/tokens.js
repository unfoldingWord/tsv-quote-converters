import deepcopy from "deepcopy";

export const slimSourceTokens = (tokens) => {
  const ret = [];
  const occurrences = {};
  if (!tokens) {
    return null;
  }
  for (const token of tokens) {
    const t2 = deepcopy(token);
    t2.payload = t2.payload.replace(/[ \t\r\n]+/g, " ");
    if (!(t2.payload in occurrences)) {
      occurrences[t2.payload] = 1;
    } else {
      occurrences[t2.payload]++;
    }
    t2.occurrence = occurrences[t2.payload];
    delete t2.scopes;
    ret.push(t2);
  }
  return ret;
};
