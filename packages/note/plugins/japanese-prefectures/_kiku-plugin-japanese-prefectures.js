/**
 * Renders a map of Japan's prefectures and highlights the one that matches
 * the current card's expression.
 */

const CONFIG = {
  defaultFill: "#EEEEEE",
  boundaryStroke: "#888888",
  matchFill: "#f97316",
  /** @type {Record<string, string>} region class -> fill color */
  regionColors: {
    hokkaido: "#bfdbfe",
    tohoku: "#c4b5fd",
    kanto: "#fbcfe8",
    chubu: "#fde68a",
    kinki: "#bbf7d0",
    chugoku: "#a5f3fc",
    shikoku: "#d9f99d",
    kyushu: "#fed7aa",
    "kyushu-okinawa": "#fed7aa",
  },
};

/** @type {Record<string, [string, string]>} region class -> [name, reading] */
const REGIONS = {
  hokkaido: ["北海道", "ほっかいどう"],
  tohoku: ["東北", "とうほく"],
  kanto: ["関東", "かんとう"],
  chubu: ["中部", "ちゅうぶ"],
  kinki: ["近畿", "きんき"],
  chugoku: ["中国", "ちゅうごく"],
  shikoku: ["四国", "しこく"],
  kyushu: ["九州", "きゅうしゅう"],
  "kyushu-okinawa": ["九州・沖縄", "きゅうしゅう・おきなわ"],
};

const REGION_KEYS = new Set(Object.keys(REGIONS));

/**
 * @param {Element} el
 * @returns {string | null}
 */
function regionKeyOf(el) {
  for (const cls of el.classList) {
    if (REGION_KEYS.has(cls)) return cls;
  }
  return null;
}

/**
 * @typedef {[string, string, string, string]} Prefecture [code, kanji, kana, romaji]
 */

/**
 * @type {Prefecture[]}
 */
const PREFECTURES = [
  ["01", "北海道", "ほっかいどう", "hokkaido"],
  ["02", "青森県", "あおもり", "aomori"],
  ["03", "岩手県", "いわて", "iwate"],
  ["04", "宮城県", "みやぎ", "miyagi"],
  ["05", "秋田県", "あきた", "akita"],
  ["06", "山形県", "やまがた", "yamagata"],
  ["07", "福島県", "ふくしま", "fukushima"],
  ["08", "茨城県", "いばらき", "ibaraki"],
  ["09", "栃木県", "とちぎ", "tochigi"],
  ["10", "群馬県", "ぐんま", "gunma"],
  ["11", "埼玉県", "さいたま", "saitama"],
  ["12", "千葉県", "ちば", "chiba"],
  ["13", "東京都", "とうきょう", "tokyo"],
  ["14", "神奈川県", "かながわ", "kanagawa"],
  ["15", "新潟県", "にいがた", "niigata"],
  ["16", "富山県", "とやま", "toyama"],
  ["17", "石川県", "いしかわ", "ishikawa"],
  ["18", "福井県", "ふくい", "fukui"],
  ["19", "山梨県", "やまなし", "yamanashi"],
  ["20", "長野県", "ながの", "nagano"],
  ["21", "岐阜県", "ぎふ", "gifu"],
  ["22", "静岡県", "しずおか", "shizuoka"],
  ["23", "愛知県", "あいち", "aichi"],
  ["24", "三重県", "みえ", "mie"],
  ["25", "滋賀県", "しが", "shiga"],
  ["26", "京都府", "きょうと", "kyoto"],
  ["27", "大阪府", "おおさか", "osaka"],
  ["28", "兵庫県", "ひょうご", "hyogo"],
  ["29", "奈良県", "なら", "nara"],
  ["30", "和歌山県", "わかやま", "wakayama"],
  ["31", "鳥取県", "とっとり", "tottori"],
  ["32", "島根県", "しまね", "shimane"],
  ["33", "岡山県", "おかやま", "okayama"],
  ["34", "広島県", "ひろしま", "hiroshima"],
  ["35", "山口県", "やまぐち", "yamaguchi"],
  ["36", "徳島県", "とくしま", "tokushima"],
  ["37", "香川県", "かがわ", "kagawa"],
  ["38", "愛媛県", "えひめ", "ehime"],
  ["39", "高知県", "こうち", "kochi"],
  ["40", "福岡県", "ふくおか", "fukuoka"],
  ["41", "佐賀県", "さが", "saga"],
  ["42", "長崎県", "ながさき", "nagasaki"],
  ["43", "熊本県", "くまもと", "kumamoto"],
  ["44", "大分県", "おおいた", "oita"],
  ["45", "宮崎県", "みやざき", "miyazaki"],
  ["46", "鹿児島県", "かごしま", "kagoshima"],
  ["47", "沖縄県", "おきなわ", "okinawa"],
];

/** @type {Map<string, string>} lowercased form -> prefecture code */
const CODE_BY_NAME = new Map();
for (const [code, kanji, kana, romaji] of PREFECTURES) {
  CODE_BY_NAME.set(kanji.toLowerCase(), code);
  CODE_BY_NAME.set(kanji.replace(/[都道府県]$/, "").toLowerCase(), code);
  CODE_BY_NAME.set(kana, code);
  CODE_BY_NAME.set(romaji, code);
}

/** @type {Map<string, [string, string, string, string]>} */
const PREFECTURE_BY_CODE = new Map(PREFECTURES.map((p) => [p[0], p]));

/**
 * @param {string} text
 */
function findPrefectureCode(text) {
  return CODE_BY_NAME.get(text.toLowerCase()) ?? null;
}

/**
 * @param {string | null} code
 */
function findPrefectureByCode(code) {
  return code ? (PREFECTURE_BY_CODE.get(code) ?? null) : null;
}

/**
 * @param {Record<string, string | number | boolean | null | undefined>} obj
 * @returns {string}
 */
function style(obj) {
  let s = "";
  for (const key in obj) {
    const v = obj[key];
    if (v == null || v === false) continue;
    s += `${key}: ${v}; `;
  }
  return s.trim();
}

/**
 * @param {string} svgText
 */
function processSvg(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  for (const el of doc.querySelectorAll(".prefecture")) {
    const region = Object.keys(CONFIG.regionColors).find((r) => el.classList.contains(r));
    el.setAttribute("fill", region ? CONFIG.regionColors[region] : CONFIG.defaultFill);
    el.setAttribute("stroke", CONFIG.boundaryStroke);
  }
  for (const el of doc.querySelectorAll(".boundary-line")) {
    el.setAttribute("stroke", CONFIG.boundaryStroke);
  }
  const root = doc.querySelector("svg");
  if (root) {
    root.setAttribute("width", "100%");
    root.setAttribute("style", style({ height: "auto", display: "block" }));
  }
  return new XMLSerializer().serializeToString(doc);
}

const g = /** @type {{
  __japanesePrefecturesMapSvg?: Promise<string>;
  __japanesePrefecturesProcessedSvg?: string;
}} */ (globalThis);

async function fetchSvg() {
  g.__japanesePrefecturesMapSvg ??= fetch("_japanese-prefectures-map-mobile.svg").then((res) =>
    res.text(),
  );
  return g.__japanesePrefecturesMapSvg;
}

/**
 * @typedef {import("#/plugins/plugin-types").Ctx} Ctx
 */

/**
 * @param {{ ctx: Ctx; }} props
 */
export function JapaneseMap(props) {
  const { createMemo, Suspense, Show, useAnkiFieldContext, useCardContext } = props.ctx;
  const html = props.ctx.html.define({ Show, Suspense, JapaneseMapContent });
  const { $initialSide } = useCardContext();
  const { $ankiFields } = useAnkiFieldContext();

  const $code = createMemo(() => {
    return (
      findPrefectureCode($ankiFields.Expression) ??
      findPrefectureCode($ankiFields.ExpressionReading)
    );
  });

  const $showMap = createMemo(() => $initialSide() === "back" && $code());

  function LoadingFallback() {
    return html`<div class="flex flex-col items-center gap-1">
      <span class="loading loading-dots text-base-content-calm"></span>
    </div>`;
  }

  return html`
    <Show when=${$showMap}>
      <Suspense fallback=${LoadingFallback}>
        <JapaneseMapContent ctx=${props.ctx} code=${$code}></JapaneseMapContent>
      </Suspense>
    </Show>
  `;
}

/**
 * @param {{ ctx: Ctx; code: string | null }} props
 */
function JapaneseMapContent(props) {
  const {
    html: _html,
    createMemo,
    createEffect,
    createSignal,
    createStore,
    createResource,
    onCleanup,
    Portal,
    Show,
    useGeneralContext,
  } = props.ctx;
  const html = _html.define({ Show, Portal, HoverPrefecture, HoverRegion, ExternalLink });
  const { $general } = useGeneralContext();

  const $layoutRef = createMemo(() => $general.layoutRef);
  const $code = createMemo(() => props.code);

  const [$$svg] = createResource(() => ($code() ? true : false), fetchSvg);

  const $svg = createMemo(() => {
    const text = $$svg();
    if (!text) return null;
    g.__japanesePrefecturesProcessedSvg ??= processSvg(text);
    return g.__japanesePrefecturesProcessedSvg;
  });

  const [$svgContainerRef, $setSvgContainerRef] = createSignal(
    /** @type {HTMLDivElement | null} - */ (null),
  );

  const [$state, $setState] = createStore({
    hoverCode: /** @type {string | null} */ (null),
    hoverRegion: /** @type {string | null} */ (null),
    activeCode: /** @type {string | null} */ (null),
    large: false,
  });

  const $hoverPrefecture = createMemo(() => findPrefectureByCode($state.hoverCode));
  const $hoverKanji = createMemo(() => $hoverPrefecture()?.[1]);
  const $hoverKana = createMemo(() => $hoverPrefecture()?.[2]);
  /** @param {string | null} region */
  function regionInfo(region) {
    return region ? REGIONS[region] : null;
  }

  const $hoverRegionInfo = createMemo(() => regionInfo($state.hoverRegion));
  const $hoverRegionName = createMemo(() => $hoverRegionInfo()?.[0]);
  const $hoverRegionReading = createMemo(() => $hoverRegionInfo()?.[1]);

  const [$dialogRef, $setDialogRef] = createSignal(/** @type {HTMLDialogElement | null} */ (null));

  createEffect(() => {
    const svgContainerRef = $svgContainerRef();
    const svg = $svg();
    if (!svgContainerRef || !svg) return;
    const root = svgContainerRef?.querySelector("svg");
    if (!root) return;
    const prefectures = root.querySelectorAll(".prefecture");
    for (const el of prefectures) {
      el.addEventListener("mouseenter", onHoverEnter);
      el.addEventListener("mouseleave", onHoverLeave);
      el.addEventListener("click", onPrefectureClick);
    }
    onCleanup(() => {
      for (const el of prefectures) {
        el.removeEventListener("mouseenter", onHoverEnter);
        el.removeEventListener("mouseleave", onHoverLeave);
        el.removeEventListener("click", onPrefectureClick);
      }
    });
  });

  /** @param {Event} e */
  function onHoverEnter(e) {
    const el = /** @type {SVGGElement} */ (e.currentTarget);
    el.classList.add("hover");
    $setState("hoverCode", el.dataset.code ?? null);
    $setState("hoverRegion", regionKeyOf(el));
  }

  /** @param {Event} e */
  function onHoverLeave(e) {
    const el = /** @type {SVGGElement} */ (e.currentTarget);
    el.classList.remove("hover");
    $setState("hoverCode", null);
    $setState("hoverRegion", null);
  }

  /** @param {Event} e */
  function onPrefectureClick(e) {
    const el = /** @type {SVGGElement} */ (e.currentTarget);
    $setState("activeCode", el.dataset.code ?? null);
    $dialogRef()?.showModal();
  }

  createEffect(() => {
    const svgContainerRef = $svgContainerRef();
    const svg = $svg();
    const code = $code();
    if (!svgContainerRef || !svg || !code) return;
    const root = svgContainerRef?.querySelector("svg");
    if (!root || !code) return;
    const gEl = root.querySelector(`[data-code="${code}"]`);
    let /** @type string | null | undefined */ originalFill;
    if (gEl) {
      gEl.classList.toggle("match", true);
      if (CONFIG.matchFill) {
        originalFill = gEl?.getAttribute("fill");
        gEl.setAttribute("fill", CONFIG.matchFill);
      }
    }
    onCleanup(() => {
      gEl?.classList.toggle("match", false);
      if (CONFIG.matchFill && typeof originalFill === "string")
        gEl?.setAttribute("fill", originalFill);
      if (CONFIG.matchFill && originalFill === null) gEl?.removeAttribute("fill");
    });
  });

  function HoverPrefecture() {
    return html`<div class="text-2xl text-base-content-calm">
      <ruby>${$hoverKanji}<rt>${$hoverKana}</rt></ruby>
    </div>`;
  }

  function HoverRegion() {
    return html`<div class="text-xl text-base-content-soft">
      <ruby>${$hoverRegionName}<rt>${$hoverRegionReading}</rt></ruby>
    </div>`;
  }

  /**
   * @param {{ url: string; }} props
   */
  function ExternalLink(props) {
    const $url = createMemo(() => props.url);
    return html`<a href=${$url} target="_blank" class="text-base-content-primary"> ${$url} </a>`;
  }

  const $largeLabel = createMemo(() => ($state.large ? "Shrink" : "Expand"));
  const $svgContainerStyle = createMemo(() =>
    style({ width: "100%", "max-width": $state.large ? "48rem" : "24rem" }),
  );
  function toggleLarge() {
    $setState("large", (v) => !v);
  }
  const $hoverRegion = createMemo(() => $state.hoverRegion);

  const $activePrefecture = createMemo(() => findPrefectureByCode($state.activeCode));
  const $activeKanji = createMemo(() => $activePrefecture()?.[1]);
  const $wikipediaUrl = createMemo(
    () => `https://ja.wikipedia.org/wiki/${$activePrefecture()?.[1]}`,
  );
  const $mapsUrl = createMemo(
    () => `https://www.google.com/maps/search/${$activePrefecture()?.[1]}`,
  );
  const $fudokiUrl = createMemo(() => `https://fudoki.app/prefecture/${$activePrefecture()?.[3]}`);

  return html`
    <Show when=${$code}>
      <div class="japanese-prefectures-map">
        <div innerHTML=${$svg} ref=${$setSvgContainerRef} style=${$svgContainerStyle}></div>
        <div class="japanese-prefectures-side">
          <button class="btn btn-sm text-base-content-calm" on:click=${toggleLarge}>
            ${$largeLabel}
          </button>
          <div class="flex flex-col gap-1 items-center">
            <Show when=${$hoverPrefecture}>
              <HoverPrefecture></HoverPrefecture>
            </Show>
            <Show when=${$hoverRegion}>
              <HoverRegion></HoverRegion>
            </Show>
          </div>
        </div>
        <Portal mount=${$layoutRef}>
          <dialog class="modal" ref=${$setDialogRef}>
            <div class="modal-box">
              <div class="flex flex-col gap-1">
                <div class="text-lg font-bold">${$activeKanji}</div>
                <ExternalLink url=${$wikipediaUrl}></ExternalLink>
                <ExternalLink url=${$mapsUrl}></ExternalLink>
                <ExternalLink url=${$fudokiUrl}></ExternalLink>
              </div>
              <div class="modal-action">
                <form method="dialog"><button class="btn">Close</button></form>
              </div>
            </div>
            <form method="dialog" class="modal-backdrop"><button>Close</button></form>
          </dialog>
        </Portal>
      </div>
    </Show>
  `;
}
