import type html from "solid-js/html";

type HtmlTagFn = typeof html;

const MARKER = "\u0000";

/**
 * Builds a processor that transforms tagged template literals by replacing
 * registered component tags with their implementations.
 *
 * @param components - A map of component names to their implementations
 * @returns A function that processes (strings, values) into { statics, args }
 */
export function createTemplateProcessor(components: Record<string, unknown>) {
  const componentEntries = Object.entries(components).filter(
    ([, component]) => component != null,
  );
  const componentByName = new Map(componentEntries);
  const tagNames = componentEntries
    .map(([name]) => name)
    .sort((a, b) => b.length - a.length);
  const tagPattern = tagNames.join("|");
  const openTagRe = tagPattern ? new RegExp(`<(${tagPattern})(?=[\\s>/])`, "g") : null;
  const closeTagRe = tagPattern ? new RegExp(`</(${tagPattern})>`, "g") : null;

  return function processTemplate(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): { statics: string[]; args: unknown[] } {
    const statics: string[] = [];
    const args: unknown[] = [];
    for (let i = 0; i < strings.length; i += 1) {
      let chunk = strings[i];

      if (openTagRe) {
        openTagRe.lastIndex = 0;
        chunk = chunk.replace(openTagRe, (_, name) => `<${MARKER}${name}${MARKER}`);
      }
      if (closeTagRe) {
        closeTagRe.lastIndex = 0;
        chunk = chunk.replace(closeTagRe, "<//>");
      }

      for (let j = 0; j < chunk.length; ) {
        const start = chunk.indexOf(MARKER, j);
        if (start === -1) {
          statics.push(chunk.slice(j));
          break;
        }

        if (start > j) statics.push(chunk.slice(j, start));

        const end = chunk.indexOf(MARKER, start + MARKER.length);
        const name = chunk.slice(start + MARKER.length, end);
        args.push(componentByName.get(name));
        j = end + MARKER.length;
      }

      if (i < values.length) args.push(values[i]);
    }

    return { statics, args };
  };
}

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
  const processTemplate = createTemplateProcessor(components);

  const fn: HtmlTagFn = (strings: TemplateStringsArray, ...values: unknown[]) => {
    const { statics, args } = processTemplate(strings, ...values);
    const template = Object.assign(statics, { raw: statics.slice() });
    return html(template as TemplateStringsArray, ...args);
  };

  return fn;
}
