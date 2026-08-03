---
outline: deep
---

# Japanese Prefectures

Renders an interactive map of Japan when the card's `Expression` or `ExpressionReading` is a Japanese prefecture.

<video controls playsinline width="100%">
  <source src="https://i.imgur.com/k9WbX87.mp4" type="video/mp4">
</video>

## Setup

Copy the plugin files into your `collection.media` directory.

::: code-group

<!-- prettier-ignore -->
<<< ../../../packages/note/plugins/japanese-prefectures/_kiku_plugin.js [_kiku_plugin.js]
<<< ../../../packages/note/plugins/japanese-prefectures/_kiku-plugin-japanese-prefectures.css [_kiku-plugin-japanese-prefectures.css]
<<< ../../../packages/note/plugins/japanese-prefectures/_kiku-plugin-japanese-prefectures.js [_kiku-plugin-japanese-prefectures.js]
:::

Map file:

- [\_japanese-prefectures-map-mobile.svg](https://github.com/youyoumu/kiku/blob/main/packages/note/plugins/japanese-prefectures/_japanese-prefectures-map-mobile.svg)

## Features

### Front Side

- Shows only the map with no labels
- Click a prefecture to store your answer in `sessionStorage` and flip the card (uses `pycmd`, so this only works on Anki desktop)

### Back Side

- Shows the result with the full map
- Correct answer is highlighted in green
- Wrong answer is highlighted in red
- Clicking a prefecture opens a dialog with external links

## Supported Formats

The plugin matches prefectures by:

- Full kanji name (e.g., `東京都`)
- Shortened kanji (e.g., `東京`)
- Kana reading (e.g., `とうきょう`)
- Romaji (e.g., `tokyo`)
