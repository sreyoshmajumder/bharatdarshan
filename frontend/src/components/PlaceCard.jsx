import { useState, useEffect } from 'react';

import API from '../config/api';

const CATEGORY_COLORS = {
  Tourism:        '#FF6B2B',
  Business:       '#FFD700',
  Weather:        '#3B82F6',
  Health:         '#22C55E',
  Politics:       '#8B5CF6',
  Infrastructure: '#F59E0B',
  Energy:         '#06B6D4',
  Education:      '#EC4899',
  Sports:         '#14B8A6',
  News:           '#94A3B8',
};

export default function PlaceCard({ place, stateColor = '#FF6B2B' }) {
  const [wiki,      setWiki]      = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  const wikiTitle = place.wikiTitle || place.name;

  useEffect(() => {
    if (!wikiTitle) return;
    fetch(`${API}/api/wiki/${encodeURIComponent(wikiTitle)}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setWiki(d); })
      .catch(() => {});
  }, [wikiTitle]);

  const imageUrl   = wiki?.imageUrl || null;
  const desc       = wiki?.description || place.desc || '';
  const wikiUrl    = wiki?.wikiUrl || null;
  const shortDesc  = desc.length > 180 ? desc.slice(0, 180) + '…' : desc;

  return (
    <div className="pcard">
      {/* Image area */}
      <div className="pcard-img-wrap">
        {/* Gradient placeholder — always present beneath */}
        <div className="pcard-placeholder" style={{ background: `linear-gradient(135deg, ${stateColor}25, ${stateColor}08)` }}>
          <span className="pcard-emoji">{place.emoji}</span>
        </div>

        {/* Real Wikipedia photo */}
        {imageUrl && !imgError && (
          <img
            src={imageUrl}
            alt={place.name}
            className={`pcard-photo ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Type badge */}
        <span className="pcard-type" style={{ background: `${stateColor}20`, color: stateColor, border: `1px solid ${stateColor}40` }}>
          {place.type}
        </span>

        {/* Wikipedia link */}
        {wikiUrl && (
          <a href={wikiUrl} target="_blank" rel="noopener noreferrer" className="pcard-wiki-link" title="View on Wikipedia">
            W
          </a>
        )}
      </div>

      {/* Info */}
      <div className="pcard-body">
        <h3 className="pcard-name">{place.name}</h3>
        <p className="pcard-desc">{shortDesc}</p>
        {!wiki && (
          <div className="pcard-shimmer-line" />
        )}
      </div>
    </div>
  );
}
