const express = require('express');
const router  = express.Router();

const cache    = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

router.get('/:title', async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const key   = title.toLowerCase();

  if (cache.has(key)) {
    const { data, ts } = cache.get(key);
    if (Date.now() - ts < CACHE_TTL) return res.json(data);
  }

  try {
    const slug = encodeURIComponent(title.replace(/ /g, '_'));
    const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, {
      headers: { 'User-Agent': 'BharatDarshan/1.0 (tourism educational project; https://bharatdarshan.in)' },
    });

    if (!resp.ok) return res.status(404).json({ error: 'Article not found', imageUrl: null, description: null });

    const d = await resp.json();

    // Get best quality image — prefer original, else upscale thumbnail
    let imageUrl = null;
    if (d.originalimage?.source) {
      imageUrl = d.originalimage.source;
    } else if (d.thumbnail?.source) {
      imageUrl = d.thumbnail.source.replace(/\/\d+px-/, '/640px-');
    }

    // Clean description: first paragraph only, strip trailing ellipsis
    const description = d.extract
      ? d.extract.split('\n')[0].replace(/\s*\(\/.+?\//g, '').slice(0, 400)
      : null;

    const result = { title: d.title, description, imageUrl, wikiUrl: d.content_urls?.desktop?.page || null };
    cache.set(key, { data: result, ts: Date.now() });
    return res.json(result);
  } catch (err) {
    console.error('[Wiki]', err.message);
    return res.status(500).json({ error: 'Wiki fetch failed', imageUrl: null, description: null });
  }
});

module.exports = router;
