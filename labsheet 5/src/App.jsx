import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import MultiStepWizard from './components/MultiStepWizard';
import './App.css';

/* ==========================================================
   LAB SHEET 05: Form Validation Architecture & Controlled Inputs
   ========================================================== */

function App() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="app-container">
      {/* Header & Tabs */}
      <header className="header">
        <h1>Lab Sheet 05: Form Validation &amp; Controlled Inputs</h1>
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login &amp; Password Strength (Task 5.1 &amp; 5.2)
          </button>
          <button
            className={`tab-btn ${activeTab === 'wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('wizard')}
          >
            Multi-Step Wizard (Task 5.3)
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'login' ? <LoginForm /> : <MultiStepWizard />}
      </main>
    </div>
  );
}

export default App;
