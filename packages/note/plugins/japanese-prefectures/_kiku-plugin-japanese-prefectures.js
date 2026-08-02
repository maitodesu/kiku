/**
 * Renders a map of Japan's prefectures as a quiz.
 *
 * Front: shows only the map, user clicks a prefecture to answer.
 * Back: shows the result (correct/wrong) with the full map and legend.
 */

const CONFIG = {
  defaultFill: "#EEEEEE",
  boundaryStroke: "#888888",
  matchFill: "#86efac",
  wrongFill: "#fca5a5",
  expandMap: false,
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
 * @param {string} svgText
 * @param {Ctx["style"]} style
 */
function processSvg(svgText, style) {
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
  __japanesePrefecturesCSSStyleSheet?: CSSStyleSheet;
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
  const { createMemo, Suspense, Show, useAnkiFieldContext } = props.ctx;
  const html = props.ctx.html.define({ Show, Suspense, JapaneseMapContent });
  const { $ankiFields } = useAnkiFieldContext();

  const $code = createMemo(() => {
    return (
      findPrefectureCode($ankiFields.Expression) ??
      findPrefectureCode($ankiFields.ExpressionReading)
    );
  });

  const $showMap = createMemo(() => !!$code());

  function LoadingFallback() {
    return html`<div class="flex flex-col items-center gap-1 animate-fade-in">
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
    createMemo,
    createEffect,
    createSignal,
    createStore,
    createResource,
    onCleanup,
    Portal,
    Show,
    For,
    useGeneralContext,
    useCardContext,
    useAnkiFieldContext,
    style,
  } = props.ctx;
  const html = props.ctx.html.define({
    Show,
    Portal,
    For,
    HoverPrefecture,
    RegionItem,
    RegionLegend,
    ExternalLink,
  });
  const { $general } = useGeneralContext();
  const { $initialSide } = useCardContext();
  const { $ankiFields } = useAnkiFieldContext();

  const $cardId = createMemo(() => $ankiFields.CardID);
  const $isFront = createMemo(() => $initialSide() === "front");
  const $side = createMemo(() => $initialSide());

  async function fetchPluginCSS() {
    const shadow = $general.host?.shadowRoot;
    if (!shadow) return null;
    const css = g.__japanesePrefecturesCSSStyleSheet;
    if (css) {
      if (!shadow.adoptedStyleSheets.includes(css)) {
        shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, css];
      }
      return css;
    }
    const res = await fetch("_kiku-plugin-japanese-prefectures.css");
    const text = await res.text();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(text);
    g.__japanesePrefecturesCSSStyleSheet = sheet;
    shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    return sheet;
  }

  const [$$css] = createResource(() => true, fetchPluginCSS);

  const $layoutRef = createMemo(() => $general.layoutRef);
  const $code = createMemo(() => props.code);

  const [$$svg] = createResource(() => ($$css() && $code() ? true : false), fetchSvg);

  const $svg = createMemo(() => {
    const text = $$svg();
    if (!text) return null;
    g.__japanesePrefecturesProcessedSvg ??= processSvg(text, style);
    return g.__japanesePrefecturesProcessedSvg;
  });

  const [$svgContainerRef, $setSvgContainerRef] = createSignal(
    /** @type {HTMLDivElement | null} - */ (null),
  );

  const [$state, $setState] = createStore({
    hoverCode: /** @type {string | null} */ (null),
    hoverRegion: /** @type {string | null} */ (null),
    activeCode: /** @type {string | null} */ (null),
    expandMap: sessionStorage.getItem("jp-map-expand") === "true" ? true : CONFIG.expandMap,
    answeredCode: /** @type {string | null} */ (null),
  });

  const $hoverPrefecture = createMemo(() => findPrefectureByCode($state.hoverCode));
  const $hoverKanji = createMemo(() => {
    const kanji = $hoverPrefecture()?.[1] ?? "";
    return kanji === "北海道" ? kanji : kanji.replace(/[都道府県]$/, "");
  });
  const $hoverKana = createMemo(() => $hoverPrefecture()?.[2]);

  const [$dialogRef, $setDialogRef] = createSignal(/** @type {HTMLDialogElement | null} */ (null));

  // On back: load saved answer
  createEffect(() => {
    if ($isFront()) return;
    const cardId = $cardId();
    if (!cardId) return;
    const saved = sessionStorage.getItem(`jp-map-answer-${cardId}`);
    if (saved) {
      $setState("answeredCode", saved);
      sessionStorage.removeItem(`jp-map-answer-${cardId}`);
    }
  });

  // Remove <title> elements on front to prevent answer leak
  createEffect(() => {
    if (!$isFront()) return;
    const svgContainerRef = $svgContainerRef();
    const svg = $svg();
    if (!svgContainerRef || !svg) return;
    const root = svgContainerRef?.querySelector("svg");
    if (!root) return;
    const titles = root.querySelectorAll("title");
    const removed = /** @type {[Node, HTMLElement][]} */ ([]);
    for (const el of titles) {
      if (el.parentNode) {
        removed.push([el.parentNode, el]);
        el.parentNode.removeChild(el);
      }
    }
    onCleanup(() => {
      for (const [parent, el] of removed) {
        parent?.appendChild(el);
      }
    });
  });

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
    if (!$isFront()) {
      // On back: open dialog for clicked prefecture
      const el = /** @type {SVGGElement} */ (e.currentTarget);
      $setState("activeCode", el.dataset.code ?? null);
      $dialogRef()?.showModal();
      return;
    }
    // On front: save answer and flip card
    const el = /** @type {SVGGElement} */ (e.currentTarget);
    const code = el.dataset.code;
    const cardId = $cardId();
    if (code && cardId) {
      sessionStorage.setItem(`jp-map-answer-${cardId}`, code);
      if (typeof pycmd !== "undefined") {
        pycmd("ans");
      }
    }
  }

  // Highlight correct answer on back
  createEffect(() => {
    if ($isFront()) return;
    const svgContainerRef = $svgContainerRef();
    const svg = $svg();
    const code = $code();
    if (!svgContainerRef || !svg || !code) return;
    const root = svgContainerRef?.querySelector("svg");
    if (!root || !code) return;
    const gEl = root.querySelector(`[data-code="${code}"]`);
    let /** @type string | null | undefined */ originalFill;
    if (gEl) {
      gEl.setAttribute("data-match", "");
      originalFill = gEl?.getAttribute("fill");
      gEl.setAttribute("fill", CONFIG.matchFill);
    }
    onCleanup(() => {
      gEl?.removeAttribute("data-match");
      if (originalFill !== undefined) {
        if (typeof originalFill === "string") gEl?.setAttribute("fill", originalFill);
        else gEl?.removeAttribute("fill");
      }
    });
  });

  // Highlight wrong answer on back (only if different from correct)
  createEffect(() => {
    const svgContainerRef = $svgContainerRef();
    const svg = $svg();
    const answeredCode = $state.answeredCode;
    const correctCode = $code();
    if (!svgContainerRef || !svg || !answeredCode || !correctCode) return;
    if (answeredCode === correctCode) return;
    const root = svgContainerRef?.querySelector("svg");
    if (!root) return;
    const gEl = root.querySelector(`[data-code="${answeredCode}"]`);
    let /** @type string | null | undefined */ originalFill;
    if (gEl) {
      gEl.setAttribute("data-wrong", "");
      if (CONFIG.wrongFill) {
        originalFill = gEl?.getAttribute("fill");
        gEl.setAttribute("fill", CONFIG.wrongFill);
      }
    }
    onCleanup(() => {
      gEl?.removeAttribute("data-wrong");
      if (originalFill !== undefined) {
        if (typeof originalFill === "string") gEl?.setAttribute("fill", originalFill);
        else gEl?.removeAttribute("fill");
      }
    });
  });

  function HoverPrefecture() {
    return html`<div class="jp-hover__name text-base-content-calm">
      <ruby>${$hoverKanji}<rt>${$hoverKana}</rt></ruby>
    </div>`;
  }

  /**
   * @param {{ key: string; color: string; region: [string, string] | undefined }} props
   */
  function RegionItem(props) {
    const name = props.region?.[0] ?? props.key;
    const reading = props.region?.[1];
    const $isActive = createMemo(() => $state.hoverRegion === props.key);
    const $dataActive = createMemo(() => $isActive() || undefined);
    const $dotStyle = createMemo(() => style({ "background-color": props.color }));
    return html`
      <div class="jp-legend__item" data-active=${$dataActive}>
        <div class="flex items-center gap-1">
          <div class="jp-legend__dot" style=${$dotStyle}></div>
          <ruby>${name}<rt>${reading}</rt></ruby>
        </div>
      </div>
    `;
  }

  function RegionLegend() {
    const entries = Object.entries(CONFIG.regionColors);
    /** @param {[string, string]} entry */
    function renderItem(entry) {
      const [key, color] = entry;
      const region = REGIONS[key];
      return html`<RegionItem key=${key} color=${color} region=${region}></RegionItem>`;
    }
    return html`<div class="jp-legend text-sm text-base-content-soft">
      <For each=${entries}>${renderItem}</For>
    </div>`;
  }

  /**
   * @param {{ url: string; }} props
   */
  function ExternalLink(props) {
    const $url = createMemo(() => props.url);
    return html`<a href=${$url} target="_blank" class="text-base-content-primary"> ${$url} </a>`;
  }

  const $expandMapLabel = createMemo(() => ($state.expandMap ? "Shrink" : "Expand"));
  const toggleLarge = () => {
    $setState("expandMap", (v) => {
      sessionStorage.setItem("jp-map-expand", String(!v));
      return !v;
    });
  };

  const $activePref = createMemo(() => findPrefectureByCode($state.activeCode));
  const $activeKanji = createMemo(() => $activePref()?.[1]);
  const $wikipediaUrl = createMemo(() => `https://ja.wikipedia.org/wiki/${$activePref()?.[1]}`);
  const $mapsUrl = createMemo(() => `https://www.google.com/maps/search/${$activePref()?.[1]}`);
  const $fudokiUrl = createMemo(() => `https://fudoki.app/prefecture/${$activePref()?.[3]}`);
  const $dataExpandMap = createMemo(() => $state.expandMap || undefined);
  const $jpMapClassList = createMemo(() => ({ "animate-fade-in": $isFront() }));

  return html`
    <Show when=${$code}>
      <div class="jp-map" classList=${$jpMapClassList} data-side=${$side}>
        <div
          class="jp-map__svg"
          innerHTML=${$svg}
          ref=${$setSvgContainerRef}
          data-expand-map=${$dataExpandMap}
        ></div>
        <div class="jp-hover">
          <Show when=${$hoverPrefecture}>
            <HoverPrefecture></HoverPrefecture>
          </Show>
        </div>
        <div class="jp-controls">
          <RegionLegend></RegionLegend>
          <button class="btn btn-sm text-base-content-calm" on:click=${toggleLarge}>
            ${$expandMapLabel}
          </button>
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
