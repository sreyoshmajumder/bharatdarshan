const express = require('express');
const router  = express.Router();

const cache    = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function categorize(title = '', desc = '') {
  const t = (title + ' ' + desc).toLowerCase();
  if (/tourism|travel|heritage|tourist|monument|festival/.test(t))  return 'Tourism';
  if (/business|invest|economy|industry|startup|gdp|trade/.test(t)) return 'Business';
  if (/weather|flood|cyclone|drought|rain|storm/.test(t))           return 'Weather';
  if (/health|hospital|doctor|disease|medical/.test(t))             return 'Health';
  if (/politic|election|minister|government|party|vote/.test(t))    return 'Politics';
  if (/road|bridge|metro|railway|airport|highway/.test(t))          return 'Infrastructure';
  if (/energy|solar|power|electricity|renewable/.test(t))           return 'Energy';
  if (/education|school|college|university|exam/.test(t))           return 'Education';
  if (/sport|cricket|football|athlete|match/.test(t))               return 'Sports';
  return 'News';
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

router.get('/:state', async (req, res) => {
  const state = decodeURIComponent(req.params.state);
  const key   = state.toLowerCase();

  if (cache.has(key)) {
    const { data, ts } = cache.get(key);
    if (Date.now() - ts < CACHE_TTL) return res.json(data);
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'News API key not configured' });

  try {
    const q   = encodeURIComponent(`${state} India`);
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=en&country=in&max=10&sortby=publishedAt&apikey=${apiKey}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (!data.articles) {
      console.error('[News] GNews error:', JSON.stringify(data).slice(0, 200));
      return res.json([]);
    }

    const articles = data.articles.map(a => ({
      title:       a.title,
      description: a.description || '',
      url:         a.url,
      image:       a.image || null,
      source:      a.source?.name || 'Indian News',
      publishedAt: a.publishedAt,
      time:        timeAgo(a.publishedAt),
      category:    categorize(a.title, a.description),
    }));

    cache.set(key, { data: articles, ts: Date.now() });
    return res.json(articles);
  } catch (err) {
    console.error('[News]', err.message);
    return res.status(500).json({ error: 'News fetch failed' });
  }
});

module.exports = router;
