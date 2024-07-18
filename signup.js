const signupForm = document.getElementById('signup-form');
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
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (email && password) {
        const users = await fetchData(url);
        const emailExists = users.some(user => user.email === email);

        if (emailExists) {
            window.alert("Email already exists, please login");
            window.location.href = "login.html";
        } else {
            const newUser = {
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
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error registering user:", error);
                window.alert("Failed to register user.");
            }
        }
    } else {
        window.alert("Please fill all details");
    }
});