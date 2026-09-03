'use client';

import { useState } from 'react';
import * as fal from '@fal-ai/client';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing generation...');

    try {
      // Set property directly on fal.config object
      fal.config.proxyUrl = '/api/proxy';

      const result = await fal.subscribe('fal-ai/minimax/h3-max/text-to-video', {
        input: {
          prompt: prompt,
          aspect_ratio: aspectRatio,
          prompt_expansion_mode: 'balanced',
        },
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            setStatus('Rendering video frames...');
          } else if (update.status === 'IN_QUEUE') {
            setStatus('In queue...');
          }
        },
      });

      if (result.data?.video?.url) {
        setVideoUrl(result.data.video.url);
      } else {
        throw new Error('No video output received.');
      }
    } catch (err) {
      console.error(err);
      setError(`Generation failed: ${err.message || 'Check FAL_KEY in Vercel settings.'}`);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <main style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Studio Video AI</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Generate high-definition AI videos from text descriptions.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the motion, scene, lighting, and audio details..."
            rows={4}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Aspect Ratio</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait / Reels)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="21:9">21:9 (Cinematic Ultra-Wide)</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            padding: '14px',
            backgroundColor: loading ? '#888' : '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? status || 'Generating...' : 'Generate Video'}
        </button>
      </div>

      {error && <p style={{ color: '#d93025', marginTop: '16px' }}>{error}</p>}

      {videoUrl && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Result</h2>
          <video src={videoUrl} controls autoPlay loop style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        </div>
      )}
    </main>
  );
  }
