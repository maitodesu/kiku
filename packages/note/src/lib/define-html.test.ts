import { describe, expect, it } from "vitest";
import { createTemplateProcessor } from "./define-html";

function tag(strings: TemplateStringsArray, ...values: unknown[]) {
  return { strings, values };
}

describe("createTemplateProcessor", () => {
  it("returns original strings and values when no components registered", () => {
    const process = createTemplateProcessor({});
    const { strings, values } = tag`<div class="foo">hello ${"world"}</div>`;
    const { statics, args } = process(strings, ...values);
    expect(statics).toEqual([`<div class="foo">hello `, `</div>`]);
    expect(args).toEqual(["world"]);
  });

  it("replaces open tag of a registered component", () => {
    function MyComp() {}
    const process = createTemplateProcessor({ MyComp });
    const { strings } = tag`<MyComp />`;
    const { statics, args } = process(strings);
    // Component name is extracted into args, statics split around it
    expect(statics).toEqual(["<", " />"]);
    expect(args).toEqual([MyComp]);
  });

  it("replaces open and close tags of a registered component", () => {
    function MyComp() {}
    const process = createTemplateProcessor({ MyComp });
    const { strings } = tag`<MyComp>child</MyComp>`;
    const { statics, args } = process(strings);
    // Close tag becomes <//>, component name extracted into args
    expect(statics).toEqual(["<", ">child<//>"]);
    expect(args).toEqual([MyComp]);
  });

  it("does not replace unregistered tags", () => {
    const process = createTemplateProcessor({});
    const { strings } = tag`<Unknown>text</Unknown>`;
    const { statics, args } = process(strings);
    expect(statics).toEqual([`<Unknown>text</Unknown>`]);
    expect(args).toEqual([]);
  });

  it("handles multiple components in one template", () => {
    function CompA() {}
    function CompB() {}
    const process = createTemplateProcessor({ CompA, CompB });
    const { strings } = tag`<CompA /><CompB />`;
    const { statics, args } = process(strings);
    expect(statics).toEqual(["<", " /><", " />"]);
    expect(args).toEqual([CompA, CompB]);
  });

  it("preserves dynamic values between component tags", () => {
    function MyComp() {}
    const process = createTemplateProcessor({ MyComp });
    const { strings, values } = tag`<MyComp foo=${"bar"} />`;
    const { statics, args } = process(strings, ...values);
    expect(statics).toEqual(["<", " foo=", " />"]);
    expect(args).toEqual([MyComp, "bar"]);
  });

  it("sorts components by name length descending so longer names match first", () => {
    function A() {}
    function ABC() {}
    function AB() {}
    const process = createTemplateProcessor({ A, ABC, AB });
    const { strings } = tag`<ABC />`;
    const { statics, args } = process(strings);
    // ABC should match as a whole, not be partially matched as A + BC
    expect(statics).toEqual(["<", " />"]);
    expect(args).toEqual([ABC]);
  });

  it("filters out null/undefined component values", () => {
    const Comp = () => {};
    const process = createTemplateProcessor({ Good: Comp, Bad: null, Missing: undefined });
    const { strings } = tag`<Good /><Bad /><Missing />`;
    const { statics, args } = process(strings);
    // Only Good is a valid component; Bad and Missing are left as plain tags
    expect(statics).toEqual(["<", " /><Bad /><Missing />"]);
    expect(args).toEqual([Comp]);
  });

  it("replaces component with content and children", () => {
    function Card() {}
    const process = createTemplateProcessor({ Card });
    const { strings, values } = tag`<Card title=${"hello"}>content</Card>`;
    const { statics, args } = process(strings, ...values);
    expect(statics).toEqual(["<", " title=", ">content<//>"]);
    expect(args).toEqual([Card, "hello"]);
  });

  it("handles component tag with space before closing bracket", () => {
    function Btn() {}
    const process = createTemplateProcessor({ Btn });
    const { strings } = tag`<Btn class="x" />`;
    const { statics, args } = process(strings);
    expect(statics).toEqual(["<", ` class="x" />`]);
    expect(args).toEqual([Btn]);
  });

  it("handles mixed components, values, and plain text", () => {
    function Show() {}
    const process = createTemplateProcessor({ Show });
    const { strings, values } = tag`<div>text ${123} <Show when=${true}>inner</Show> end</div>`;
    const { statics, args } = process(strings, ...values);
    expect(statics).toEqual([
      "<div>text ",
      " <",
      " when=",
      ">inner<//> end</div>",
    ]);
    expect(args).toEqual([123, Show, true]);
  });

  it("handles nested components", () => {
    function Outer() {}
    function Inner() {}
    const process = createTemplateProcessor({ Outer, Inner });
    const { strings } = tag`<Outer><Inner /></Outer>`;
    const { statics, args } = process(strings);
    expect(statics).toEqual(["<", "><", " /><//>"]);
    expect(args).toEqual([Outer, Inner]);
  });

  it("handles component with no attributes and no children", () => {
    function Divider() {}
    const process = createTemplateProcessor({ Divider });
    const { strings } = tag`<Divider />`;
    const { statics, args } = process(strings);
    expect(statics).toEqual(["<", " />"]);
    expect(args).toEqual([Divider]);
  });

  it("handles component with only close tag (malformed)", () => {
    function Foo() {}
    const process = createTemplateProcessor({ Foo });
    const { strings } = tag`</Foo>`;
    const { statics, args } = process(strings);
    // Close tag is replaced with <//>
    expect(statics).toEqual(["<//>"]);
    expect(args).toEqual([]);
  });

  it("handles empty template", () => {
    const process = createTemplateProcessor({ Comp: () => {} });
    const { strings } = tag``;
    const { statics, args } = process(strings);
    // Empty string has length 0 so inner loop doesn't execute
    expect(statics).toEqual([]);
    expect(args).toEqual([]);
  });

  it("handles component with camelCase name", () => {
    function MyDialog() {}
    const process = createTemplateProcessor({ MyDialog });
    const { strings } = tag`<MyDialog />`;
    const { statics, args } = process(strings);
    expect(statics).toEqual(["<", " />"]);
    expect(args).toEqual([MyDialog]);
  });

  it("handles component with dot notation in name", () => {
    function Modal() {}
    const process = createTemplateProcessor({ "ui.Modal": Modal });
    const { strings } = tag`<ui.Modal />`;
    const { statics, args } = process(strings);
    expect(statics).toEqual(["<", " />"]);
    expect(args).toEqual([Modal]);
  });
});
