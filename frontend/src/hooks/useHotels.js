import { useState, useEffect } from 'react';

import API from '../config/api';

export function useHotels(lat, lon, capital) {
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    fetch(`${API}/api/hotels/${lat}/${lon}?capital=${encodeURIComponent(capital || '')}`)
      .then(r => r.json())
      .then(data => { setHotels(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [lat, lon]);

  return { hotels, loading, error };
}
