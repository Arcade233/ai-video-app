"use client";

import { useState } from "react";
import { fal } from "@fal-ai/client";

// Configure client to route requests through the local secure proxy
fal.config({ proxyUrl: "/api/fal/proxy" });

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setStatus("Please enter a video description first.");
      return;
    }

    setLoading(true);
    setStatus("Connecting to AI queue...");
    setVideoUrl(null);

    try {
      // Subscribes to the MiniMax Text-to-Video engine on Fal.ai
      const result = await fal.subscribe("fal-ai/minimax/video-01", {
        input: {
          prompt: prompt,
          prompt_optimizer: true
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            setStatus("Rendering video frames... (approx 60s)");
          } else if (update.status === "IN_QUEUE") {
            setStatus("Waiting in processing queue...");
          }
        },
      });

      if (result?.data?.video?.url) {
        setVideoUrl(result.data.video.url);
        setStatus("Video generated successfully!");
      } else {
        setStatus("Rendering finished, but no video file was returned.");
      }
    } catch (err) {
      console.error("Generation Error:", err);
      setStatus("Error generating video. Verify your FAL_KEY environment variable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "8px" }}>
          AI Text-to-Video Generator
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", textAlign: "center", marginBottom: "24px" }}>
          Type a detailed scene description below to render an MP4 clip.
        </p>

        <div style={{ backgroundColor: "#1e293b", padding: "16px", borderRadius: "12px", border: "1px solid #334155" }}>
          <label style={{ fontSize: "12px", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
            Video Prompt
          </label>
          <textarea
            style={{
              width: "100%",
              height: "110px",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "1px solid #475569",
              fontSize: "14px",
              boxSizing: "border-box",
              resize: "none"
            }}
            placeholder="A cinematic aerial drone shot over ocean waves crashing against rocky cliffs at sunset..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button
            onClick={generateVideo}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              backgroundColor: loading ? "#475569" : "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Generating..." : "Generate Video"}
          </button>

          {status && (
            <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", marginTop: "12px" }}>
              {status}
            </p>
          )}

          {videoUrl && (
            <div style={{ marginTop: "16px" }}>
              <video
                controls
                autoPlay
                loop
                src={videoUrl}
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #334155" }}
              />
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                download="ai-video.mp4"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "8px",
                  color: "#38bdf8",
                  fontSize: "13px",
                  textDecoration: "none"
                }}
              >
                Download MP4 File
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
