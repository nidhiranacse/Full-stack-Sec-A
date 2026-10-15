import React, { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'wizard'

  return (
    <div className="lab5-app-root">
      {/* Top Navigation */}
      <header className="lab5-header">
        <div className="header-container">
          <div className="header-brand">
            <a href="../index.html" className="btn-portal-back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Lab Portal
            </a>
            <span className="badge-sheet">Lab Sheet 05 &bull; Form Validation in React</span>
          </div>

          <div className="module-switch-tabs">
            <button
              className={`switch-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              🔐 Tasks 5.1 &amp; 5.2: Controlled Login &amp; Strength Tracker
            </button>
            <button
              className={`switch-tab-btn ${activeTab === 'wizard' ? 'active' : ''}`}
              onClick={() => setActiveTab('wizard')}
            >
              🧙‍♂️ Task 5.3: Multi-Step Onboarding Flow Wizard
            </button>
          </div>

          <div className="student-tag">
            Author: <strong>Rahul Raj</strong>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="lab5-main-container">
        <section className="lab5-hero">
          <span className="hero-kicker">React Form Validation Architecture</span>
          <h1 className="hero-title">Controlled Inputs, Dynamic Regex &amp; Flow Wizard</h1>
          <p className="hero-desc">
            Engineered using React controlled components, dynamic regex criteria verification, real-time warning badges,
            password entropy progress mapping, and multi-step state encapsulation.
          </p>
        </section>

        <div className="module-view-outlet">
          {activeTab === 'login' ? <LoginForm /> : <OnboardingWizard />}
        </div>
      </main>

      <footer className="lab5-footer">
        <p>&copy; 2026 Rahul Raj &bull; Full Stack Lab Sheet 05 &bull; Form Validation Architecture &amp; Controlled Inputs in React</p>
      </footer>
    </div>
  );
}
