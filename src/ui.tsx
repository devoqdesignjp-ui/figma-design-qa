import React, { useState } from 'react';
import './styles.css';

interface Issue {
  id: string;
  layerId: string;
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const UI: React.FC = () => {
  const [url, setUrl] = useState('');
  const [useChrome, setUseChrome] = useState(true);
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState('');

  const handleRunAudit = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');
    setIssues([]);

    try {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'start-audit',
            url: url.trim(),
            useChrome: useChrome
          }
        },
        '*'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audit');
      setLoading(false);
    }
  };

  window.onmessage = (event) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;

    if (msg.type === 'error') {
      setError(msg.message);
      setLoading(false);
    } else if (msg.type === 'audit-complete') {
      setIssues(msg.issues || []);
      setLoading(false);
    }
  };

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="container">
      <h1>Design & Dev QA</h1>
      <p className="subtitle">Compare your design to the live website</p>

      <div className="input-group">
        <label htmlFor="url-input">Website URL</label>
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={loading}
        />
      </div>

      <div className="checkbox-group">
        <input
          id="chrome-checkbox"
          type="checkbox"
          checked={useChrome}
          onChange={(e) => setUseChrome(e.target.checked)}
          disabled={loading}
        />
        <label htmlFor="chrome-checkbox">Use my Chrome (for blocked sites)</label>
      </div>

      <button
        className="run-button"
        onClick={handleRunAudit}
        disabled={loading || !url.trim()}
      >
        {loading ? 'Running Audit...' : 'Run Audit'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {issues.length > 0 && (
        <div className="results">
          <div className="summary">
            <div className="summary-item error">
              <span className="count">{errorCount}</span>
              <span className="label">Errors</span>
            </div>
            <div className="summary-item warning">
              <span className="count">{warningCount}</span>
              <span className="label">Warnings</span>
            </div>
            <div className="summary-item info">
              <span className="count">{issues.length}</span>
              <span className="label">Total Issues</span>
            </div>
          </div>

          <div className="issues-list">
            {issues.map((issue) => (
              <div key={issue.id} className={`issue ${issue.severity}`}>
                <div className="issue-header">
                  <span className="badge">{issue.severity}</span>
                  <span className="type">{issue.type}</span>
                </div>
                <p className="message">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;
