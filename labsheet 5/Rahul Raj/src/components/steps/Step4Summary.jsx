import React from 'react';

export default function Step4Summary({ data, onEditStep }) {
  return (
    <div className="wizard-step-body">
      <div className="step-header">
        <h3 className="step-heading">Step 4: Final Parameter Review &amp; Submittal</h3>
        <p className="step-subheading">
          Review all encapsulated state data across child components before triggering final submittal routines.
        </p>
      </div>

      <div className="summary-metadata-card">
        {/* Section 1: Account */}
        <div className="summary-group">
          <div className="summary-group-header">
            <h4>1. Account &amp; Security</h4>
            <button type="button" className="btn-edit-step" onClick={() => onEditStep(1)}>
              Edit
            </button>
          </div>
          <dl className="summary-dl">
            <div className="dl-row">
              <dt>Email Address:</dt>
              <dd><code>{data.email}</code></dd>
            </div>
            <div className="dl-row">
              <dt>Username Handle:</dt>
              <dd><code>{data.username}</code></dd>
            </div>
            <div className="dl-row">
              <dt>Password Security:</dt>
              <dd>•••••••••••• (Encrypted in memory &bull; Policy Satisfied)</dd>
            </div>
          </dl>
        </div>

        {/* Section 2: Profile */}
        <div className="summary-group">
          <div className="summary-group-header">
            <h4>2. Professional Profile</h4>
            <button type="button" className="btn-edit-step" onClick={() => onEditStep(2)}>
              Edit
            </button>
          </div>
          <dl className="summary-dl">
            <div className="dl-row">
              <dt>Full Name:</dt>
              <dd><strong>{data.fullName}</strong></dd>
            </div>
            <div className="dl-row">
              <dt>Engineering Role:</dt>
              <dd>{data.role}</dd>
            </div>
            <div className="dl-row">
              <dt>Bio Summary:</dt>
              <dd className="bio-quote">{data.bio || '(No bio provided)'}</dd>
            </div>
          </dl>
        </div>

        {/* Section 3: Preferences */}
        <div className="summary-group">
          <div className="summary-group-header">
            <h4>3. Stack &amp; Preferences</h4>
            <button type="button" className="btn-edit-step" onClick={() => onEditStep(3)}>
              Edit
            </button>
          </div>
          <dl className="summary-dl">
            <div className="dl-row">
              <dt>Runtime Ecosystem:</dt>
              <dd>{data.preferredStack}</dd>
            </div>
            <div className="dl-row">
              <dt>Development IDE:</dt>
              <dd>{data.editor}</dd>
            </div>
            <div className="dl-row">
              <dt>Telemetry Diagnostics:</dt>
              <dd>{data.enableTelemetry ? 'Enabled (Active)' : 'Disabled'}</dd>
            </div>
            <div className="dl-row">
              <dt>Ethics Compliance:</dt>
              <dd className="text-green">✓ Policy Acknowledged &amp; Signed</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
