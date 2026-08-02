import type html from "solid-js/html";

type HtmlTagFn = typeof html;

/**
 * Wraps Solid's html tag so registered components can be written with normal
 * closing tags.
 *
 * @param html - The original tagged template html method from solid-js
 * @param components - A map of component names to their implementations
 * @returns A new html-like function that supports the registered components
 */
export function defineHtml(
  html: HtmlTagFn,
  components: Record<string, unknown>,
): HtmlTagFn {
  const componentEntries = Object.entries(components).filter(
    ([, component]) => component != null,
  );
  const componentByName = new Map(componentEntries);
  const tagNames = componentEntries
    .map(([name]) => name)
    .sort((a, b) => b.length - a.length);
  const tagPattern = tagNames.join("|");
  const openTagRe = new RegExp(`<(${tagPattern})(?=[\\s>/])`, "g");
  const closeTagRe = new RegExp(`</(${tagPattern})>`, "g");

  const marker = "\u0000";

  const fn: HtmlTagFn = (strings: TemplateStringsArray, ...values: unknown[]) => {
    const statics: string[] = [];
    const args: unknown[] = [];
    for (let i = 0; i < strings.length; i += 1) {
      let chunk = strings[i];

      chunk = chunk.replace(openTagRe, (_, name) => `<${marker}${name}${marker}`);
      chunk = chunk.replace(closeTagRe, "<//>");

      for (let j = 0; j < chunk.length; ) {
        const start = chunk.indexOf(marker, j);
        if (start === -1) {
          statics.push(chunk.slice(j));
          break;
        }

        if (start > j) statics.push(chunk.slice(j, start));

        const end = chunk.indexOf(marker, start + marker.length);
        const name = chunk.slice(start + marker.length, end);
        args.push(componentByName.get(name));
        j = end + marker.length;
      }

      if (i < values.length) args.push(values[i]);
    }

    const template = Object.assign(statics, { raw: statics.slice() });
    return html(template as TemplateStringsArray, ...args);
  };

  return fn;
}
