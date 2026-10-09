document.addEventListener("DOMContentLoaded", function () {
    console.log("Page loaded successfully.");

    const footer = document.querySelector("footer");

    if (footer) {
        const year = new Date().getFullYear();
        footer.innerHTML = `<p>&copy; ${year} My Website. All Rights Reserved.</p>`;
    }

    const links = document.querySelectorAll("a");

    links.forEach(function (link) {
        link.addEventListener("click", function () {
            console.log("Link clicked: " + link.textContent);
        });
    });
});