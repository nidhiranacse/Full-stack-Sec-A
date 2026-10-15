# Lab Sheet 05: Form Validation & Controlled Inputs in React

**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Course:** Full Stack Web Development (Sec-A)  

---

## Project Overview

This project implements robust form validation, controlled components, real-time input sanitization, and complex multi-step wizard state management using React 18 and Vite.

### Key Objectives & Deliverables
1. **Task 5.1: Real-time Controlled Input Validation**
   - Implemented in `src/components/LoginForm.jsx`.
   - Dynamic regex verification for email (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`).
   - Real-time password requirement audits (length >= 8, uppercase, lowercase, digit, special character).
   - Dynamic error feedback with inline badges, field blur tracking, and submit prevention.

2. **Task 5.2: Password Strength & Visual Feedback Meter**
   - Implemented in `src/components/PasswordStrengthMeter.jsx` and `src/components/ValidationBadge.jsx`.
   - Real-time Shannon-inspired entropy score calculation (0% to 100%).
   - Dynamic color transition: Weak (Crimson), Fair (Amber), Good (Sky Blue), Strong (Emerald).
   - Live checklist badges that update instantaneously as requirements are satisfied.

3. **Task 5.3: Multi-Step Registration Wizard**
   - Implemented in `src/components/OnboardingWizard.jsx` and step subcomponents:
     - `Step1Account.jsx`: Username, work email, password with strength meter.
     - `Step2Profile.jsx`: Full name, phone number, bio, avatar selection.
     - `Step3Preferences.jsx`: Theme preference, notification triggers, weekly digest toggles.
     - `Step4Summary.jsx`: Verification overview before state dispatch.
   - Comprehensive step state isolation with central aggregate validation.
   - Animated step progress bar with jump-to-step capabilities for previously validated steps.

---

## Project Architecture

```
Lab Sheet 5/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   └── components/
│       ├── LoginForm.jsx
│       ├── PasswordStrengthMeter.jsx
│       ├── ValidationBadge.jsx
│       ├── OnboardingWizard.jsx
│       └── steps/
│           ├── Step1Account.jsx
│           ├── Step2Profile.jsx
│           ├── Step3Preferences.jsx
│           └── Step4Summary.jsx
└── dist/ (Production Vite Build)
```

---

## How to Run

### Development Mode
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
