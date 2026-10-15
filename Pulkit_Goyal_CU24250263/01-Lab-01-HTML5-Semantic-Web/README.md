# Lab Sheet 1: Semantic HTML5 Web Page & Student Profile

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Design and develop a structured web page using **HTML5 semantic elements** (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
2. Implement proper document metadata, accessibility attributes (`alt`, `aria-label`, `<label for="...">`).
3. Construct an academic schedule / course table with column grouping, header rows (`<th>`), and cell alignment.
4. Build a comprehensive interactive **Student Enrollment & Feedback Form** using diverse HTML5 input types (`text`, `email`, `tel`, `date`, `number`, `radio`, `checkbox`, `select`, `textarea`, `file`).
5. Embed media elements (`<figure>`, `<figcaption>`, and an interactive Google Maps / YouTube or placeholder media frame).

---

## 2. File Organization
```
01-Lab-01-HTML5-Semantic-Web/
├── README.md        # Lab documentation, viva questions, and setup guide
└── index.html       # Complete semantic HTML5 webpage with student credentials
```

---

## 3. How to Run & Verify
1. No external package installations or build tools are required for this lab.
2. Open `index.html` directly in any web browser (Google Chrome, Firefox, Edge) by double-clicking it or using the VS Code Live Server extension.
3. Verify form input validations (required fields, email format, phone regex) directly in the browser.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: Why should we use Semantic HTML5 tags instead of nested `<div>` tags?
- **Accessibility:** Screen readers and assistive technologies use semantic tags (`<nav>`, `<main>`, `<article>`) to provide landmark navigation for visually impaired users.
- **SEO (Search Engine Optimization):** Search engine web crawlers understand the page hierarchy and index primary content faster.
- **Maintainability:** Code is self-documenting and easier for team members to read and maintain.

### Q2: What is the difference between `<section>` and `<article>`?
- `<article>` represents an independent, self-contained piece of content that could be distributed or reused on its own (e.g., a blog post, news story, or portfolio project card).
- `<section>` represents a thematic grouping of content, typically with a heading, that forms part of a larger document.

### Q3: Why is the `for` attribute in `<label>` important?
- It links the label to the corresponding input element's `id`. When a user clicks the label text, the browser automatically focuses or toggles the input field, which significantly improves usability on mobile screens and accessibility for screen readers.
