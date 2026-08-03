import { execSync } from "node:child_process";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig, type HeadConfig } from "vitepress";
import { vitePluginCopyKikuAssets } from "./tools/vite-plugin-copy-kiku-assets";
import { vitePluginServeKikuAssets } from "./tools/vite-plugin-serve-kiku-assets";

const umamiScript: HeadConfig = [
  "script",
  {
    defer: "true",
    src: process.env.VITE_UMAMI_URL ?? "",
    "data-website-id": process.env.VITE_UMAMI_WEBSITE_ID ?? "",
  },
];

// TODO: PURE annotation to avoid Rollup warning https://github.com/vuejs/vueuse/pull/5388

const isMainBranch = process.env.VERCEL_GIT_COMMIT_REF === "main";

function getVersionFromBranch(branch: string): string {
  execSync(`git fetch origin ${branch}`, { encoding: "utf-8" });
  const raw = execSync(`git show origin/${branch}:packages/note/package.json`, { encoding: "utf-8" });
  return JSON.parse(raw).version;
}

const kikuVersionMain = getVersionFromBranch("main");
const kikuVersionDev = getVersionFromBranch("dev");

export default defineConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === "kiku-host-docs",
      },
    },
  },
  srcDir: "mds",
  title: "Kiku",
  description: "Feature-rich, fully interactive Anki note type designed for Japanese learners.",
  head: [["link", { rel: "icon", href: "/favicon.ico" }], umamiScript],
  vite: {
    publicDir: "../public",
    plugins: [
      //@ts-expect-error rolldown/rollup type mismatch
      vueJsx(),
      vitePluginCopyKikuAssets(),
      //@ts-expect-error rolldown/rollup type mismatch
      vitePluginServeKikuAssets(),
    ],
  },
  themeConfig: {
    lastUpdated: {},
    nav: [
      { text: "Home", link: "/" },
      {
        text: isMainBranch ? kikuVersionMain : kikuVersionDev,
        items: [
          {
            text: isMainBranch ? kikuVersionDev : kikuVersionMain,
            link: isMainBranch
              ? "https://dev.kiku.youyoumu.my.id?_vercel_share=gG1YI5jKfR6YL3wxLu4OJxIVu9p2NKML"
              : "https://kiku.youyoumu.my.id",
          },
          { text: "Issues", link: "https://github.com/youyoumu/kiku/issues" },
          { text: "Releases", link: "https://github.com/youyoumu/kiku/releases" },
        ],
      },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Installation", link: "/installation" },
          { text: "Updating Kiku", link: "/updating" },
          { text: "Switching From Lapis", link: "/migration" },
        ],
      },
      {
        text: "Learn More",
        items: [
          { text: "Features", link: "/features" },
          { text: "Field Grouping", link: "/field-grouping" },
          { text: "Related Expression", link: "/related-expression" },
          { text: "Plugin", link: "/plugin" },
          { text: "How Things Work", link: "/how-things-work" },
          { text: "Development", link: "/development" },
        ],
      },
      {
        text: "Recipes",
        items: [
          { text: "Add More External Links", link: "/add-more-external-links" },
          { text: "Confetti", link: "/confetti" },
          { text: "Custom Dictionary Style", link: "/custom-dictionary-style" },
          { text: "Custom Kanji Info Extra", link: "/custom-kanji-info-extra" },
          { text: "Custom Pitch Accent Color", link: "/custom-pitch-accent-color" },
          { text: "Custom Theme", link: "/custom-theme" },
          { text: "Display Extra Fields", link: "/display-extra-fields" },
          { text: "Japanese Prefectures", link: "/japanese-prefectures" },
          { text: "Random Font", link: "/random-font" },
          { text: "Unblur Picture Automatically", link: "/unblur-picture-automatically" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/youyoumu/kiku" }],
  },
});
