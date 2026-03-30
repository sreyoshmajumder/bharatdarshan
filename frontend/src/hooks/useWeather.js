import { useState, useEffect } from 'react';

import API from '../config/api';

export function useWeather(capital) {
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    if (!capital) { setLoading(false); return; }

    let cancelled = false;

    const fetchWeather = () => {
      fetch(`${API}/api/weather/${encodeURIComponent(capital)}`)
        .then(r => r.json())
        .then(data => { if (!cancelled && !data.error) setWeather(data); })
        .catch(err => { if (!cancelled) setError(err); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    fetchWeather();
    const id = setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 min
    return () => { cancelled = true; clearInterval(id); };
  }, [capital]);

  return { weather, loading, error };
}
