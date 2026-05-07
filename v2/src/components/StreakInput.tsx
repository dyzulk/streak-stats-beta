import React, { useState } from 'react';

export interface StreakInputProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

export function StreakInput({ onSubmit, isLoading = false }: StreakInputProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="streak-input-form">
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          GitHub Username
        </label>
        <div className="input-wrapper">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. torvalds, gvanrossum"
            className="form-input"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="form-button"
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? 'Loading...' : 'Get Streak Stats'}
          </button>
        </div>
      </div>

      <style>{`
        .streak-input-form {
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
        }

        .form-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e1e4e8;
          border-radius: 6px;
          font-size: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #0969da;
          box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
        }

        .form-input:disabled {
          background-color: #f6f8fa;
          color: #6e7781;
          cursor: not-allowed;
        }

        .form-button {
          padding: 0.75rem 1.5rem;
          background-color: #0969da;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .form-button:hover:not(:disabled) {
          background-color: #0860ca;
        }

        .form-button:disabled {
          background-color: #79c0ff;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .input-wrapper {
            flex-direction: column;
          }

          .form-button {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
}

export default StreakInput;
