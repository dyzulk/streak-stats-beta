import React, { useState } from 'react';
import StreakInput from './StreakInput';
import StatsBadge from './StatsBadge';

export interface StreakData {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

export function StreakDemo() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/${encodeURIComponent(username)}`);

      if (!response.ok) {
        throw new Error(`User not found: ${username}`);
      }

      const data = await response.json() as StreakData;
      setStreakData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch streak data';
      setError(message);
      setStreakData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>🔥 Streak Forge</h1>
        <p className="demo-subtitle">
          Track your GitHub contribution streaks with beautiful badges
        </p>
      </div>

      <div className="demo-content">
        <div className="demo-section">
          <h2>Enter a GitHub Username</h2>
          <StreakInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {streakData && !error && (
          <div className="demo-section">
            <h2>Your Streak Stats</h2>
            <StatsBadge
              username={streakData.username}
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
              totalContributions={streakData.totalContributions}
            />

            <div className="badge-code">
              <h3>Markdown Code for README</h3>
              <pre>
                <code>{`[![Streak Stats](https://streak-forge.example.com/api/badge/${streakData.username})](https://streak-forge.example.com?user=${streakData.username})`}</code>
              </pre>
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `[![Streak Stats](https://streak-forge.example.com/api/badge/${streakData.username})](https://streak-forge.example.com?user=${streakData.username})`
                  );
                }}
              >
                📋 Copy Code
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="demo-section">
            <StatsBadge error={error} />
          </div>
        )}
      </div>

      <style>{`
        .demo-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .demo-header h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem;
          color: #0969da;
        }

        .demo-subtitle {
          font-size: 1.1rem;
          color: #6e7781;
          margin: 0;
        }

        .demo-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .demo-section {
          padding: 2rem;
          background-color: white;
          border-radius: 12px;
          border: 1px solid #d0d7de;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .demo-section h2 {
          margin: 0 0 1.5rem;
          font-size: 1.4rem;
          color: #24292f;
        }

        .demo-section h3 {
          margin: 1.5rem 0 1rem;
          font-size: 1.1rem;
          color: #24292f;
        }

        .badge-code {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #f6f8fa;
          border-radius: 8px;
          border: 1px solid #d0d7de;
        }

        .badge-code pre {
          background-color: #0d1117;
          color: #c9d1d9;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.5rem 0 1rem;
        }

        .badge-code code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .copy-button {
          padding: 0.5rem 1rem;
          background-color: #0969da;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .copy-button:hover {
          background-color: #0860ca;
        }

        @media (max-width: 768px) {
          .demo-container {
            padding: 1rem;
          }

          .demo-header h1 {
            font-size: 2rem;
          }

          .demo-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default StreakDemo;
