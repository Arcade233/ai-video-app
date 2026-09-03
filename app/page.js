'use client';

import { useState } from 'react';
import * as fal from '@fal-ai/client';

fal.config.proxyUrl = '/api/fal/proxy';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const generateVideo = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const result = await fal.subscribe('fal-ai/minimax/video', {
        input: {
          prompt: prompt,
        },
      });

      if (result.data?.video?.url) {
        setVideoUrl(result.data.video.url);
      } else {
        throw new Error('No video URL returned.');
      }
    } catch (err) {
      console.error(err);
      setError('Error generating video. Verify your FAL_KEY environment variable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>AI Text-to-Video Generator</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your scene description..."
        rows={4}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
      />
      <button
        onClick={generateVideo}
        disabled={loading}
        style={{ width: '100%', padding: '12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}
      >
        {loading ? 'Generating Video...' : 'Generate Video'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

      {videoUrl && (
        <div style={{ marginTop: '20px' }}>
          <video src={videoUrl} controls autoPlay loop style={{ width: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </main>
  );
        }
