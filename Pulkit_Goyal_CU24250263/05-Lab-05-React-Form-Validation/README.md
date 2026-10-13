# Lab Sheet 5: Advanced Form Handling, Multi-Step Wizards & Client-Side Validation

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Master React **Controlled Components** for responsive form state management.
2. Build an interactive **Multi-Step Onboarding Wizard** (`Step 1: Personal`, `Step 2: Security & Credentials`, `Step 3: Academic Preferences`) with step indicators, previous/next navigation, and data aggregation.
3. Implement a real-time **Password Strength Meter** evaluating:
   - Minimum length (8+ characters)
   - Uppercase & lowercase letter presence
   - Numeric digit presence
   - Special symbol requirement (`@$!%*?&`)
4. Build a validated **Login Form** featuring touch detection (showing errors only after user interaction) and password show/hide visibility toggles.
5. Prevent invalid submissions, display accessible inline error messages, and format raw inputs.

---

## 2. Component Structure
```
App (manages Tab switcher between Onboarding Wizard and Login View)
├── OnboardingForm (multi-step state, activeStep index, form validation)
│   ├── StepOne (fullName, cuid, email, phone with regex checks)
│   ├── StepTwo (password, confirmPassword)
│   │   └── PasswordStrength (live entropy score, visual progress bar, criteria list)
│   └── StepThree (department, section, track, terms checkbox, final review summary)
└── LoginForm (email, password, touched state, show/hide toggle)
```

---

## 3. How to Run Locally
```bash
# 1. Navigate to project directory
cd 05-Lab-05-React-Form-Validation

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open `http://localhost:5173`.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: What is the difference between Controlled and Uncontrolled Components in React?
- **Controlled Components:** The form element's value is driven by React state (`value={name}` with `onChange={(e) => setName(e.target.value)}`). React acts as the single source of truth, enabling instant real-time validation, disabled submit buttons, and dynamic field formatting.
- **Uncontrolled Components:** Form data is handled directly by the DOM. Values are retrieved on-demand using React refs (`inputRef.current.value`), which is simpler for legacy integrations but lacks instant reactive validation.

### Q2: Why should errors be displayed only on "touched" or "blur" events?
- Displaying errors before the user finishes typing (e.g., showing "Invalid Email" while they have only typed the first 2 letters) causes user frustration and poor UX.
- Validating on `blur` or tracking `touched: true` ensures feedback is shown only after the user has interacted with the input field.

### Q3: How does the Password Strength algorithm calculate its score?
- It tests against four independent criteria using Regular Expressions (Length >= 8, `[A-Z]`, `[0-9]`, `[^A-Za-z0-9]`). Each satisfied rule adds 25% to the score bar, transitioning color from Red (Weak) to Yellow (Medium) to Green (Strong).
