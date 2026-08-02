import { JapaneseMap } from "./_kiku-plugin-japanese-prefectures.js";

/**
 * @import { KikuPlugin } from "#/plugins/plugin-types";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  TopSectionEnd: (props) => {
    const html = props.ctx.html.define({ JapaneseMap });

    return html`<JapaneseMap ctx=${props.ctx}></JapaneseMap>`;
  },
};
