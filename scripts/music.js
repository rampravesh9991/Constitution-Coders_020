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
// ----------music.js-------------
const apiUrl = 'http://localhost:3000/users';

const userId = localStorage.getItem('loggedInUserId');

document.getElementById('playlist-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const playlistName = document.getElementById('playlist-name').value;
    if (playlistName) {
        createPlaylist(playlistName);
        document.getElementById('playlist-name').value = '';
    }
});

document.getElementById('playlists-dropdown').addEventListener('change', function(event) {
    const playlistName = event.target.value;
    if (playlistName) {
        displaySelectedPlaylist(playlistName);
    }
});

document.getElementById('play-pause-button').addEventListener('click', togglePlayPause);
document.getElementById('prev-button').addEventListener('click', playPrevious);
document.getElementById('next-button').addEventListener('click', playNext);
document.getElementById('add-music-button').addEventListener('click', function() {
    const musicUrl = document.getElementById('music-url').value;
    const playlistName = document.getElementById('playlists-dropdown').value;
    if (musicUrl && playlistName) {
        addMusicToPlaylist(playlistName, musicUrl);
        document.getElementById('music-url').value = '';
    }
});

async function createPlaylist(name) {
    try {
        const user = await fetchUser(userId);
        const newPlaylist = { name, videos: [] };
        user.playlists.push(newPlaylist);

        const response = await fetch(`${apiUrl}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (response.ok) {
            populatePlaylistDropdown(user.playlists);
        } else {
            console.error('Failed to create playlist:', response.statusText);
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
    }
}

async function fetchUser(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

async function fetchPlaylists() {
    try {
        const user = await fetchUser(userId);
        populatePlaylistDropdown(user.playlists);
        // populateSidebar(user.playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
    }
}

function populatePlaylistDropdown(playlists) {
    console.log(playlists);
    const dropdown = document.getElementById('playlists-dropdown');
    dropdown.innerHTML = '<option value="">Select a Playlist</option>';
    playlists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist.name;
        option.textContent = playlist.name;
        dropdown.appendChild(option);
    });
}

async function displaySelectedPlaylist(playlistName) {
    const user = await fetchUser(userId);
    const playlist = user.playlists.find(p => p.name === playlistName);
    const videoDisplay = document.getElementById('video-display');
    const playlistVideos = document.getElementById('playlist-videos');

    videoDisplay.innerHTML = '';
    playlistVideos.innerHTML = '';

    if (playlist.videos.length > 0) {
        currentPlaylist = playlist.videos.map(video => video.url);
        currentIndex = 0;
        playVideo(currentPlaylist[currentIndex]);

        playlist.videos.forEach(video => {
            addVideoListElement(playlistVideos, video.url);
        });
    } else {
        currentPlaylist = [];
        currentIndex = 0;
    }
}

async function addMusicToPlaylist(playlistName, videoUrl) {
    try {
        const user = await fetchUser(userId);
        const playlist = user.playlists.find(p => p.name === playlistName);
        playlist.videos.push({ url: videoUrl });

        const response = await fetch(`${apiUrl}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (response.ok) {
            const playlistVideos = document.getElementById('playlist-videos');
            addVideoListElement(playlistVideos, videoUrl);
        } else {
            console.error('Failed to add music to playlist:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding music to playlist:', error);
    }
}

function addVideoElement(container, videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    const videoDiv = document.createElement('div');
    videoDiv.classList.add('video');
    videoDiv.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0"></iframe>
    `;
    container.appendChild(videoDiv);
}

document.getElementById('playlist-videos').addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('video-list-item')) {
        const videoUrl = target.dataset.videoUrl;
        playVideo(videoUrl);
    } else if (target.classList.contains('delete-btn')) {
        const videoUrl = target.dataset.videoUrl;
        const playlistName = document.getElementById('playlists-dropdown').value;
        deleteVideoFromPlaylist(playlistName, videoUrl, target.parentElement);
    }
});

function addVideoListElement(container, videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    const videoListItem = document.createElement('div');
    videoListItem.classList.add('video-list-item');
    videoListItem.dataset.videoUrl = videoUrl;
    videoListItem.innerHTML = `
        <img src="https://img.youtube.com/vi/${videoId}/0.jpg" alt="Video Thumbnail">
        <span>${getYouTubeVideoTitle(videoUrl)}</span>
        <button class="delete-btn" data-video-url="${videoUrl}">Delete</button>
    `;
    container.appendChild(videoListItem);
}

async function deleteVideoFromPlaylist(playlistName, videoUrl, videoElement) {
    try {
        const user = await fetchUser(userId);
        const playlist = user.playlists.find(p => p.name === playlistName);
        const videoIndex = playlist.videos.findIndex(video => video.url === videoUrl);
        if (videoIndex > -1) {
            playlist.videos.splice(videoIndex, 1);
            const response = await fetch(`${apiUrl}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (response.ok) {
                videoElement.remove();
            } else {
                console.error('Failed to delete video:', response.statusText);
            }
        }
    } catch (error) {
        console.error('Error deleting video from playlist:', error);
    }
}

// Existing functions and initial fetch call


function getYouTubeVideoId(url) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
}

function getYouTubeVideoTitle(url) {
    return getYouTubeVideoId(url);
}

let currentPlaylist = [];
let currentIndex = 0;
let isPlaying = false;

function playVideo(url) {
    const videoDisplay = document.getElementById('video-display');
    videoDisplay.innerHTML = '';
    addVideoElement(videoDisplay, url);
    updateBottomBar(url);
    isPlaying = true;
    document.getElementById('play-pause-button').textContent = 'Pause';
}

function updateBottomBar(url) {
    const videoId = getYouTubeVideoId(url);
    document.getElementById('current-thumbnail').src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    document.getElementById('current-music-name').textContent = getYouTubeVideoTitle(url);
}

function togglePlayPause() {
    if (isPlaying) {
        pauseVideo();
    } else {
        playVideo(currentPlaylist[currentIndex]);
    }
}

function pauseVideo() {
    // Implementation to pause video (depends on how you handle video playing)
    const iframe = document.querySelector('#video-display iframe');
    if (iframe) {
        const iframeSrc = iframe.src;
        iframe.src = iframeSrc;  // Reloads the iframe, effectively pausing it
    }
    isPlaying = false;
    document.getElementById('play-pause-button').textContent = 'Play';
}

function playPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        playVideo(currentPlaylist[currentIndex]);
    }
}

function playNext() {
    if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        playVideo(currentPlaylist[currentIndex]);
    }
}

// Initial fetch of playlists
fetchPlaylists();



//-----------------------timer functionality
let focusButton = document.getElementById("focus");
let buttons = document.querySelectorAll(".btn");
let shortBreakButton = document.getElementById("shortbreak");
let longBreakButton = document.getElementById("longbreak");
let startBtn = document.getElementById("btn-start");
let reset = document.getElementById("btn-reset");
let pause = document.getElementById("btn-pause");
let time = document.getElementById("time");
let set;
let active = "focus";
let count = 59;
let paused = true;
let minCount = 24;
time.textContent = `${minCount + 1}:00`;

const appendZero = (value) => {
  value = value < 10 ? `0${value}` : value;
  return value;
};

reset.addEventListener(
  "click",
  (resetTime = () => {
    pauseTimer();
    switch (active) {
      case "long":
        minCount = 14;
        break;
      case "short":
        minCount = 4;
        break;
      default:
        minCount = 24;
        break;
    }
    count = 59;
    time.textContent = `${minCount + 1}:00`;
  })
);

const removeFocus = () => {
  buttons.forEach((btn) => {
    btn.classList.remove("btn-focus");
  });
};

focusButton.addEventListener("click", () => {
  removeFocus();
  focusButton.classList.add("btn-focus");
  pauseTimer();
  minCount = 24;
  count = 59;
  time.textContent = `${minCount + 1}:00`;

//   setTimeout(() => {
//     document.body.style.backgroundColor = "#a32631e1"; 
//   }, 500);
  
});

shortBreakButton.addEventListener("click", () => {
  active = "short";
  removeFocus();
  shortBreakButton.classList.add("btn-focus");
  pauseTimer();
  minCount = 4;
  count = 59;
  time.textContent = `${appendZero(minCount + 1)}:00`;
//   setTimeout(() => {
//     document.body.style.backgroundColor = "#267ba3d9"; 
//   },500);
  
});

longBreakButton.addEventListener("click", () => {
  active = "long";
  removeFocus();
  longBreakButton.classList.add("btn-focus");
  pauseTimer();
  minCount = 14;
  count = 59;
  time.textContent = `${minCount + 1}:00`;
//   setTimeout(() => {
//     document.body.style.backgroundColor = "#26a369e1"; 
//   }, 500);
  
});

pause.addEventListener(
  "click",
  (pauseTimer = () => {
    
    paused = true;
    clearInterval(set);
    startBtn.classList.remove("hide");
    pause.classList.remove("show");
    reset.classList.remove("show");
  })
);

startBtn.addEventListener("click", () => {
  reset.classList.add("show");
  pause.classList.add("show");
  startBtn.classList.add("hide");
  startBtn.classList.remove("show");
  if (paused) {
    paused = false;
    time.textContent = `${appendZero(minCount)}:${appendZero(count)}`;
    set = setInterval(() => {
      count--;
      time.textContent = `${appendZero(minCount)}:${appendZero(count)}`;
      if (count == 0) {
        if (minCount != 0) {
          minCount--;
          count = 60;
        } else {
          clearInterval(set);
        }
      }
    }, 1000);
  }
});



// my diary
// Assuming userId is already defined and available for notes management

document.getElementById('show-calendar-events').addEventListener('click', fetchGoogleCalendarEvents);
document.getElementById('notes-dropdown').addEventListener('change', displaySelectedNote);

// Fetch Google Calendar Events
async function fetchGoogleCalendarEvents() {
    // Implement Google Calendar API call here
    // Example placeholder:
    const events = await getGoogleCalendarEvents();
    const diaryContent = document.getElementById('diary-content');
    diaryContent.innerHTML = '<h2>Google Calendar Events</h2>';
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.textContent = `${event.summary} - ${event.start.dateTime}`;
        diaryContent.appendChild(eventDiv);
    });
}

// Placeholder function for Google Calendar API
async function getGoogleCalendarEvents() {
    // Implement the API call to fetch events
    return [
        { summary: 'Event 1', start: { dateTime: '2024-07-22T10:00:00Z' } },
        { summary: 'Event 2', start: { dateTime: '2024-07-23T14:00:00Z' } }
    ];
}

// Fetch notes from local storage or API
async function fetchNotes() {
    const notes = await getUserNotes(userId);
    populateNotesDropdown(notes);
}

// Placeholder function to get user notes
async function getUserNotes(userId) {
    // Implement the API call to fetch user notes
    return [
        { title: 'Note 1', content: 'Content of Note 1' },
        { title: 'Note 2', content: 'Content of Note 2' }
    ];
}

// Populate notes dropdown
function populateNotesDropdown(notes) {
    const dropdown = document.getElementById('notes-dropdown');
    dropdown.innerHTML = '<option value="">Select a Note</option>';
    notes.forEach(note => {
        const option = document.createElement('option');
        option.value = note.title;
        option.textContent = note.title;
        dropdown.appendChild(option);
    });
}

// Display selected note
function displaySelectedNote() {
    const selectedNoteTitle = document.getElementById('notes-dropdown').value;
    if (selectedNoteTitle) {
        const note = findNoteByTitle(selectedNoteTitle);
        displayNoteContent(note);
    }
}

// Find note by title (from fetched notes)
function findNoteByTitle(title) {
    const notes = [
        { title: 'Note 1', content: 'Content of Note 1' },
        { title: 'Note 2', content: 'Content of Note 2' }
    ]; // This should be replaced by the actual notes fetched
    return notes.find(note => note.title === title);
}

// Display note content and make it editable
function displayNoteContent(note) {
    const diaryContent = document.getElementById('diary-content');
    diaryContent.innerHTML = `
        <h2>${note.title}</h2>
        <textarea id="note-content">${note.content}</textarea>
        <button id="save-note-button">Save</button>
    `;
    document.getElementById('save-note-button').addEventListener('click', saveNoteContent);
}

// Save note content
async function saveNoteContent() {
    const selectedNoteTitle = document.getElementById('notes-dropdown').value;
    const newContent = document.getElementById('note-content').value;
    // Update note content in storage or API
    await updateUserNote(userId, selectedNoteTitle, newContent);
    alert('Note saved!');
}

// Placeholder function to update user note
async function updateUserNote(userId, title, content) {
    // Implement the API call to update the note
    console.log(`Updated note for ${userId}: ${title} - ${content}`);
}

// Initial fetch of notes to populate dropdown
fetchNotes();
