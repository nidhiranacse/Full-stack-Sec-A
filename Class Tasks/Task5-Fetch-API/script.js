const apiUrl = "https://jsonplaceholder.typicode.com/users";

const userTable = document.getElementById("userTable");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

let users = [];

// Fetch users from API
fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        return response.json();
    })
    .then(data => {
        users = data;

        displayUsers(users);
    })
    .catch(error => {
        message.textContent = "Error loading users.";
        console.log(error);
    });


// Display users in table
function displayUsers(data) {

    userTable.innerHTML = "";

    if (data.length === 0) {
        message.textContent = "No users found.";
        return;
    }

    message.textContent = "";

    data.forEach(user => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.address.city}</td>
        `;

        userTable.appendChild(row);
    });
}


// Search users in real time
searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase();

    const filteredUsers = users.filter(user => {

        return (
            user.name.toLowerCase().includes(searchText) ||
            user.username.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText) ||
            user.address.city.toLowerCase().includes(searchText)
        );

    });

    displayUsers(filteredUsers);
});