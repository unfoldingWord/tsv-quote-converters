import xre from "xregexp";

export const rejigAlignment = (str) =>
  xre.replace(
    str,
    / x-occurrence="(\d+)" x-occurrences="(\d+)" x-content="([^"]+)"/g,
    ' x-align="$3:$1:$2"'
  );
