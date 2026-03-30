import { useState, useRef, useCallback, useEffect } from 'react';

const SCAN_RESPONSES = {
  default: [
    {
      title: 'Ancient Temple Architecture',
      description: 'This structure shows characteristics of Dravidian temple architecture, common in South India between the 7th–12th centuries CE. Note the ornate gopuram (tower), intricate carvings, and mandapa (hall) — hallmarks of Pallava and Chola period construction.',
      tags: ['Architecture', '7th Century', 'South India', 'UNESCO Heritage'],
      confidence: '94%',
    },
    {
      title: 'Indian Street Food — Chaat',
      description: 'Chaat is a category of savory snacks originating from the Indian subcontinent. Variations like pani puri, bhel puri, and sev puri are beloved across India. The dish typically combines tamarind chutney, coriander, spices, and various crispy elements.',
      tags: ['Food', 'Street Culture', 'North India', 'Traditional'],
      confidence: '91%',
    },
    {
      title: 'Mughal Garden Design',
      description: 'This landscape follows the charbagh (four-garden) style of Mughal garden design — symmetrical layouts divided by water channels representing the four rivers of paradise from Islamic cosmology. Popularized in India from the 16th century.',
      tags: ['Garden', 'Mughal Era', '16th Century', 'Heritage'],
      confidence: '88%',
    },
    {
      title: 'Traditional Indian Textile',
      description: 'The fabric appears to be handwoven with intricate patterns characteristic of Indian weaving traditions. The geometric motifs and color palette suggest influences from either Banarasi silk or Kanjeevaram weaving schools.',
      tags: ['Textile', 'Handloom', 'Traditional', 'Craft'],
      confidence: '85%',
    },
  ],
  monuments: {
    title: 'Historic Monument Detected',
    description: 'AI has identified architectural elements consistent with Indian heritage structures. Preliminary analysis suggests Indo-Islamic or Hindu temple architecture based on structural features, ornamentation patterns, and construction materials visible.',
    tags: ['Monument', 'Heritage', 'India', 'AI Analysis'],
    confidence: '92%',
  },
};

export default function ScannerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCapturedImage(null);
      setResult(null);
    } catch (e) {
      setError('Camera access denied. Please allow camera permissions or upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    setResult(null);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCapturedImage(ev.target.result);
      setUploadedFile(file.name);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    setScanning(true);
    setResult(null);
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));
    const responses = SCAN_RESPONSES.default;
    const picked = responses[Math.floor(Math.random() * responses.length)];
    setResult({
      ...picked,
      question: question || 'General analysis',
      timestamp: new Date().toLocaleString(),
    });
    setScanning(false);
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setQuestion('');
    setUploadedFile(null);
    setError(null);
  };

  const ScannerAnimation = () => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
      background: 'rgba(6,11,24,0.85)',
    }}>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          width: 80, height: 80, border: '3px solid transparent',
          borderTopColor: 'var(--clr-saffron)',
          borderRightColor: 'var(--clr-teal)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 12,
          border: '2px solid rgba(255,107,43,0.3)',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite reverse',
        }} />
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: '1.5rem',
        }}>🔍</span>
      </div>
      <p style={{ color: 'var(--clr-saffron-light)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
        AI Analyzing...
      </p>
      <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>Processing image with BharatDarshan AI</p>
    </div>
  );

  return (
    <div className="scanner-container" id="scanner-page">
      {/* Hero */}
      <div className="scanner-hero">
        <span className="section-label" style={{ margin: '0 auto var(--space-md)' }}>
          📷 AI Visual Scanner
        </span>
        <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
          Point. Scan.{' '}
          <span className="gradient-text">Discover India.</span>
        </h1>
        <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.7, marginTop: '12px' }}>
          Our AI-powered visual scanner is inspired by Google Lens — trained on India's
          rich cultural heritage, architecture, food, art, and language. Aim at anything
          and let BharatDarshan explain the story behind it.
        </p>
      </div>

      {/* Scanner Area */}
      <div className="scanner-area" id="scanner-area">
        {/* Camera / Preview */}
        <div className="camera-viewport" id="camera-viewport">
          {/* Live Camera */}
          <video
            ref={videoRef}
            style={{ display: cameraActive ? 'block' : 'none' }}
            playsInline muted autoPlay
          />
          {/* Captured / Uploaded Image */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          {/* Canvas (hidden) */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Overlay when nothing active */}
          {!cameraActive && !capturedImage && (
            <div className="camera-overlay" id="camera-overlay">
              <div style={{
                fontSize: '4rem',
                animation: 'slowFloat 4s ease-in-out infinite',
              }}>📷</div>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--clr-text-secondary)',
                marginBottom: '4px',
              }}>
                Camera Ready
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
                Start camera or upload an image to scan
              </p>
            </div>
          )}

          {/* Scanning Overlay */}
          {scanning && <ScannerAnimation />}

          {/* Capture Frame decoration */}
          {cameraActive && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
              {/* Corner brackets */}
              {[
                { top: 20, left: 20, borderTop: '3px solid var(--clr-saffron)', borderLeft: '3px solid var(--clr-saffron)' },
                { top: 20, right: 20, borderTop: '3px solid var(--clr-saffron)', borderRight: '3px solid var(--clr-saffron)' },
                { bottom: 20, left: 20, borderBottom: '3px solid var(--clr-saffron)', borderLeft: '3px solid var(--clr-saffron)' },
                { bottom: 20, right: 20, borderBottom: '3px solid var(--clr-saffron)', borderRight: '3px solid var(--clr-saffron)' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 40, height: 40, ...s }} />
              ))}
              {/* Scan line */}
              <div style={{
                position: 'absolute', left: 20, right: 20, height: 2,
                background: 'linear-gradient(90deg, transparent, var(--clr-saffron), transparent)',
                animation: 'scanLine 2s ease-in-out infinite',
                top: '50%',
              }} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="scanner-controls" id="scanner-controls">
          {!cameraActive && !capturedImage && (
            <>
              <button id="start-camera-btn" className="btn btn-primary" onClick={startCamera}>
                📷 Start Camera
              </button>
              <button id="upload-btn" className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}>
                📁 Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </>
          )}
          {cameraActive && (
            <>
              <button id="capture-btn" className="btn btn-primary" onClick={capturePhoto}
                style={{ fontSize: '1.1rem', padding: '14px 40px' }}>
                🔴 Capture
              </button>
              <button id="stop-camera-btn" className="btn btn-secondary" onClick={stopCamera}>
                ✕ Cancel
              </button>
            </>
          )}
          {capturedImage && !scanning && !result && (
            <>
              <button id="analyze-btn" className="btn btn-primary" onClick={analyzeImage}>
                🔍 Analyze with AI
              </button>
              <button id="retake-btn" className="btn btn-secondary" onClick={reset}>
                🔄 Retake
              </button>
            </>
          )}
          {(scanning || result) && (
            <button id="new-scan-btn" className="btn btn-secondary" onClick={reset}>
              🔄 New Scan
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px',
            padding: '16px',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Question Input */}
        {capturedImage && !result && (
          <div style={{ width: '100%' }}>
            <label style={{
              display: 'block', marginBottom: '8px',
              fontSize: '0.85rem', color: 'var(--clr-text-secondary)', fontWeight: 600,
            }}>
              Ask about this image (optional)
            </label>
            <input
              id="scan-question-input"
              className="form-input"
              type="text"
              placeholder="e.g. What is this monument? What century is this from? What is this food?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && capturedImage && !scanning && analyzeImage()}
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="scan-result" id="scan-result" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="scan-result-title">🤖 AI Analysis Result</div>
              <div style={{
                background: 'rgba(0,212,170,0.15)',
                border: '1px solid rgba(0,212,170,0.3)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--clr-teal-light)',
              }}>
                {result.confidence} Confidence
              </div>
            </div>

            <h3 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
              fontWeight: 800, marginBottom: '12px', color: 'var(--clr-text-primary)',
            }}>
              {result.title}
            </h3>

            {question && result.question !== 'General analysis' && (
              <div style={{
                background: 'rgba(255,107,43,0.08)',
                border: '1px solid rgba(255,107,43,0.2)',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '12px',
                fontSize: '0.85rem',
                color: 'var(--clr-saffron-light)',
              }}>
                💬 Q: {question}
              </div>
            )}

            <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.75, fontSize: '0.9rem', marginBottom: '16px' }}>
              {result.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {result.tags.map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(255,107,43,0.1)',
                  border: '1px solid rgba(255,107,43,0.25)',
                  color: 'var(--clr-saffron-light)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
              Analyzed at {result.timestamp} · BharatDarshan AI v2.0
            </div>
          </div>
        )}

        {/* Example prompts */}
        {!capturedImage && !cameraActive && (
          <div style={{ width: '100%' }}>
            <div style={{
              fontSize: '0.8rem', color: 'var(--clr-text-muted)',
              marginBottom: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Try asking about
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                '🏯 Ancient forts & monuments',
                '🛕 Temple architecture',
                '🍛 Indian cuisine',
                '🎨 Traditional art forms',
                '📜 Indian scripts & languages',
                '🌺 Native flora & fauna',
              ].map((p, i) => (
                <div key={i} style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: 'var(--clr-bg-card)',
                  border: '1px solid var(--clr-border)',
                  fontSize: '0.8rem',
                  color: 'var(--clr-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--clr-saffron)'; e.target.style.color = 'var(--clr-saffron-light)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--clr-border)'; e.target.style.color = 'var(--clr-text-secondary)'; }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 30%; opacity: 0.5; }
          50% { top: 70%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
