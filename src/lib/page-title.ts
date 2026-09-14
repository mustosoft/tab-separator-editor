export const DEFAULT_TITLE = "Page Icon Editor";

// Run while HTML is parsed, independently of the React bundles. The URL stays
// authoritative even if Next reconciles metadata later or a tab is restored.
export const applySharedTitleScript = `
(() => {
  const applyTitle = () => {
    const title = new URLSearchParams(window.location.search).get("title")
      ?? ${JSON.stringify(DEFAULT_TITLE)};
    const element = document.querySelector("title");

    // document.title normalizes whitespace; compare raw text to avoid a loop.
    if (!element || element.textContent !== title) document.title = title;
  };

  applyTitle();

  new MutationObserver(applyTitle).observe(document.head, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  window.addEventListener("pageshow", applyTitle);
  window.addEventListener("popstate", applyTitle);
})();
`;
