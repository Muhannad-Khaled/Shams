'use client';

import { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  DisconnectButton,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

function VoiceAssistantUI() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="voice-assistant-container">
      <div className="status-indicator">
        <span className={`status-dot ${state}`}></span>
        <span className="status-text">
          {state === 'listening' && 'Listening...'}
          {state === 'thinking' && 'Thinking...'}
          {state === 'speaking' && 'Speaking...'}
          {state === 'idle' && 'Ready'}
          {state === 'connecting' && 'Connecting...'}
          {state === 'disconnected' && 'Disconnected'}
        </span>
      </div>

      <div className="visualizer-wrapper">
        <BarVisualizer
          state={state}
          barCount={7}
          trackRef={audioTrack}
          className="audio-visualizer"
        />
      </div>

      <div className="controls">
        <VoiceAssistantControlBar />
        <DisconnectButton className="disconnect-btn">
          End Call
        </DisconnectButton>
      </div>
    </div>
  );
}

export default function Home() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/connection-details', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }
      const details = await response.json();
      setConnectionDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectionDetails(null);
  }, []);

  return (
    <main className="main-container">
      <div className="content">
        <h1 className="title">Shams</h1>
        <p className="subtitle">Your bright AI companion</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!connectionDetails ? (
          <div className="start-section">
            <button
              onClick={connect}
              disabled={isConnecting}
              className="start-button"
            >
              {isConnecting ? (
                <>
                  <span className="spinner"></span>
                  Connecting...
                </>
              ) : (
                'Start Voice Call'
              )}
            </button>
            <p className="hint">
              Click to start talking with Shams
            </p>
          </div>
        ) : (
          <LiveKitRoom
            serverUrl={connectionDetails.serverUrl}
            token={connectionDetails.participantToken}
            connect={true}
            audio={true}
            onDisconnected={disconnect}
            className="livekit-room"
          >
            <VoiceAssistantUI />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          min-height: 100vh;
          color: #ffffff;
        }

        .main-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .content {
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #00d9ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #8892b0;
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff6b6b;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .start-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .start-button {
          background: linear-gradient(135deg, #00d9ff 0%, #00ff88 100%);
          color: #1a1a2e;
          border: none;
          padding: 16px 48px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .start-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
        }

        .start-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hint {
          color: #5a6a8a;
          font-size: 0.875rem;
        }

        .voice-assistant-container {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #5a6a8a;
          transition: all 0.3s ease;
        }

        .status-dot.listening {
          background: #00ff88;
          box-shadow: 0 0 15px #00ff88;
          animation: pulse 1.5s infinite;
        }

        .status-dot.thinking {
          background: #ffaa00;
          box-shadow: 0 0 15px #ffaa00;
          animation: pulse 0.8s infinite;
        }

        .status-dot.speaking {
          background: #00d9ff;
          box-shadow: 0 0 15px #00d9ff;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .status-text {
          font-size: 1rem;
          color: #a8b2d1;
          font-weight: 500;
        }

        .visualizer-wrapper {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .audio-visualizer {
          width: 100%;
          height: 100%;
        }

        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .disconnect-btn {
          background: rgba(255, 100, 100, 0.2);
          color: #ff6b6b;
          border: 1px solid rgba(255, 100, 100, 0.3);
          padding: 12px 32px;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .disconnect-btn:hover {
          background: rgba(255, 100, 100, 0.3);
          border-color: rgba(255, 100, 100, 0.5);
        }

        .livekit-room {
          width: 100%;
        }
      `}</style>
    </main>
  );
}
