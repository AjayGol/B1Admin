import { siteTest as test, expect } from "./helpers/test-fixtures";

// ZERUBBABEL is the marker name for blog authoring tests. Any "Zerubbabel"
// post/page left behind is a result of this spec.
test.describe.serial("Blog Authoring", () => {
  test.describe.configure({ retries: 0 });

  const TITLE = "Zerubbabel Blog Post";

  test("create post → row appears → linked page exists → delete → gone", async ({ page }) => {
    // Enter the Blog section from the website secondary bar.
    await page.locator('[id="secondaryMenu"]').getByText("Blog", { exact: true }).first().click();
    await page.waitForURL(/\/site\/blog/, { timeout: 15000 });

    // Add a post; the save also creates the linked builder page.
    await page.locator('[data-testid="add-post-button"]').first().click();
    await page.locator('[data-testid="blog-title-input"] input').fill(TITLE);

    const postPost = page.waitForResponse((r) => r.url().includes("/content/posts") && r.request().method() === "POST", { timeout: 20000 });
    const pagePost = page.waitForResponse((r) => r.url().includes("/content/pages") && r.request().method() === "POST", { timeout: 20000 });
    await page.getByRole("button", { name: "Save" }).click();
    await pagePost;
    await postPost;

    // Row shows up in the table.
    const row = page.locator("td").getByText(TITLE, { exact: true });
    await expect(row).toHaveCount(1, { timeout: 10000 });

    // "Edit content" opens the linked builder page in the editor/preview route.
    await page.locator('[data-testid="edit-post-content-button"]').first().click();
    await page.waitForURL(/\/site\/pages\/preview\//, { timeout: 15000 });

    // Back to the blog list and delete the post (+ its page).
    await page.locator('[id="secondaryMenu"]').getByText("Blog", { exact: true }).first().click();
    await page.waitForURL(/\/site\/blog/, { timeout: 15000 });
    await page.locator('[data-testid="delete-post-button"]').first().click();
    const deleteReq = page.waitForResponse((r) => r.url().includes("/content/posts/") && r.request().method() === "DELETE", { timeout: 15000 });
    await page.getByRole("button", { name: "Delete" }).click();
    await deleteReq;

    await expect(page.locator("td").getByText(TITLE, { exact: true })).toHaveCount(0, { timeout: 10000 });
  });
});
