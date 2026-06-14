/* ==========================================================================
   1. Tracks Database & Local Application Engine Configurations
   ========================================================================== */
const songs = [
    { title: "Midnight Dreams", artist: "Musicify Studio", file: "songs/song1.mp3", cover: "images/cover1.jpg" },
    { title: "Ocean Waves", artist: "Musicify Studio", file: "songs/song2.mp3", cover: "images/cover2.jpg" },
    { title: "Night Drive", artist: "Musicify Studio", file: "songs/song3.mp3", cover: "images/cover3.jpg" },
    { title: "Golden Horizon", artist: "Musicify Studio", file: "songs/song4.mp3", cover: "images/cover4.jpg" },
    { title: "Neon Lights", artist: "Musicify Studio", file: "songs/song5.mp3", cover: "images/cover5.jpg" },
    { title: "Sunrise Journey", artist: "Musicify Studio", file: "songs/song6.mp3", cover: "images/cover6.jpg" },
    { title: "Coffee & LoFi", artist: "Musicify Studio", file: "songs/song7.mp3", cover: "images/cover7.jpg" }
];

let currentSong = 0;
let isPlaying = false;
let shuffleMode = false;
let repeatMode = false;
let favorites = [0, 2]; // Preloaded baseline array data structures indices
let isDraggingSlider = false;

/* ==========================================================================
   2. DOM Native Elements Registration
   ========================================================================== */
const audio = document.getElementById("audio-element");
const cover = document.getElementById("track-cover");
const title = document.getElementById("track-title");
const artist = document.getElementById("track-artist");

// Control Button Triggers
const playBtn = document.getElementById("play-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const favoriteBtn = document.getElementById("track-like-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");

// Top Header Elements
const menuTriggerBtn = document.getElementById("menu-trigger-btn");
const optionsTriggerBtn = document.getElementById("options-trigger-btn");
const sideDrawer = document.getElementById("side-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-drawer-btn");
const optionsDropdown = document.getElementById("options-dropdown");

// Tracking Node Sliders
const progress = document.getElementById("progress-bar");
const volume = document.getElementById("volume-bar");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("total-duration");

// Display Rendering Containers Pools
const playlistContainer = document.getElementById("suggestions-list");
const favoritesContainer = document.getElementById("favorites-list");
const searchInput = document.getElementById("search-input");

/* ==========================================================================
   3. Media Playback Control Lifecycle Core
   ========================================================================== */
function loadSong(index) {
    currentSong = index;
    const song = songs[currentSong];

    title.textContent = song.title;
    artist.textContent = song.artist;
    cover.src = song.cover;
    audio.src = song.file;

    // Track Heart Status Rendering Adjustments
    if (favorites.includes(currentSong)) {
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart like-btn liked"></i>';
    } else {
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart like-btn"></i>';
    }

    // Safely clear tracker configurations layout states
    progress.value = 0;
    progress.style.background = `linear-gradient(to right, var(--spotify-green) 0%, #282828 0%)`;
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
}

function playSong() {
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    audio.play().catch(() => console.log("Playback engine waiting on context gesture initialization."));
}

function pauseSong() {
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    audio.pause();
}

// Global Tab Switching Helper Engine
function switchActiveView(targetViewId) {
    document.querySelectorAll(".nav-item").forEach(n => {
        if (n.getAttribute('data-target') === targetViewId) {
            n.classList.add("active");
        } else {
            n.classList.remove("active");
        }
    });
    
    document.querySelectorAll(".view-section").forEach(v => {
        if (v.id === targetViewId) {
            v.classList.remove("hidden");
        } else {
            v.classList.add("hidden");
        }
    });

    // Hot refresh lists if target calls for it
    if (targetViewId === 'view-favorites') renderFavoritesView();
    if (targetViewId === 'view-search' || targetViewId === 'view-playlist') renderPlaylistView();
}

function nextSong() {
    if (shuffleMode) {
        currentSong = Math.floor(Math.random() * songs.length);
    } else {
        currentSong = (currentSong + 1) % songs.length;
    }
    loadSong(currentSong);
    if (isPlaying) playSong();
    updateActiveRowState();
}

function prevSong() {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    loadSong(currentSong);
    if (isPlaying) playSong();
    updateActiveRowState();
}

/* ==========================================================================
   4. Component Content Node Builders & Dynamic Renders
   ========================================================================== */
function buildTrackRowMarkup(song, index) {
    const isLiked = favorites.includes(index);
    const row = document.createElement("div");
    row.className = `song-row-item track-row-${index}`;
    
    row.innerHTML = `
        <img class="row-img" src="${song.cover}" alt="Cover">
        <div class="row-details">
            <div class="row-title">${song.title}</div>
            <div class="row-artist">${song.artist}</div>
        </div>
        <i class="fa-heart ${isLiked ? 'fa-solid liked-active' : 'fa-regular'} row-action-icon"></i>
    `;

    // Row Click Routing
    row.querySelector(".row-details").addEventListener("click", () => {
        loadSong(index);
        playSong();
        switchActiveView("view-home");
    });

    // Row Inline Heart Button Click Toggles
    row.querySelector(".row-action-icon").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavoriteState(index);
    });

    return row;
}

function renderPlaylistView() {
    if (!playlistContainer) return;
    playlistContainer.innerHTML = "";
    songs.forEach((song, idx) => {
        playlistContainer.appendChild(buildTrackRowMarkup(song, idx));
    });
    updateActiveRowState();
}

function renderFavoritesView() {
    if (!favoritesContainer) return;
    favoritesContainer.innerHTML = "";
    
    const favTracks = songs
        .map((s, idx) => ({ ...s, originalIndex: idx }))
        .filter(s => favorites.includes(s.originalIndex));
    
    if (favTracks.length === 0) {
        favoritesContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px; font-size:0.9rem;">No favorites added yet.</p>`;
        return;
    }
    
    favTracks.forEach(song => {
        favoritesContainer.appendChild(buildTrackRowMarkup(song, song.originalIndex));
    });
    updateActiveRowState();
}

function updateActiveRowState() {
    document.querySelectorAll(".song-row-item").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(`.track-row-${currentSong}`).forEach(el => el.classList.add("active"));
}

function toggleFavoriteState(index) {
    if (favorites.includes(index)) {
        favorites = favorites.filter(idx => idx !== index);
    } else {
        favorites.push(index);
    }
    
    if (index === currentSong) loadSong(currentSong);
    renderFavoritesView();
    renderPlaylistView();
}

/* ==========================================================================
   5. Global Event Pipelines & Streams Subscriptions
   ========================================================================== */
function setupEventPipelines() {
    // Deck Control Inputs
    playBtn.addEventListener("click", () => isPlaying ? pauseSong() : playSong());
    nextBtn.addEventListener("click", nextSong);
    prevBtn.addEventListener("click", prevSong);
    favoriteBtn.addEventListener("click", () => toggleFavoriteState(currentSong));

    // Shuffle / Repeat Mode Exclusivity Loop
    shuffleBtn.addEventListener("click", () => {
        shuffleMode = !shuffleMode;
        if (shuffleMode) {
            repeatMode = false;
            repeatBtn.classList.remove("repeat-active");
        }
        shuffleBtn.classList.toggle("shuffle-active", shuffleMode);
    });

    repeatBtn.addEventListener("click", () => {
        repeatMode = !repeatMode;
        if (repeatMode) {
            shuffleMode = false;
            shuffleBtn.classList.remove("shuffle-active");
        }
        repeatBtn.classList.toggle("repeat-active", repeatMode);
    });

    /* ============================================================
       IMPROVEMENT FIX: Inside Side Drawer Action Links Handles
       ============================================================ */
    const hideDrawerOverlay = () => {
        sideDrawer.classList.remove("open");
        drawerOverlay.classList.remove("visible");
    };

    menuTriggerBtn.addEventListener("click", () => {
        sideDrawer.classList.add("open");
        drawerOverlay.classList.add("visible");
    });

    closeDrawerBtn.addEventListener("click", hideDrawerOverlay);
    drawerOverlay.addEventListener("click", hideDrawerOverlay);

    // Dynamic Binding for items inside left sidebar
    const drawerItems = document.querySelectorAll(".drawer-links li");
    drawerItems.forEach((li) => {
        li.addEventListener("click", (e) => {
            const chosenOption = e.currentTarget.textContent.trim();
            hideDrawerOverlay(); // Close side-drawer immediately

            if (chosenOption === "Listening History") {
                // Route user to the Playlist Tab view screen smoothly
                switchActiveView("view-playlist");
            } else {
                alert(`Setting Feature Coming Soon: "${chosenOption}"`);
            }
        });
    });

    /* ============================================================
       IMPROVEMENT FIX: Inside Top-Right Dropdown Options Handles
       ============================================================ */
    optionsTriggerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        optionsDropdown.classList.toggle("hidden");
    });

    // Dismiss active dropdown layer on body touch boundaries
    document.addEventListener("click", () => {
        optionsDropdown.classList.add("hidden");
    });

    // Dynamic Binding for choices inside right contextual bubble
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            optionsDropdown.classList.add("hidden"); // Collapse instantly
            const selection = e.currentTarget.textContent.trim();
            const activeSong = songs[currentSong];

            if (selection === "Track Details") {
                alert(`🎵 Track Profile:\n\nTitle: ${activeSong.title}\nArtist: ${activeSong.artist}\nSource: Local Asset Pipeline`);
            } else if (selection === "Share Song") {
                alert(`🔗 Shared Successfully!\nCopied link for "${activeSong.title}" to clipboard!`);
            }
        });
    });

    // Native Audio Stream Hook Callbacks
    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        if (isDraggingSlider || !audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.value = percent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        progress.style.background = `linear-gradient(to right, var(--spotify-green) ${percent}%, #282828 ${percent}%)`;
    });

    audio.addEventListener("ended", () => {
        if (repeatMode) {
            audio.currentTime = 0;
            playSong();
        } else {
            nextSong();
        }
    });

    // Slider User Tracking Events (Prevent slider UI jumping)
    progress.addEventListener("input", () => { isDraggingSlider = true; });
    progress.addEventListener("change", () => {
        if (audio.duration) {
            audio.currentTime = (progress.value / 100) * audio.duration;
        }
        isDraggingSlider = false;
    });

    volume.addEventListener("input", () => {
        audio.volume = volume.value / 100;
    });

    // Real-time Text Search Logic Filter
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase().trim();
            const items = playlistContainer.querySelectorAll(".song-row-item");
            
            items.forEach(item => {
                const titleText = item.querySelector(".row-title").textContent.toLowerCase();
                const artistText = item.querySelector(".row-artist").textContent.toLowerCase();
                if (titleText.includes(query) || artistText.includes(query)) {
                    item.style.display = "flex";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }

    // Bottom Tab Bar Routing Deck
    document.querySelectorAll(".nav-item").forEach(nav => {
        nav.addEventListener("click", function() {
            const targetId = this.getAttribute('data-target');
            switchActiveView(targetId);
        });
    });
}

/* ==========================================================================
   6. Core Utilities & Application Startup Boots
   ========================================================================== */
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

document.addEventListener("DOMContentLoaded", () => {
    loadSong(currentSong);
    renderPlaylistView();
    renderFavoritesView();
    setupEventPipelines();
});