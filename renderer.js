// let timer;
// let startTime;
// let elapsedTime = 0;
// let running = false;

// document.addEventListener('DOMContentLoaded', (event) => {
//     // Load saved timer state
//     if (localStorage.getItem('running') === 'true') {
//         startTime = Date.now() - parseInt(localStorage.getItem('elapsedTime'), 10);
//         timer = setInterval(updateTime, 1000);
//         running = true;
//     } else if (localStorage.getItem('elapsedTime')) {
//         elapsedTime = parseInt(localStorage.getItem('elapsedTime'), 10);
//         updateTime();
//     }
// });

// document.getElementById('playButton').addEventListener('click', () => {
//     if (!running) {
//         startTime = Date.now() - elapsedTime;
//         timer = setInterval(updateTime, 1000);
//         running = true;
//         localStorage.setItem('running', 'true');
//     }
// });

// document.getElementById('pauseButton').addEventListener('click', () => {
//     if (running) {
//         clearInterval(timer);
//         elapsedTime = Date.now() - startTime;
//         running = false;
//         localStorage.setItem('elapsedTime', elapsedTime);
//         localStorage.setItem('running', 'false');
//     }
// });

// document.getElementById('stopButton').addEventListener('click', () => {
//     clearInterval(timer);
//     elapsedTime = 0;
//     running = false;
//     updateTime();
//     localStorage.removeItem('elapsedTime');
//     localStorage.setItem('running', 'false');
// });

// function updateTime() {
//     const timeElapsed = running ? Date.now() - startTime : elapsedTime;
//     const totalSeconds = Math.floor(timeElapsed / 1000);

//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;

//     document.getElementById('timerDisplay').textContent = 
//         `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

//     if (running) {
//         localStorage.setItem('elapsedTime', timeElapsed);
//     }
// 
const { ipcRenderer } = require('electron')
const moment = require('moment')
const axios = require('axios')
const FormData = require('form-data');

const userData = JSON.parse(sessionStorage.getItem('userData'));
if (userData && userData.user) {
    document.getElementById('welcomeMessage').innerText = `${userData.user.name}!`;
}

let timer; // Variable to hold the setInterval reference
let startTime; // Variable to store the start time of the timer
let elapsedTime = 0; // Variable to store the elapsed time during the current session
let totalElapsedTime = 0; // Variable to store the total elapsed time
let running = false; // Flag to track if the timer is running or paused

document.addEventListener('DOMContentLoaded', () => {

        checkExpiry();
        setExpiryForEndOfDay();
    // Load saved timer state if available

    

    if (localStorage.getItem('running') === 'true') {
        startTime = Date.now() - parseInt(localStorage.getItem('elapsedTime'), 10);
        totalElapsedTime = parseInt(localStorage.getItem('totalElapsedTime'), 10) || 0;
        timer = setInterval(updateTime, 1000); // Start the timer interval
        running = true;
    } else {
        elapsedTime = parseInt(localStorage.getItem('elapsedTime'), 10) || 0;
        totalElapsedTime = parseInt(localStorage.getItem('totalElapsedTime'), 10) || 0;
        updateTime();
    }
});

// Event listener for the "Play" button
document.getElementById('playButton').addEventListener('click', () => {
    const projectDropdown = document.getElementById('cars');
    const selectedProject = projectDropdown.value;
    if (selectedProject === '') {
        alert('Please select a project.');
        return; // Exit the function if no project is selected
    }
    
        // Check if there's data in localStorage on page load
        // const storedData = localStorage.getItem('userReportData');
        // if (storedData) {
        //     const parsedData = JSON.parse(storedData);
        //     addDataToTable(parsedData);
        //     // Show the table if there's already stored data
        //     table.style.display = 'table';
        // }
    
        
    if (!running) { // If timer is not already running
        startTime = Date.now() - elapsedTime;
        timer = setInterval(updateTime, 1000); // Start the timer interval
        running = true;
        localStorage.setItem('running', 'true');
        ipcRenderer.send('start-capturing'); // Store running state in localStorage
      
        const selectedProjectName = projectDropdown.options[projectDropdown.selectedIndex].text;
        const table = document.getElementById('reportTable');
        const tableBody = document.querySelector('#reportTable tbody');
        const userData = JSON.parse(sessionStorage.getItem('userData'))
        const date = moment().format('YYYY-MM-DD HH:mm:ss')
        // const date = Date.now()
        
      
        const userReportData = {
            user_id:userData.user.id,
            name:userData.user.name,
            email:userData.user.email,
            project_id:selectedProject,
            project_name:selectedProjectName,
            start_time:date,
            end_time:null,
        }

        const sendReport = async () => {
            try {
                const response = await axios.post('http://127.0.0.1:8000/projects-report', userReportData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                console.log('Success:', response.data);
            } catch (error) {
                console.error('Error:', error.response.data);
            }
        };
        
        sendReport();
        
        
        // const getReport = async () => {
        //     try {
        //         const response = await axios.get(`http://127.0.0.1:8000/projects-report/${userData.user.id}`);
        //         const data = response.data
        //         data.forEach((item)=>{
        //             addDataToTable(item)
        //         })
        //     } catch (error) {
        //         console.error('Error:', error);
        //     }
        // };
        // getReport();
        // // Show the table
        // table.style.display = 'table';

        // function addDataToTable(data) {
        //     const row = document.createElement('tr');
        //     row.innerHTML = `
        //         <td>${data.name}</td>
        //         <td>${data.email}</td>
        //         <td>${data.project_name}</td>
        //         <td>${data.start_time}</td>
        //         <td>${data.end_time ? data.end_time : 'In Progress'}</td>
        //     `;
        //     tableBody.appendChild(row);
        // }
    }
});



// Event listener for the "Pause" button
// document.getElementById('pauseButton').addEventListener('click', () => {
//     if (running) { // If timer is currently running
//         clearInterval(timer); // Stop the timer interval
//         elapsedTime = Date.now() - startTime; // Calculate elapsed time
//         totalElapsedTime += elapsedTime; // Add the current elapsed time to the total elapsed time
//         running = false;
//         localStorage.setItem('elapsedTime', elapsedTime); // Store elapsed time in localStorage
//         localStorage.setItem('totalElapsedTime', totalElapsedTime); // Store total elapsed time in localStorage
//         localStorage.setItem('running', 'false'); // Store running state in localStorage
//         updateTime();
//     }
// });
document.getElementById('pauseButton').addEventListener('click', () => {
    if (running) { // If the timer is currently running
        clearInterval(timer); // Stop the timer interval
        elapsedTime = Date.now() - startTime; // Calculate the current elapsed time
        running = false;
        localStorage.setItem('elapsedTime', elapsedTime); // Store the current elapsed time in localStorage
        localStorage.setItem('running', 'false'); // Store the running state in localStorage
        updateTime(); // Update the display
        ipcRenderer.send('stop-capturing');
    }
});



// Event listener for the "Stop" button
document.getElementById('stopButton').addEventListener('click', () => {
    if (running) {
        clearInterval(timer); // Stop the timer interval
        elapsedTime = Date.now() - startTime; // Calculate elapsed time
        totalElapsedTime += elapsedTime; 
        ipcRenderer.send('stop-capturing');

        

        
        

    }
    elapsedTime = 0; // Reset elapsed time for the next session
    running = false;
    localStorage.removeItem('elapsedTime'); // Remove elapsed time from localStorage
    localStorage.setItem('totalElapsedTime', totalElapsedTime); // Store total elapsed time in localStorage
    localStorage.setItem('running', 'false'); // Store running state in localStorage
    updateTime(); // Update the time display immediately

    const projectDropdown = document.getElementById('cars');
    const selectedProject = projectDropdown.value;

    const updateReport = async () => {
        try {
            const response = await axios.put(`http://127.0.0.1:8000/project-report/${selectedProject}`,{
                end_time: moment().format('YYYY-MM-DD HH:mm:ss') 
            });
            console.log(response)
        } catch (error) {
            console.error('Error:', error);
        }
    };
    updateReport();

    const table = document.getElementById('reportTable');
    const tableBody = document.querySelector('#reportTable tbody');
    const date = moment().format('YYYY-MM-DD HH:mm:ss')
    const getReport = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/projects-report/${userData.user.id}`);
            const data = response.data
            data.forEach((item)=>{
                addDataToTable(item)
            })
        } catch (error) {
            console.error('Error:', error);
        }
    };
    getReport();
    // Show the table
    table.style.display = 'table';

    function addDataToTable(data) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${data.project_name}</td>
            <td>${data.start_time}</td>
            <td>${date}</td>
        `;
        tableBody.appendChild(row);
    }
});

// Function to update the time display
function updateTime() {
    const currentTime = Date.now(); // Current time
    const timeElapsed = running ? currentTime - startTime : elapsedTime;
    const totalSeconds = Math.floor(timeElapsed / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('timerDisplay').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Calculate total time elapsed
    const totalTimeElapsedSeconds = Math.floor(totalElapsedTime / 1000);
    const totalHours = Math.floor(totalTimeElapsedSeconds / 3600);
    const totalMinutes = Math.floor((totalTimeElapsedSeconds % 3600) / 60);
    const totalSecondsDisplay = totalTimeElapsedSeconds % 60;

    document.getElementById('totalTimeDisplay').textContent = 
        `Total Time Used: ${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSecondsDisplay).padStart(2, '0')}`;

    if (running) {
        localStorage.setItem('elapsedTime', timeElapsed); // Update elapsed time in localStorage
    } else {
        localStorage.removeItem('elapsedTime'); // Remove elapsed time from localStorage
    }
}

function checkExpiry() {
    const expiryTimestamp = parseInt(localStorage.getItem('expiryTimestamp'), 10);
    const now = Date.now();

    if (expiryTimestamp && now > expiryTimestamp) {
        localStorage.clear(); // Clear local storage if the expiry timestamp has passed
    }
}

// Function to set expiry timestamp for the end of the day
function setExpiryForEndOfDay() {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    localStorage.setItem('expiryTimestamp', endOfDay.getTime()); // Store expiry timestamp in localStorage
}

document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('cars');

    // Fetch data from API endpoint
    fetch('http://127.0.0.1:8000/projects')
        .then(response => response.json())
        .then(data => {
            // Iterate over the data and create option elements
            data.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id; // Set the value of the option
                option.textContent = project.name; // Set the text content of the option
                selectElement.appendChild(option); // Append the option to the select element
            });
        })
        .catch(error => console.error('Error fetching projects:', error));
});
