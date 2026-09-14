import { expect, test, type Page } from "@playwright/test";

const DEFAULT_TITLE = "Page Icon Editor";
const SHARED_TITLE = "----------------------";
const sharedUrl = (title = SHARED_TITLE) =>
  `/?${new URLSearchParams({ title, shape: "square", color: "#f97316" })}`;

async function watchTitles(page: Page) {
  const titles: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
    if (message.text().startsWith("title-trace:"))
      titles.push(message.text().slice(12));
  });
  await page.addInitScript(() => {
    new MutationObserver(() => {
      if (document.querySelector("title"))
        console.debug(`title-trace:${document.title}`);
    }).observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  return { titles, errors };
}

test("the initial HTML has the requested title even with JavaScript disabled", async ({
  browser,
  request,
}) => {
  const response = await request.get(sharedUrl());
  expect(await response.text()).toContain(`<title>${SHARED_TITLE}</title>`);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4173${sharedUrl()}`);
  await expect(page).toHaveTitle(SHARED_TITLE);
  await context.close();
});

test("slow hydration never restores the default, and late metadata is repaired", async ({
  page,
}) => {
  const { titles, errors } = await watchTitles(page);
  let releaseScripts = () => {};
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/**/*.js", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto(sharedUrl(), { waitUntil: "commit" });
    await expect(page).toHaveTitle(SHARED_TITLE);
    // Exceed the old guard's three-second expiry before React can even load.
    await page.waitForTimeout(4200);
    await expect(page).toHaveTitle(SHARED_TITLE);
  } finally {
    releaseScripts();
  }
  await expect(page.locator("#title")).toHaveValue(SHARED_TITLE);
  await page.waitForLoadState("networkidle");
  expect(titles).not.toContain(DEFAULT_TITLE);
  expect(errors).toEqual([]);

  await page.evaluate(() => {
    document.querySelector("title")!.firstChild!.textContent =
      "Late framework metadata";
  });
  await expect(page).toHaveTitle(SHARED_TITLE);
});

test("blocked React bundles still leave the correct title", async ({
  page,
}) => {
  await page.route("**/_next/**/*.js", (route) => route.abort());
  await page.goto(sharedUrl());
  await expect(page).toHaveTitle(SHARED_TITLE);
});

test("early edits, reset, and reload stay in sync with the URL", async ({
  page,
}) => {
  const { errors } = await watchTitles(page);
  await page.goto(sharedUrl());
  await expect(page.locator("#title")).toHaveValue(SHARED_TITLE);
  await page.locator("#title").fill("Work & Notes 🟠");
  await expect(page).toHaveTitle("Work & Notes 🟠");
  expect(new URL(page.url()).searchParams.get("title")).toBe("Work & Notes 🟠");
  await page.reload();
  await expect(page).toHaveTitle("Work & Notes 🟠");
  await expect(page.locator("#title")).toHaveValue("Work & Notes 🟠");
  await page.getByRole("button", { name: "Reset to Default" }).click();
  await expect(page).toHaveTitle(DEFAULT_TITLE);
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await page.reload();
  await expect(page).toHaveTitle(DEFAULT_TITLE);
  expect(errors).toEqual([]);
});

test("markup in titles is displayed as text without executing", async ({
  page,
}) => {
  const title =
    "</title><script>window.titleInjected=true</script> & 日本語 $&";
  await page.goto(sharedUrl(title));
  await expect(page).toHaveTitle(title);
  await expect(page.locator("#title")).toHaveValue(title);
  expect(await page.evaluate(() => "titleInjected" in window)).toBe(false);
});

test("whitespace titles do not cause an observer loop and empty titles survive reload", async ({
  page,
}) => {
  await page.goto(sharedUrl("  Work   notes\n here  "));
  await expect(page).toHaveTitle("Work notes here");
  await expect(page.locator("#title")).toHaveValue("  Work   notes here  ");
  await page.locator("#title").fill("");
  await expect(page).toHaveTitle("");
  await page.reload();
  await expect(page).toHaveTitle("");
  await expect(page.locator("#title")).toHaveValue("");
});

test("history navigation restores both the editor and the tab title", async ({
  page,
}) => {
  await page.goto(sharedUrl());
  await expect(page.locator("#title")).toHaveValue(SHARED_TITLE);
  await page.evaluate(() => {
    window.history.pushState(null, "", "/?title=Another+tab");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page).toHaveTitle("Another tab");
  await expect(page.locator("#title")).toHaveValue("Another tab");
  await page.goBack();
  await expect(page).toHaveTitle(SHARED_TITLE);
  await expect(page.locator("#title")).toHaveValue(SHARED_TITLE);
});

test("the plain static export applies the title without React bundles", async ({
  page,
}) => {
  await page.route("**/_next/**/*.js", (route) => route.abort());
  await page.goto(`http://127.0.0.1:4174${sharedUrl()}`);
  await expect(page).toHaveTitle(SHARED_TITLE);
});
