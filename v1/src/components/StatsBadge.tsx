import React from 'react';

export interface StatsBadgeProps {
  username?: string;
  currentStreak?: number;
  longestStreak?: number;
  totalContributions?: number;
  isLoading?: boolean;
  error?: string;
}

export function StatsBadge({
  username = 'username',
  currentStreak = 0,
  longestStreak = 0,
  totalContributions = 0,
  isLoading = false,
  error,
}: StatsBadgeProps) {
  if (error) {
    return (
      <div className="badge-container error">
        <div className="badge-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="badge-container loading">
        <div className="badge-placeholder">
          <div className="badge-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="badge-container">
      <svg
        className="badge-svg"
        viewBox="0 0 400 150"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="400" height="150" fill="#1f6feb" rx="6" />

        {/* Flame icon background */}
        <rect x="20" y="30" width="90" height="90" fill="#0969da" rx="6" />

        {/* Flame icon (simplified) */}
        <text x="65" y="90" fontSize="40" textAnchor="middle" fill="#ffa657">
          🔥
        </text>

        {/* Current Streak */}
        <text x="130" y="50" fontSize="14" fill="#ffffff" fontWeight="600">
          Current Streak
        </text>
        <text x="130" y="75" fontSize="32" fill="#79c0ff" fontWeight="700">
          {currentStreak}
        </text>

        {/* Divider */}
        <line x1="220" y1="30" x2="220" y2="120" stroke="#30363d" strokeWidth="1" />

        {/* Longest Streak & Total Contributions */}
        <text x="240" y="50" fontSize="12" fill="#8b949e">
          Longest: <tspan fontWeight="700">{longestStreak}</tspan>
        </text>
        <text x="240" y="75" fontSize="12" fill="#8b949e">
          Total: <tspan fontWeight="700">{totalContributions}</tspan>
        </text>

        {/* Username */}
        <text x="240" y="110" fontSize="11" fill="#8b949e" fontStyle="italic">
          @{username}
        </text>
      </svg>

      <div className="badge-stats">
        <div className="stat-item">
          <span className="stat-label">Current Streak</span>
          <span className="stat-value">{currentStreak} days</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Longest Streak</span>
          <span className="stat-value">{longestStreak} days</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Contributions</span>
          <span className="stat-value">{totalContributions.toLocaleString()}</span>
        </div>
      </div>

      <style>{`
        .badge-container {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f6f8fa;
          border-radius: 8px;
          border: 1px solid #d0d7de;
        }

        .badge-svg {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .badge-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #e1e4e8;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6e7781;
          font-weight: 600;
        }

        .stat-value {
          font-size: 1.5rem;
          color: #0969da;
          font-weight: 700;
        }

        .badge-placeholder {
          width: 100%;
          max-width: 400px;
        }

        .badge-skeleton {
          width: 100%;
          height: 150px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 6px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .badge-error {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background-color: #ffebee;
          border: 1px solid #f1adad;
          border-radius: 6px;
          color: #cb2431;
        }

        .error-icon {
          font-size: 1.5rem;
        }

        .error-message {
          font-size: 0.95rem;
        }

        @media (max-width: 640px) {
          .badge-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default StatsBadge;
