document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Replace 'your_username' and 'your_password' with the actual username and password you want to use
        if (username === "anushka" && password === "1234") {
            // Successful login, redirect to index.html
            window.location.href = "./main/index.html";
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
});
