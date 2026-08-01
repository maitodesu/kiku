import { ErrorBoundary, Show } from "solid-js";
import { useCtxContext } from "#/src/contexts/CtxContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";

export function TopSectionEnd() {
  const { $general } = useGeneralContext();
  const ctx = useCtxContext();

  return (
    <ErrorBoundary fallback={null}>
      <Show when={$general.plugin?.TopSectionEnd}>
        {(get) => {
          const TopSectionEnd = get();
          return <TopSectionEnd ctx={ctx} />;
        }}
      </Show>
    </ErrorBoundary>
  );
}
