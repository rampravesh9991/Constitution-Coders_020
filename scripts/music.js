// -----------navbar js--------
function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('open');
}
function aboutPage(){
    window.location.href = "/htmls/about.html";
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

function addVideoListElement(container, videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    const videoListItem = document.createElement('div');
    videoListItem.classList.add('video-list-item');
    videoListItem.innerHTML = `
        <img src="https://img.youtube.com/vi/${videoId}/0.jpg" alt="Video Thumbnail">
        <span>${getYouTubeVideoTitle(videoUrl)}</span>
    `;
    container.appendChild(videoListItem);
}

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