type Token =
  | { type: "kanji"; value: string }
  | { type: "kana"; value: string }
  | { type: "furigana"; value: string }
  | { type: "html"; value: string }
  | { type: "space" };

const isKanji = (char: string) => /\p{Script=Han}/u.test(char);
const trailingNumericKanjiPattern = /[0-9０-９]+\p{Script=Han}+$/u;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const chars = Array.from(input);

  while (i < chars.length) {
    const char = chars[i];

    // An HTML tag passes through untouched. Without this every character of a
    // tag is classified as kana and printed literally, so a field can never
    // carry both markup and readings.
    if (char === "<") {
      let value = "";

      while (i < chars.length && chars[i] !== ">") {
        value += chars[i];
        i++;
      }

      if (chars[i] === ">") {
        value += chars[i];
        i++;
      }

      tokens.push({ type: "html", value });
      continue;
    }

    if (char === "[") {
      let value = "";
      i++;

      while (i < chars.length && chars[i] !== "]") {
        value += chars[i];
        i++;
      }

      if (chars[i] === "]") i++;

      tokens.push({ type: "furigana", value });
      continue;
    }

    if (char === " " || char === "　") {
      tokens.push({ type: "space" });
    } else if (isKanji(char)) {
      tokens.push({ type: "kanji", value: char });
    } else {
      tokens.push({ type: "kana", value: char });
    }

    i++;
  }

  return tokens;
}

export type FuriganaRenderItem =
  | { type: "ruby"; text: string; reading: string }
  | { type: "text"; text: string };

function tokensToRenderItems(tokens: Token[]): FuriganaRenderItem[] {
  const result: FuriganaRenderItem[] = [];

  let textBuffer = "";
  let kanjiBuffer = "";
  let mixedBuffer = "";
  let lastTokenType: Token["type"] | null = null;
  let hasSpaceBefore = false;

  const flushText = () => {
    if (textBuffer) {
      result.push({ type: "text", text: textBuffer });
      textBuffer = "";
    }
  };

  const flushMixedAsText = () => {
    if (mixedBuffer) {
      textBuffer += mixedBuffer;
      mixedBuffer = "";
      kanjiBuffer = "";
      hasSpaceBefore = false;
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case "html": {
        // Emitted where it stands. A tag ends whatever run precedes it, so a
        // reading must not be separated from its word by one: wrap the pair
        // together (<span>言[い]</span>), not the word alone (<span>言</span>[い]).
        textBuffer += mixedBuffer + token.value;
        mixedBuffer = "";
        kanjiBuffer = "";
        break;
      }

      case "space": {
        flushMixedAsText();
        textBuffer += " ";
        hasSpaceBefore = true;
        break;
      }

      case "kanji": {
        kanjiBuffer += token.value;
        mixedBuffer += token.value;
        break;
      }

      case "kana": {
        kanjiBuffer = "";
        mixedBuffer += token.value;
        break;
      }

      case "furigana": {
        let base = "";

        if (hasSpaceBefore) {
          base = mixedBuffer;
          if (textBuffer.endsWith(" ")) {
            textBuffer = textBuffer.slice(0, -1);
          }
        } else if (lastTokenType === "kanji") {
          base = mixedBuffer.match(trailingNumericKanjiPattern)?.[0] ?? kanjiBuffer;
          textBuffer += mixedBuffer.slice(0, -base.length);
        } else if (lastTokenType === "kana") {
          base = mixedBuffer;
        }

        if (base) {
          flushText();
          result.push({
            type: "ruby",
            text: base,
            reading: token.value,
          });
          mixedBuffer = "";
          kanjiBuffer = "";
          hasSpaceBefore = false;
        }
        break;
      }
    }
    lastTokenType = token.type;
  }

  flushMixedAsText();
  flushText();
  return result;
}

export function parseFurigana(input: string): FuriganaRenderItem[] {
  return tokensToRenderItems(tokenize(input));
}
