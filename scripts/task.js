
// -----------navbar js--------
function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('open');
}
function indexPage(){
    window.location.href = "/index.html";
}
function loginPage(){
    window.location.href = "/htmls/login_signup.html";
}
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
});
function signupPage(){
    window.location.href = "/htmls/login_signup.html";
}

// ---------------task LockManager.js----
const taskForm = document.getElementById('task-form');
const generateDataBtn = document.getElementById('generate-data');
const filterStatus = document.getElementById('filter-status');
const pendingTasksList = document.getElementById('pending-tasks-list');
const inProgressTasksList = document.getElementById('in-progress-tasks-list');
const completedTasksList = document.getElementById('completed-tasks-list');
const userId = localStorage.getItem('loggedInUserId');
const url = `http://localhost:3000/users/${userId}`;
let tasks = [];
let editIndex = -1;

if (!userId) {
    window.alert("User not logged in. Please log in first.");
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', () => {
    if (userId) {
        fetchTasks();
        setupDragAndDrop();
    }
});

generateDataBtn.addEventListener('click', () => {
    const days = prompt("Enter the number of days (10-100):");
    if (days >= 10 && days <= 100) {
        generateRandomTasks(days);
    } else {
        alert("Please enter a valid number of days between 10 and 100.");
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
    const statusOptions = ['pending', 'inProgress', 'completed'];
    const urgencyOptions = ['high', 'medium', 'low'];
    const importanceOptions = ['high', 'medium', 'low'];

    for (let i = 0; i < days; i++) {
        const numTasks = Math.floor(Math.random() * 5) + 1;
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
    pendingTasksList.innerHTML = '';
    inProgressTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    const filteredTasks = filterStatus.value === 'all' ? tasks : tasks.filter(task => task.status === filterStatus.value);

    filteredTasks.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.setAttribute('draggable', 'true');
        taskItem.setAttribute('data-index', index);
        taskItem.innerHTML = `
            <div>
                <strong>${task.name}</strong>
                <span>${task.description}</span>
                <br>
                <small>Due: ${task.dueDate} | Importance: ${task.importance} | Urgency: ${task.urgency}</small>
            </div>
            <div>
                <button class="edit-btn" onclick="editTask(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
            </div>
        `;

        if (task.status === 'pending') {
            pendingTasksList.appendChild(taskItem);
        } else if (task.status === 'inProgress') {
            inProgressTasksList.appendChild(taskItem);
        } else if (task.status === 'completed') {
            completedTasksList.appendChild(taskItem);
        }
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
}

const sortTasks = () => {
    const sortBy = document.getElementById('sort').value;
    if (sortBy === 'date') {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === 'priority') {
        tasks.sort((a, b) => b.priority - a.priority);
    }
    renderTaskList();
};

const filterTasksByStatus = () => {
    renderTaskList();
};

const setupDragAndDrop = () => {
    const taskContainers = document.querySelectorAll('.task-container');

    taskContainers.forEach(container => {
        container.addEventListener('dragover', (event) => {
            event.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', async (event) => {
            event.preventDefault();
            container.classList.remove('drag-over');

            const taskItem = document.querySelector('.task-item.dragging');
            if (taskItem) {
                const index = parseInt(taskItem.getAttribute('data-index'));

                // Mapping container ID to the correct status
                const statusMapping = {
                    'pending-tasks': 'pending',
                    'in-progress-tasks': 'inProgress',
                    'completed-tasks': 'completed'
                };

                const newStatus = statusMapping[container.id];

                // Update task status
                if (tasks[index]) {
                    tasks[index].status = newStatus;
                    await updateTasks();
                    renderTaskList();  // Re-render task lists after status update
                }
            }
        });
    });

    document.addEventListener('dragstart', (event) => {
        if (event.target.tagName === 'LI') {
            event.target.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', (event) => {
        if (event.target.tagName === 'LI') {
            event.target.classList.remove('dragging');
        }
    });
};
