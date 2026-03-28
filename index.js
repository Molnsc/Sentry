import express from "express";
import { chromium } from "playwright";

const app = express();

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url" });

  const browser = await chromium.launch(); // LOCAL BROWSER (NO BrowserCat)

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const title = await page.title();
  const html = await page.content();

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a")).map(a => a.href)
  );

  await browser.close();

  res.json({ url, title, html, links });
});

app.listen(3000, () => console.log("running"));
