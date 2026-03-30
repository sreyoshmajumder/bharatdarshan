import { useState, useEffect } from 'react';

import API from '../config/api';

export function useStateNews(stateName) {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!stateName) { setLoading(false); return; }

    let cancelled = false;

    const fetchNews = () => {
      fetch(`${API}/api/news/${encodeURIComponent(stateName)}`)
        .then(r => r.json())
        .then(data => { if (!cancelled) setNews(Array.isArray(data) ? data : []); })
        .catch(err => { if (!cancelled) setError(err); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchNews();
    const id = setInterval(fetchNews, 5 * 60 * 1000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(id); };
  }, [stateName]);

  return { news, loading, error };
}
