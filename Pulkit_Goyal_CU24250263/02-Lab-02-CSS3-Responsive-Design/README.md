# Lab Sheet 2: CSS3 Styling, Flexbox, CSS Grid & Responsive Design

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Create a fully responsive, visually polished web layout using **modern CSS3 standards** without relying on external frameworks.
2. Implement **CSS Flexbox** for flexible 1-dimensional layouts (navbars, pill tags, button groups).
3. Implement **CSS Grid** for 2-dimensional layouts (responsive project card gallery and dashboard metrics).
4. Utilize **CSS Custom Properties (Variables)** for a cohesive design system and effortless theme control.
5. Apply **Media Queries** (`@media (max-width: ...)` and `@media (min-width: ...)`) to ensure a smooth responsive experience on mobile, tablet, and desktop viewports.
6. Add CSS3 micro-interactions (transitions, box-shadow elevations, hover states).

---

## 2. File Organization
```
02-Lab-02-CSS3-Responsive-Design/
├── README.md        # Lab documentation, viva questions, and setup guide
├── index.html       # Responsive portfolio webpage with student details
└── styles.css       # Clean, modular CSS3 stylesheet (Flexbox, Grid, Variables)
```

---

## 3. How to Run & Verify
1. Open `index.html` in your browser.
2. Press `F12` or right-click and choose **Inspect**.
3. Toggle Device Toolbar (`Ctrl + Shift + M` / `Cmd + Shift + M`) to simulate Mobile (375px), Tablet (768px), and Desktop (1200px) screens.
4. Observe how the project cards seamlessly switch between 1, 2, and 3 columns, and how the navigation adapts smoothly.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: When should you choose CSS Grid over Flexbox?
- **Flexbox (1D):** Best suited for components arranged in a single row OR single column (e.g., navigation items, button groups, breadcrumbs, card headers).
- **CSS Grid (2D):** Best suited for coordinating elements across both rows AND columns simultaneously (e.g., overall page layout, photo/project galleries, dashboards).

### Q2: What is the purpose of `box-sizing: border-box`?
- By default (`content-box`), adding padding and borders increases the total outer width of an element, frequently causing overflow issues.
- `border-box` ensures that the declared `width` and `height` include both content, padding, and border, making responsive sizing intuitive and predictable.

### Q3: What is the benefit of CSS Custom Properties (`--var-name`)?
- They allow defining central design tokens (brand colors, border radii, spacing) at the `:root` level. Changing a single variable automatically updates all matching elements across the entire stylesheet.
