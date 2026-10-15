# Practical A2: Feedback Form with Validation (React)
**Author:** Payal Bisht

## Aim
To build a React form that collects feedback, validates every field and shows a confirmation message after a successful submit.

---

## Problem Statement & Elements Mapping

Build a React `FeedbackForm` component (**default export from `src/FeedbackForm.jsx`**) that collects course feedback from a student, validates it and shows a confirmation after a successful submit.

### Required Elements & Exact `data-testid` Values

| Element | Exact `data-testid` | Specification / Behavior |
|---|---|---|
| **Name Input** | `name-input` | Text input for student's full name. Must not be empty. |
| **Email Input** | `email-input` | Email input. Must match standard email pattern. |
| **Rating Dropdown** | `rating-select` | Select dropdown with empty default option, followed by options 1 to 5. |
| **Comment Textarea** | `comment-input` | Textarea for comments (max 200 characters). |
| **Comment Counter** | `comment-count` | Counter always in the form `{n}/200`, where `n` is current length. |
| **Submit Button** | `submit-btn` | Button triggering form validation and submission. |
| **Name Error** | `name-error` | Rendered only while name is invalid (e.g., empty or whitespace). |
| **Email Error** | `email-error` | Rendered only while email is invalid (e.g., missing or invalid format). |
| **Rating Error** | `rating-error` | Rendered only while rating has not been selected. |
| **Success Message** | `success-msg` | Displays exact text: `Thank you, {name}! Feedback submitted.` |

---

## Project Structure
```
Practical A2 - Feedback Form with Validation/
├── src/
│   ├── FeedbackForm.jsx       # Required default export with exact test IDs & validation
│   ├── FeedbackForm.css       # Premium glassmorphic styling, animations, responsive
│   ├── App.jsx                # Full interactive showcase with real-time submission logs
│   ├── main.jsx               # React 18 DOM mount point
│   └── __tests__/
│       ├── FeedbackForm.test.jsx # 7 exhaustive automated test cases
│       └── setup.js           # Jest DOM matchers setup
├── index.html                 # HTML5 template
├── vite.config.js             # Vite + Vitest configuration
├── package.json               # NPM scripts and dependencies
└── README.md                  # Component documentation
```

---

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## Validation Behavior Specification
1. **Initial Pristine State:** Error messages (`name-error`, `email-error`, `rating-error`) and confirmation (`success-msg`) are **not** present in the DOM on initial load.
2. **On Submit or Interaction:** If any required field fails validation, its specific error message element is rendered.
3. **Reactive Self-Clearing:** As soon as the user corrects an invalid field (e.g. types a name, enters a valid email address, or chooses a rating from 1 to 5), the corresponding error message immediately disappears.
4. **Successful Submission:** When all fields pass validation, the success banner with `data-testid="success-msg"` renders containing:
   ```text
   Thank you, {name}! Feedback submitted.
   ```
5. **Character Counter:** Always dynamically reflects the current comment length in the format `{n}/200`.
