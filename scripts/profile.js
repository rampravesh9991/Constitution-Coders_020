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
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const taskData = processTaskData(completedTasks);
        createLineChart(taskData);
        createBarChart(taskData);
        createHeatMap(taskData);
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
};

const processTaskData = (tasks) => {
    const taskData = d3.rollup(
        tasks,
        v => v.length,
        d => d3.timeDay(new Date(d.dueDate))
    );
    return Array.from(taskData, ([key, value]) => ({ date: key, count: value }));
};

const createLineChart = (data) => {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).range([height, 0]);

    const line = d3.line().x(d => x(d.date)).y(d => y(d.count));

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
        .attr("d", line);
};

const createBarChart = (data) => {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand().domain(data.map(d => d.date)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).range([height, 0]);

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

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.date))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "steelblue");
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

    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(data, d => d.count)]);

    svg.selectAll()
        .data(data, d => `${d.date.getMonth()}-${d.date.getDate()}`)
        .enter()
        .append("rect")
        .attr("x", d => x(monthNames[d.date.getMonth()]))
        .attr("y", d => y(d.date.getDate()))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => color(d.count));

    svg.selectAll()
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(monthNames[d.date.getMonth()]) + x.bandwidth() / 2)
        .attr("y", d => y(d.date.getDate()) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .style("fill", d => d.count > 5 ? "white" : "black")
        .text(d => d.count);
};
