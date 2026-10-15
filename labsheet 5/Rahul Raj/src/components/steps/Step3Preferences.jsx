import React from 'react';
import ValidationBadge from '../ValidationBadge.jsx';

export default function Step3Preferences({ data, updateData, errors }) {
  return (
    <div className="wizard-step-body">
      <div className="step-header">
        <h3 className="step-heading">Step 3: Tooling &amp; Environment Preferences</h3>
        <p className="step-subheading">Configure your development stack ecosystem and compliance flags.</p>
      </div>

      <div className="form-group-item">
        <label htmlFor="w-stack" className="field-label">Preferred Runtime Ecosystem:</label>
        <select
          id="w-stack"
          value={data.preferredStack}
          onChange={(e) => updateData('preferredStack', e.target.value)}
          className="controlled-select-input"
        >
          <option value="React + Django Full Stack">React + Django (Python Full Stack)</option>
          <option value="React + Node.js Express">React + Node.js (JavaScript Full Stack)</option>
          <option value="Next.js Full Stack Serverless">Next.js Serverless SSR</option>
          <option value="Vanilla Web Standards (HTML5/CSS3/ES6)">Vanilla Web Standards (HTML5/CSS3/ES6)</option>
        </select>
      </div>

      <div className="form-group-item">
        <label htmlFor="w-editor" className="field-label">Primary Development IDE / Editor:</label>
        <select
          id="w-editor"
          value={data.editor}
          onChange={(e) => updateData('editor', e.target.value)}
          className="controlled-select-input"
        >
          <option value="Visual Studio Code">Visual Studio Code (PEP8 Configured)</option>
          <option value="Neovim / Vim">Neovim / Terminal Vim</option>
          <option value="PyCharm Professional">PyCharm Professional</option>
          <option value="Antigravity IDE">Antigravity Agentic IDE</option>
        </select>
      </div>

      <div className="checkbox-row-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.enableTelemetry}
            onChange={(e) => updateData('enableTelemetry', e.target.checked)}
            className="controlled-checkbox"
          />
          <span>Enable real-time runtime error diagnostic telemetry</span>
        </label>
      </div>

      <div className="checkbox-row-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.agreeTerms}
            onChange={(e) => updateData('agreeTerms', e.target.checked)}
            className="controlled-checkbox"
          />
          <span>I agree to academic laboratory compliance &amp; engineering ethics policies</span>
        </label>
        {errors.agreeTerms && (
          <ValidationBadge type="error" fieldName="Required Policy" message={errors.agreeTerms} />
        )}
      </div>
    </div>
  );
}
