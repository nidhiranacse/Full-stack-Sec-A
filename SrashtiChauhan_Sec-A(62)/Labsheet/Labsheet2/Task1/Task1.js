const toggleButton = document.getElementById("themeToggle");

toggleButton.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");
});