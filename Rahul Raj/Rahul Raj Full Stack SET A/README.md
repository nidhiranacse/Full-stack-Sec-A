# Full Stack Development Lab Manual — Practical Test (Set A)
**Student Name:** Rahul Raj  
**Student UID:** cu24250116  
**Course:** Full Stack Web Development Laboratory (Section A)  
**Teacher Repository:** [https://github.com/nidhiranacse/Full-stack-Sec-A](https://github.com/nidhiranacse/Full-stack-Sec-A)  
**Student Fork:** [https://github.com/cu24250116-png/Full-stack-Sec-A](https://github.com/cu24250116-png/Full-stack-Sec-A)  
**Pull Request:** [#54](https://github.com/nidhiranacse/Full-stack-Sec-A/pull/54)  
**Total Marks:** 40 / 40 (2 Practicals × 20 Marks each) | **Allocated Time:** 90 Minutes

---

## Executive Summary

This repository directory contains the comprehensive, fully validated solutions for **SET A** of the Full Stack Development Practical Test:

1. **Practical A1: Student Records REST API (Node.js and Express)**
   - In-memory student records storage engine.
   - Strict validation: 400 for invalid/missing body, 409 for duplicate email.
   - IDs start at 1, increment strictly by 1, and **IDs of deleted students are NEVER reused**.
   - Query parameter filtering: `/students?minAge=:minAge`.
   - **15 / 15 Automated unit tests passing (100% test pass rate).**

2. **Practical A2: Feedback Form with Validation (React)**
   - Component exported as default from `src/FeedbackForm.jsx`.
   - Form inputs with exact required `data-testid` values: `name-input`, `email-input`, `rating-select`, `comment-input`, `comment-count`, `submit-btn`.
   - Individual error messages: `name-error`, `email-error`, `rating-error` rendered strictly while fields are invalid.
   - Comment counter always displayed in the exact format `{n}/200`.
   - Success message: `data-testid="success-msg"` with exact text `Thank you, {name}! Feedback submitted.`
   - **8 / 8 Automated Vitest & React Testing Library tests passing (100% test pass rate).**

---

## Directory Structure
```
Rahul Raj Full Stack SET A/
├── Practical A1 - Student Records REST API/
│   ├── src/
│   │   ├── app.js               # Express application with all route handlers
│   │   └── studentStore.js      # In-memory store, validation & auto-increment logic
│   ├── tests/
│   │   └── api.test.js          # 15 node:test automated unit tests
│   ├── server.js                # Server entry point
│   ├── package.json             # Express dependencies & test scripts
│   ├── postman_collection.json  # Comprehensive Postman test collection
│   └── README.md                # Practical A1 documentation & API contract
│
├── Practical A2 - Feedback Form with Validation/
│   ├── src/
│   │   ├── FeedbackForm.jsx     # Required default export React component
│   │   ├── FeedbackForm.css     # Glassmorphic dark UI, micro-animations
│   │   ├── App.jsx              # Application shell with real-time submission logs
│   │   ├── main.jsx             # React 18 DOM mount point
│   │   └── __tests__/
│   │       ├── FeedbackForm.test.jsx # 8 Vitest & RTL test cases
│   │       └── setup.js         # Jest-DOM matcher extensions
│   ├── index.html               # Vite HTML template
│   ├── vite.config.js           # Vite build & test configuration
│   ├── package.json             # React 18 + Vitest dependencies
│   └── README.md                # Practical A2 component documentation
│
├── index.html                   # Unified Interactive Showcase Portal
├── package.json                 # Monorepo test & run scripts
└── README.md                    # Master assessment documentation
```

---

## Quick Start & Verification

### Running All Automated Tests
To run all tests for both practicals:
```bash
# Practical A1 Tests (Node native runner)
npm test --prefix "Practical A1 - Student Records REST API"

# Practical A2 Tests (Vitest + React Testing Library)
npm test --prefix "Practical A2 - Feedback Form with Validation"
```

### Running Practical A1 Locally
```bash
cd "Practical A1 - Student Records REST API"
npm install
npm start
# API available at http://localhost:3000
```

### Running Practical A2 Locally
```bash
cd "Practical A2 - Feedback Form with Validation"
npm install
npm run dev
# React Web App available at http://localhost:5173
```

---

## Practical A1 Test Results
```text
✔ Practical A1: Student Records REST API Test Suite (84.02ms)
  ✔ 1. POST /students - Creation & Validation
    ✔ Valid input responds 201 with created student and auto-increment ID starting at 1
    ✔ Invalid input: missing name responds 400 with { "error": "Invalid input" }
    ✔ Invalid input: empty string name responds 400 with { "error": "Invalid input" }
    ✔ Invalid input: invalid email format responds 400 with { "error": "Invalid input" }
    ✔ Invalid input: non-numeric or negative age responds 400 with { "error": "Invalid input" }
    ✔ Duplicate email responds 409 with { "error": "Email already exists" }
    ✔ Duplicate email check is case-insensitive
  ✔ 2. GET /students - Fetch List & Query Filtering
    ✔ Responds 200 with an empty array when no students exist
    ✔ Responds 200 with all students in insertion order
    ✔ Query minAge filters students with age >= minAge
  ✔ 3. GET /students/:id - Fetch Single Student
    ✔ Responds 200 with student object when found
    ✔ Responds 404 with { "error": "Student not found" } when ID does not exist
  ✔ 4. DELETE /students/:id - Deletion & ID Non-Reuse Guarantee
    ✔ Responds 204 with empty body when deleting an existing student
    ✔ Responds 404 with { "error": "Student not found" } when deleting non-existent ID
    ✔ Guarantees IDs of deleted students are NEVER reused
ℹ tests 15 | suites 5 | pass 15 | fail 0
```

---

## Practical A2 Test Results
```text
✓ src/__tests__/FeedbackForm.test.jsx (8 tests) 94ms
  ✓ renders all required elements with exact data-testid attributes
  ✓ renders rating-select with an empty default option followed by options 1 to 5
  ✓ renders comment counter in exact form {n}/200 and updates dynamically
  ✓ does NOT render error messages initially on clean load
  ✓ renders name-error, email-error, and rating-error when submitting an empty form
  ✓ validates invalid email format and shows email-error
  ✓ removes error messages individually as each field becomes valid
  ✓ shows success message with exact text "Thank you, {name}! Feedback submitted." upon valid submission
Test Files 1 passed (1) | Tests 8 passed (8)
```
