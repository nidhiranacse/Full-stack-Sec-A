// Lab Sheet 2, Task 2.1 — Saiyed Shizain: CSS-variable theme toggler.
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeBtn.textContent = isLight ? "Dark Mode" : "Light Mode";
});
