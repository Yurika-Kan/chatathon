const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const { runEndpoint } = require("./monid");
const { createClient, getClient, updateClient, listClients } = require("./db");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/*
 * POST /clients
 * Create a new client.
 * Body: { name, website, socials?: { linkedin?, instagram?, twitter?, reddit? } }
 * Returns: the created client object with id
 */
app.post("/clients", async (req, res) => {
  const { name, website, socials } = req.body;
  if (!name || !website) return res.status(400).json({ error: "name and website are required" });

  try {
    const client = await createClient({ name, website, socials });
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * GET /clients
 * List all clients.
 */
app.get("/clients", async (req, res) => {
  try {
    const all = await listClients();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * GET /clients/:id
 * Get a single client by id.
 */
app.get("/clients/:id", async (req, res) => {
  try {
    const client = await getClient(req.params.id);
    if (!client) return res.status(404).json({ error: "client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * PATCH /clients/:id
 * Update a client. Body can include any fields: name, website, socials, competitors, icps
 */
app.patch("/clients/:id", async (req, res) => {
  try {
    const client = await updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ error: "client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function normalizeSocial(platform, raw) {
  if (!raw) return null;
  const val = raw.trim().replace(/\/+$/, "");

  switch (platform) {
    case "linkedin": {
      // Accept full URL or just slug like "campco" or "company/campco"
      if (val.includes("linkedin.com")) {
        const match = val.match(/linkedin\.com\/company\/([^/?]+)/);
        return {
          url: val.startsWith("http") ? val : `https://${val}`,
          handle: match ? match[1] : val.split("/").pop(),
        };
      }
      const slug = val.replace(/^company\//, "");
      return {
        url: `https://www.linkedin.com/company/${slug}`,
        handle: slug,
      };
    }
    case "instagram": {
      if (val.includes("instagram.com")) {
        const handle = val.split("/").filter(Boolean).pop();
        return { url: `https://www.instagram.com/${handle}`, handle };
      }
      const handle = val.replace(/^@/, "");
      return { url: `https://www.instagram.com/${handle}`, handle };
    }
    case "twitter": {
      if (val.includes("twitter.com") || val.includes("x.com")) {
        const handle = val.split("/").filter(Boolean).pop();
        return { url: `https://x.com/${handle}`, handle };
      }
      const handle = val.replace(/^@/, "");
      return { url: `https://x.com/${handle}`, handle };
    }
    case "reddit": {
      if (val.includes("reddit.com")) {
        const match = val.match(/r\/([^/?]+)/);
        const sub = match ? match[1] : val.split("/").filter(Boolean).pop();
        return { url: `https://www.reddit.com/r/${sub}`, handle: sub };
      }
      const sub = val.replace(/^r\//, "");
      return { url: `https://www.reddit.com/r/${sub}`, handle: sub };
    }
    default:
      return null;
  }
}

/*
 * POST /onboard
 * Registers a new client with normalized social links.
 * Body:
 *   name: string              — company name (required)
 *   website: string           — company website URL (required)
 *   socials: {                — accepts handles, @handles, or full URLs
 *     linkedin?: string       — e.g. "campco", "company/campco", or full URL
 *     instagram?: string      — e.g. "campcocoffee", "@campcocoffee", or full URL
 *     twitter?: string        — e.g. "campcocoffee", "@campcocoffee", or full URL
 *     reddit?: string         — e.g. "coffee", "r/coffee", or full URL
 *   }
 *   country?: string          — 2-letter code for competitor discovery (default "us")
 *
 * Also runs Ahrefs competitor discovery and persists the result on the client.
 * Discovery is best-effort: on failure the client is still created and the
 * response carries a `competitorsError` string.
 *
 * Response: {
 *   client: {
 *     id, name, website,
 *     socials: {
 *       linkedin:  { url, handle } | null,
 *       instagram: { url, handle } | null,
 *       twitter:   { url, handle } | null,
 *       reddit:    { url, handle } | null
 *     },
 *     competitors: [
 *       { domain, website, domainRating, sharedKeywords, overlapShare, estimatedTraffic }
 *     ],
 *     icps: [], createdAt
 *   },
 *   competitorsError?: string
 * }
 */
app.post("/onboard", async (req, res) => {
  const { name, website, socials, country = "us" } = req.body;
  if (!name || !website) return res.status(400).json({ error: "name and website are required" });

  const normalizedWebsite = website.startsWith("http") ? website : `https://${website}`;

  try {
    const client = await createClient({
      name,
      website: normalizedWebsite,
      socials: {
        linkedin: normalizeSocial("linkedin", socials?.linkedin),
        instagram: normalizeSocial("instagram", socials?.instagram),
        twitter: normalizeSocial("twitter", socials?.twitter),
        reddit: normalizeSocial("reddit", socials?.reddit),
      },
    });

    // Competitor discovery is best-effort — a client record is still useful without it.
    let competitorsError = null;
    try {
      const domain = new URL(normalizedWebsite).hostname.replace(/^www\./, "");
      const { competitors } = await discoverCompetitors(domain, country);
      if (competitors.length) {
        client.competitors = competitors;
        await updateClient(client.id, { competitors });
      }
    } catch (err) {
      competitorsError = err.message;
    }

    res.status(201).json({ client, ...(competitorsError ? { competitorsError } : {}) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const GENERIC_DOMAINS = new Set([
  "instagram.com", "reddit.com", "youtube.com", "facebook.com",
  "twitter.com", "x.com", "linkedin.com", "pinterest.com",
  "tiktok.com", "amazon.com", "wikipedia.org", "yelp.com",
]);

/*
 * Ahrefs organic-competitors, filtered down to real competitors.
 * Returns { raw, competitors } where competitors is:
 *   [{ domain, website, domainRating, sharedKeywords, overlapShare, estimatedTraffic }]
 */
async function discoverCompetitors(domain, country = "us") {
  const today = new Date().toISOString().split("T")[0];
  const raw = await runEndpoint("ahrefs", "/site-explorer/organic-competitors", {
    query: {
      target: domain,
      date: today,
      country,
      limit: 10,
      order_by: "keywords_common:desc",
    },
  });

  const rows = (raw.output?.rows ?? [])
    .filter((r) => !GENERIC_DOMAINS.has(r.competitor_domain))
    .slice(0, 5);

  if (raw.output?.rows) raw.output.rows = rows;

  const competitors = rows.map((r) => ({
    domain: r.competitor_domain.replace(/^www\./, ""),
    website: `https://${r.competitor_domain}`,
    domainRating: r.domain_rating ?? null,
    sharedKeywords: r.keywords_common ?? null,
    overlapShare: r.share ?? null,
    estimatedTraffic: r.traffic ?? null,
  }));

  return { raw, competitors };
}

app.post("/monid/competitors", async (req, res) => {
  const { domain, country = "us" } = req.body;
  if (!domain) return res.status(400).json({ error: "domain is required" });

  try {
    const { raw, competitors } = await discoverCompetitors(domain, country);
    res.json({ ...raw, competitors });
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
