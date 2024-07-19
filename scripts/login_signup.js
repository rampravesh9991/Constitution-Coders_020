const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

//backend part------------------
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const url = "http://localhost:3000/users";

// Function to fetch data from the server
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

// Handle Signup Form Submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (email && password && username) {
        const users = await fetchData(url);
        const emailExists = users.some(user => user.email === email);

        if (emailExists) {
            window.alert("Email already exists, please login");
            sign_in_btn.click();
        } else {
            const newUser = {
                username,
                email,
                password,
                tasks: [],
                profile: {}
            };

            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newUser)
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                window.alert("User registered successfully!");
                sign_in_btn.click();
            } catch (error) {
                console.error("Error registering user:", error);
                window.alert("Failed to register user.");
            }
        }
    } else {
        window.alert("Please fill all details");
    }
});
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