import express from "express";
import { chromium } from "playwright";

const app = express();

const API_KEY = process.env.BROWSERCAT_KEY;

app.get("/scrape", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing ?url=" });
  }

  try {
    // Connect to BrowserCat (REAL BROWSER)
    const browser = await chromium.connectOverCDP(
      `wss://api.browsercat.com/connect?apiKey=${API_KEY}`
    );

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded"
    });

    const title = await page.title();
    const html = await page.content();

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map(a => a.href)
    );

    await browser.close();

    res.json({
      url,
      title,
      raw_html: html,
      links
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(3000, () => {
  console.log("Scraper running on port 3000");
});
