const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const { runEndpoint } = require("./monid");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/monid/competitors", async (req, res) => {
  const { domain, country = "us" } = req.body;
  if (!domain) return res.status(400).json({ error: "domain is required" });

  const GENERIC_DOMAINS = new Set([
    "instagram.com", "reddit.com", "youtube.com", "facebook.com",
    "twitter.com", "x.com", "linkedin.com", "pinterest.com",
    "tiktok.com", "amazon.com", "wikipedia.org", "yelp.com",
  ]);

  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await runEndpoint(
      "ahrefs",
      "/site-explorer/organic-competitors",
      {
        query: {
          target: domain,
          date: today,
          country,
          limit: 10,
          order_by: "keywords_common:desc",
        },
      }
    );
    if (result.output?.rows) {
      result.output.rows = result.output.rows
        .filter((r) => !GENERIC_DOMAINS.has(r.competitor_domain))
        .slice(0, 5);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * POST /monid/reddit
 * Monid: apify /trudax/reddit-scraper-lite
 * Body:
 *   searches: string[]        — search terms (required)
 *   sort: "relevance"|"hot"|"top"|"new"|"rising"|"comments"  (default "new")
 *   time: "all"|"hour"|"day"|"week"|"month"|"year"           (default "week")
 *   maxItems: number          — max results to return         (default 10)
 *   searchComments: boolean   — also search comments          (default false)
 *   community: string         — scope search to a subreddit   (optional)
 *
 * Cost: $0.0057/result + $0.04 flat
 */
app.post("/monid/reddit", async (req, res) => {
  const {
    searches,
    sort = "new",
    time = "week",
    maxItems = 10,
    searchComments = false,
    community,
  } = req.body;
  if (!searches?.length) return res.status(400).json({ error: "searches[] is required" });

  try {
    const result = await runEndpoint("apify", "/trudax/reddit-scraper-lite", {
      body: {
        searches,
        sort,
        time,
        maxItems,
        maxPostCount: maxItems,
        maxComments: searchComments ? 5 : 0,
        searchPosts: true,
        searchComments,
        skipComments: !searchComments,
        includeNSFW: false,
        includeMediaLinks: true,
        ...(community ? { searchCommunityName: community } : {}),
      },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * POST /monid/linkedin
 * Monid: apify /harvestapi/linkedin-post-search
 * Body:
 *   searchQueries: string[]   — search terms (required)
 *   maxPosts: number          — max posts per query           (default 10)
 *   postedLimit: "any"|"1h"|"24h"|"week"|"month"|"3months"|"6months"|"year"  (default "month")
 *   sortBy: "relevance"|"date"                                (default "date")
 *   authorUrls: string[]      — filter by company/profile URLs (optional)
 *
 * Cost: $0.018/result
 */
app.post("/monid/linkedin", async (req, res) => {
  const {
    searchQueries,
    maxPosts = 10,
    postedLimit = "month",
    sortBy = "date",
    authorUrls,
  } = req.body;
  if (!searchQueries?.length) return res.status(400).json({ error: "searchQueries[] is required" });

  try {
    const result = await runEndpoint("apify", "/harvestapi/linkedin-post-search", {
      body: {
        searchQueries,
        maxPosts,
        postedLimit,
        sortBy,
        ...(authorUrls?.length ? { authorUrls } : {}),
      },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * POST /monid/twitter
 * Monid: apify /apidojo/tweet-scraper
 * Body:
 *   searchTerms: string[]     — search terms (required)
 *   maxItems: number          — max tweets to return          (default 20)
 *   sort: "Top"|"Latest"|"Latest + Top"                      (default "Latest")
 *   tweetLanguage: string     — ISO 639-1 code               (default "en")
 *   start: string             — start date YYYY-MM-DD         (optional)
 *   end: string               — end date YYYY-MM-DD           (optional)
 *
 * Cost: $0.0006/result
 */
app.post("/monid/twitter", async (req, res) => {
  const {
    searchTerms,
    maxItems = 20,
    sort = "Latest",
    tweetLanguage = "en",
    start,
    end,
  } = req.body;
  if (!searchTerms?.length) return res.status(400).json({ error: "searchTerms[] is required" });

  try {
    const result = await runEndpoint("apify", "/apidojo/tweet-scraper", {
      body: {
        searchTerms,
        maxItems,
        sort,
        tweetLanguage,
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
      },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * POST /monid/instagram
 * Monid: apify /apify/instagram-hashtag-scraper
 * Body:
 *   hashtags: string[]        — hashtags or keywords (required, without #)
 *   keywordSearch: boolean    — treat input as keywords not hashtags  (default true)
 *   resultsType: "posts"|"reels"                                     (default "posts")
 *   resultsLimit: number      — max results per hashtag/keyword      (default 10)
 *
 * Cost: $0.00345/call
 */
app.post("/monid/instagram", async (req, res) => {
  const {
    hashtags,
    keywordSearch = true,
    resultsType = "posts",
    resultsLimit = 10,
  } = req.body;
  if (!hashtags?.length) return res.status(400).json({ error: "hashtags[] is required" });

  try {
    const result = await runEndpoint("apify", "/apify/instagram-hashtag-scraper", {
      body: {
        hashtags,
        keywordSearch,
        resultsType,
        resultsLimit,
      },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.api = onRequest({ secrets: ["MONID_KEY"] }, app);
