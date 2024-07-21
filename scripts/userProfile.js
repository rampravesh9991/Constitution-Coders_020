// Navbar JS
function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('open');
}

function indexPage() {
    window.location.href = "/index.html";
}

function loginPage() {
    window.location.href = "/htmls/login_signup.html";
}

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
});

function signupPage() {
    window.location.href = "/htmls/login_signup.html";
}
//user personal data ---------


// Event listener to handle file input change
document.getElementById('change-photo-button').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

// Handle file input change
document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profile-pic').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Function to toggle edit mode
function toggleEdit() {
    const isEditing = document.getElementById('edit-button').style.display === 'none';

    // Toggle fields between editable and non-editable
    document.querySelectorAll('#profile .editable input, #profile .editable textarea').forEach(field => {
        field.disabled = isEditing;
    });

    // Hide labels and headings in non-edit mode
    document.querySelectorAll('#profile .editable label').forEach(label => {
        label.style.display = isEditing ? 'none' : 'block';
    });

    // Show or hide photo container based on edit mode
    document.getElementById('photo-container').style.display = isEditing ? 'none' : 'block';

    // Toggle edit and save button
    document.getElementById('edit-button').style.display = isEditing ? 'block' : 'none';
    document.getElementById('save-button').style.display = isEditing ? 'none' : 'block';
}

// Function to save profile changes
async function saveProfile() {
    const profileData = {
        name: document.getElementById('name').value,
        bio: document.getElementById('bio').value,
        pronouns: document.getElementById('pronouns').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        website: document.getElementById('website').value,
        linkedin: document.getElementById('linkedin').value,
        profilePic: document.getElementById('profile-pic').src
    };

    try {
        // Fetch the existing user data
        const response = await fetch(`http://localhost:3000/users/${localStorage.getItem('loggedInUserId')}`);
        const user = await response.json();

        // Merge profile data into the existing user data
        const updatedUser = { ...user, profile: profileData };

        // Send the updated user data to the server
        const saveResponse = await fetch(`http://localhost:3000/users/${localStorage.getItem('loggedInUserId')}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        });

        if (!saveResponse.ok) {
            throw new Error(`HTTP error! Status: ${saveResponse.status}`);
        }

        const data = await saveResponse.json();
        console.log('Success:', data);
        toggleEdit(); // Exit edit mode after saving
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load user data on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`http://localhost:3000/users/${localStorage.getItem('loggedInUserId')}`);
        const user = await response.json();
        document.getElementById('name').value = user.profile.name || '';
        document.getElementById('bio').value = user.profile.bio || '';
        document.getElementById('pronouns').value = user.profile.pronouns || '';
        document.getElementById('company').value = user.profile.company || '';
        document.getElementById('location').value = user.profile.location || '';
        document.getElementById('website').value = user.profile.website || '';
        document.getElementById('linkedin').value = user.profile.linkedin || '';
        document.getElementById('profile-pic').src = user.profile.profilePic || 'https://via.placeholder.com/150';
    } catch (error) {
        console.error('Error loading user data:', error);
    }
});

//--------------user progress charts-----
// /scripts/visualization.js

const userId = localStorage.getItem('loggedInUserId');
const url = `http://localhost:3000/users/${userId}`;

document.addEventListener('DOMContentLoaded', () => {
    if (userId) {
        fetchTasks();
    }
});

const fetchTasks = async () => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const user = await res.json();
        const tasks = user.tasks;
        const taskData = processTaskData(tasks);
        createLineChart(taskData);
        createBarChart(taskData);
        createHeatMap(taskData);
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
};

const processTaskData = (tasks) => {
    const startDate = d3.timeDay.offset(d3.min(tasks, d => new Date(d.dueDate)), -1);
    const endDate = d3.timeDay.offset(d3.max(tasks, d => new Date(d.dueDate)), 1);

    const dateRange = d3.timeDay.range(startDate, endDate);
    const taskData = Array.from(dateRange, date => {
        const completedTasks = tasks.filter(task => task.status === 'completed' && d3.timeDay(new Date(task.dueDate)).getTime() === date.getTime()).length;
        const totalTasks = tasks.filter(task => d3.timeDay(new Date(task.dueDate)).getTime() === date.getTime()).length;
        return {
            date: date,
            completedCount: completedTasks,
            totalCount: totalTasks
        };
    });

    return taskData;
};

const createLineChart = (data) => {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.totalCount)]).range([height, 0]);

    const lineCompleted = d3.line().x(d => x(d.date)).y(d => y(d.completedCount));
    const lineTotal = d3.line().x(d => x(d.date)).y(d => y(d.totalCount));

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", lineCompleted)
        .attr("stroke-dasharray", function () { return this.getTotalLength(); })
        .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
        .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", lineTotal)
        .attr("stroke-dasharray", function () { return this.getTotalLength(); })
        .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
        .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0);
};

const createBarChart = (data) => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand().domain(data.map(d => d.date)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.totalCount)]).range([height, 0]);

    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %d")));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar-completed")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar-completed")
        .attr("x", d => x(d.date))
        .attr("y", height)
        .attr("width", x.bandwidth() / 2)
        .attr("height", 0)
        .attr("fill", "steelblue")
        .transition()
        .duration(1000)
        .attr("y", d => y(d.completedCount))
        .attr("height", d => height - y(d.completedCount));

    svg.selectAll(".bar-total")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar-total")
        .attr("x", d => x(d.date) + x.bandwidth() / 2)
        .attr("y", height)
        .attr("width", x.bandwidth() / 2)
        .attr("height", 0)
        .attr("fill", "red")
        .transition()
        .duration(1000)
        .attr("y", d => y(d.totalCount))
        .attr("height", d => height - y(d.totalCount));
};

const createHeatMap = (data) => {
    const margin = { top: 20, right: 0, bottom: 30, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#heat-map")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const x = d3.scaleBand().range([0, width]).domain(monthNames).padding(0.05);
    const y = d3.scaleBand().range([height, 0]).domain(d3.range(1, 32)).padding(0.05);

    svg.append("g")
        .style("font-size", 10)
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove();

    svg.append("g")
        .style("font-size", 10)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove();

    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(data, d => d.totalCount)]);

    svg.selectAll()
        .data(data, d => `${d.date.getMonth()}-${d.date.getDate()}`)
        .enter()
        .append("rect")
        .attr("x", d => x(monthNames[d.date.getMonth()]))
        .attr("y", d => y(d.date.getDate()))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => color(d.totalCount));

    svg.selectAll()
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(monthNames[d.date.getMonth()]) + x.bandwidth() / 2)
        .attr("y", d => y(d.date.getDate()) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .style("fill", d => d.totalCount > 5 ? "white" : "black")
        .text(d => d.totalCount);
};
