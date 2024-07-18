const loginForm = document.getElementById('login-form');
const url = "http://localhost:3000/users";

const fetchData = async (url) => {
    try {
        let res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        let data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        window.alert("Failed to fetch server data.");
    }
};

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email && password) {
        const users = await fetchData(url);
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            window.alert("Login successful!");
            localStorage.setItem('loggedInUserId', user.id);
            window.location.href = "task.html";
        } else {
            window.alert("Invalid email or password");
        }
    } else {
        window.alert("Please fill all details");
    }
});
