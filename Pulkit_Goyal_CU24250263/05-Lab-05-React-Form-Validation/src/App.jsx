import React, { useState } from 'react';
import OnboardingForm from './components/OnboardingForm.jsx';
import LoginForm from './components/LoginForm.jsx';

/**
 * Root Application - Lab Sheet 5
 * Student: Pulkit Goyal | CU24250263 | Roll 40 | Sec A
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('wizard');

  return (
    <div className="wizard-container">
      <div className="wizard-card">
        {/* Header Information */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', color: '#1e293b' }}>
            Form Engine &bull; Validation Systems
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Full Stack Development Lab Sheet 5
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span style={{ background: '#eef2ff', color: '#4338ca', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              Pulkit Goyal
            </span>
            <span style={{ background: '#eef2ff', color: '#4338ca', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              CU24250263
            </span>
            <span style={{ background: '#eef2ff', color: '#4338ca', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              Roll 40 &bull; Sec A
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switch">
          <button
            className={`tab-btn ${activeTab === 'wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('wizard')}
          >
            Multi-Step Wizard
          </button>
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Validated Login
          </button>
        </div>

        {/* Dynamic View */}
        {activeTab === 'wizard' ? <OnboardingForm /> : <LoginForm />}
      </div>
    </div>
  );
}
