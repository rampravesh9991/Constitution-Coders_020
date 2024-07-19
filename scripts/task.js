// /scripts/task.js

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('tasks');
const taskListContainer = document.getElementById('task-list');
const filterStatus = document.getElementById('filter-status');
const generateDataBtn = document.getElementById('generate-data');
const userId = localStorage.getItem('loggedInUserId');

if (!userId) {
    window.alert("User not logged in. Please log in first.");
    window.location.href = "login.html";
}

const url = `http://localhost:3000/users/${userId}`;
let tasks = [];
let editIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    if (userId) {
        fetchTasks();
    }
});

generateDataBtn.addEventListener('click', () => {
    const days = prompt("Enter the number of days (10-365):");
    if (days >= 10 && days <= 365) {
        generateRandomTasks(days);
    } else {
        alert("Please enter a valid number of days between 10 and 365.");
    }
});

const fetchTasks = async () => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const user = await res.json();
        tasks = user.tasks;
        renderTaskList();
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
};

const generateRandomTasks = async (days) => {
    const statusOptions = ['pending', 'in progress', 'completed'];
    const urgencyOptions = ['high', 'medium', 'low'];
    const importanceOptions = ['high', 'medium', 'low'];

    for (let i = 0; i < days; i++) {
        const numTasks = Math.floor(Math.random() * 10) + 0;
        for (let j = 0; j < numTasks; j++) {
            const task = {
                name: `Task ${i + 1}-${j + 1}`,
                description: `Description for task ${i + 1}-${j + 1}`,
                dueDate: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                importance: importanceOptions[Math.floor(Math.random() * importanceOptions.length)],
                urgency: urgencyOptions[Math.floor(Math.random() * urgencyOptions.length)],
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
                priority: calculatePriority(importance, urgency)
            };
            tasks.push(task);
        }
    }
    await updateTasks();
    fetchTasks();
};

const updateTasks = async () => {
    try {
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tasks })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
    } catch (error) {
        console.error("Error updating tasks:", error);
    }
};

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const importance = document.getElementById('importance').value;
    const urgency = document.getElementById('urgency').value;
    const status = document.getElementById('status').value;

    const task = {
        name: taskName,
        description: taskDescription,
        dueDate: dueDate,
        importance: importance,
        urgency: urgency,
        status: status,
        priority: calculatePriority(importance, urgency)
    };

    if (editIndex === -1) {
        await addTask(task);
    } else {
        await updateTask(task);
        editIndex = -1;
    }

    taskForm.reset();
    fetchTasks();
});

const addTask = async (task) => {
    try {
        tasks.push(task);
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tasks })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
    } catch (error) {
        console.error("Error adding task:", error);
    }
};

const updateTask = async (task) => {
    try {
        tasks[editIndex] = task;
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tasks })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
    } catch (error) {
        console.error("Error updating task:", error);
    }
};

const deleteTask = async (index) => {
    try {
        tasks.splice(index, 1);
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tasks })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        fetchTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
};

function calculatePriority(importance, urgency) {
    const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
    return priorityOrder[importance] + priorityOrder[urgency];
}

function renderTaskList() {
    taskList.innerHTML = '';

    const filteredTasks = filterStatus.value === 'all' ? tasks : tasks.filter(task => task.status === filterStatus.value);

    filteredTasks.forEach((task, index) => {
        const taskHTML = `
            <li class="task">
                <div>
                    <span class="priority-${task.importance}">${task.name}</span><br>
                    <span><i>${task.description}</i></span><br>
                    <span>${task.dueDate}</span><br>
                    <span><b>Importance:</b> ${task.importance}</span><br>
                    <span><b>Urgency:</b> ${task.urgency}</span><br>
                    <span><b>Status:</b> ${task.status}</span>
                </div>
                <div>
                    <button class="edit-task" onclick="editTask(${index})">Edit</button>
                    <button class="delete-task" onclick="deleteTask(${index})">Delete</button>
                </div>
            </li>
        `;

        taskList.innerHTML += taskHTML;
    });
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-description').value = task.description;
    document.getElementById('due-date').value = task.dueDate;
    document.getElementById('importance').value = task.importance;
    document.getElementById('urgency').value = task.urgency;
    document.getElementById('status').value = task.status;
    editIndex = index;
    taskForm.scrollIntoView({ behavior: 'smooth' });
}

function sortTasks() {
    const sortBy = document.getElementById('sort').value;
    if (sortBy === 'date') {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === 'priority') {
        tasks.sort((a, b) => b.priority - a.priority);
    }
    renderTaskList();
    taskListContainer.scrollIntoView({ behavior: 'smooth' });
}

function filterTasksByStatus() {
    renderTaskList();
}
