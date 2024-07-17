const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('tasks');
const taskListContainer = document.getElementById('task-list');
let tasks = [];
let editIndex = -1;

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const importance = document.getElementById('importance').value;
    const urgency = document.getElementById('urgency').value;

    const task = {
        name: taskName,
        description: taskDescription,
        dueDate: dueDate,
        importance: importance,
        urgency: urgency,
        priority: calculatePriority(importance, urgency)
    };

    if (editIndex === -1) {
        tasks.push(task);
    } else {
        tasks[editIndex] = task;
        editIndex = -1;
    }

    taskForm.reset();
    renderTaskList();
});

function calculatePriority(importance, urgency) {
    const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
    return priorityOrder[importance] + priorityOrder[urgency];
}

function renderTaskList() {
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const taskHTML = `
            <li class="task">
                <div>
                    <span class="priority-${task.importance}">${task.name}</span><br>
                    <span><i>${task.description}</i></span><br>
                    <span>${task.dueDate}</span><br>
                    <span><b>Importance:</b> ${task.importance}</span><br>
                    <span><b>Urgency:</b> ${task.urgency}</span>
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

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTaskList();
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-description').value = task.description;
    document.getElementById('due-date').value = task.dueDate;
    document.getElementById('importance').value = task.importance;
    document.getElementById('urgency').value = task.urgency;
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

renderTaskList();
