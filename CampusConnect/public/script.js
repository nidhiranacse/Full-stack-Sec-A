* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f4f6f8;
    color: #222;
}

header {
    background: #172554;
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header a {
    color: white;
    text-decoration: none;
    margin: 10px;
}

.hero {
    text-align: center;
    padding: 70px 20px;
    background: #dbeafe;
}

.hero h2 {
    font-size: 40px;
}

section,
main {
    max-width: 1100px;
    margin: auto;
    padding: 30px 20px;
}

.btn,
button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    cursor: pointer;
}

.btn:hover,
button:hover {
    background: #1d4ed8;
}

input,
textarea,
select {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.form-container {
    max-width: 400px;
    margin: 80px auto;
    background: white;
    padding: 30px;
    border-radius: 10px;
}

.event-card,
.resource-card {
    background: white;
    padding: 20px;
    margin: 15px 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px #ddd;
}

.cards {
    display: flex;
    gap: 20px;
}

.card {
    background: white;
    padding: 25px;
    flex: 1;
    text-align: center;
    border-radius: 10px;
}

.card p {
    font-size: 30px;
    font-weight: bold;
}

h1,
h2,
h3 {
    margin-top: 0;
}

a {
    color: #2563eb;
}

.message {
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
}

.error {
    color: #b91c1c;
}

.success {
    color: #15803d;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

th,
td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
}

th {
    background: #172554;
    color: white;
}

@media (max-width: 600px) {

    header {
        flex-direction: column;
        text-align: center;
    }

    header a {
        display: inline-block;
        margin: 5px;
    }

    .cards {
        flex-direction: column;
    }

    .hero h2 {
        font-size: 28px;
    }

    section,
    main {
        padding: 20px 15px;
    }

    .form-container {
        margin: 40px 15px;
    }

    table {
        font-size: 14px;
    }
}