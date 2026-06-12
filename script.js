const songs = [
    {
        title: "Midnight Dreams",
        artist: "Musicify Studio",
        file: "songs/song1.mp3",
        cover: "images/cover1.jpg"
    },
    {
        title: "Ocean Waves",
        artist: "Musicify Studio",
        file: "songs/song2.mp3",
        cover: "images/cover2.jpg"
    },
    {
        title: "Night Drive",
        artist: "Musicify Studio",
        file: "songs/song3.mp3",
        cover: "images/cover3.jpg"
    },
    {
        title: "Golden Horizon",
        artist: "Musicify Studio",
        file: "songs/song4.mp3",
        cover: "images/cover4.jpg"
    },
    {
        title: "Neon Lights",
        artist: "Musicify Studio",
        file: "songs/song5.mp3",
        cover: "images/cover5.jpg"
    },
    {
        title: "Sunrise Journey",
        artist: "Musicify Studio",
        file: "songs/song6.mp3",
        cover: "images/cover6.jpg"
    },
    {
        title: "Coffee & LoFi",
        artist: "Musicify Studio",
        file: "songs/song7.mp3",
        cover: "images/cover7.jpg"
    }
];

let currentSong = 0;
let isPlaying = false;
let shuffleMode = false;
let repeatMode = false;
let favorites = [];

/* Elements */

const audio = document.getElementById("audio");

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

const playlist = document.getElementById("playlist");

const searchInput = document.getElementById("search");
const searchMessage = document.getElementById("search-message");

const favoriteBtn = document.getElementById("favorite");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");

const lyricsContainer =
    document.getElementById("lyrics-container");

/* Load Song */

function loadSong(index){

    const song = songs[index];

    title.textContent = song.title;
    artist.textContent = song.artist;

    cover.src = song.cover;
    audio.src = song.file;

    if(favorites.includes(index)){

        favoriteBtn.classList.add("favorite-active");

        favoriteBtn.innerHTML =
            '<i class="fa-solid fa-heart"></i>';

    }else{

        favoriteBtn.classList.remove("favorite-active");

        favoriteBtn.innerHTML =
            '<i class="fa-regular fa-heart"></i>';
    }

    lyricsContainer.innerHTML = `
        <p class="lyric-line">🎵 Enjoy the music...</p>
        <p class="lyric-line">Relax and listen.</p>
        <p class="lyric-line">Musicify Premium Player.</p>
    `;

    updatePlaylistActive();
}

/* Playlist */

function createPlaylist(){

    playlist.innerHTML = "";

    songs.forEach((song,index)=>{

        const li = document.createElement("li");

        li.textContent = song.title;

        li.addEventListener("click",()=>{

            currentSong = index;

            loadSong(currentSong);

            playSong();

        });

        playlist.appendChild(li);

    });

}

/* Active Song */

function updatePlaylistActive(){

    const items =
        playlist.querySelectorAll("li");

    items.forEach(item =>
        item.classList.remove("active")
    );

    if(items[currentSong]){

        items[currentSong]
            .classList.add("active");

    }

}

/* Play Song */

function playSong(){

    audio.play();

    isPlaying = true;

    playBtn.innerHTML =
        '<i class="fa-solid fa-pause"></i>';

}

/* Pause Song */

function pauseSong(){

    audio.pause();

    isPlaying = false;

    playBtn.innerHTML =
        '<i class="fa-solid fa-play"></i>';

}

/* Play Button */

playBtn.addEventListener("click",()=>{

    if(isPlaying){

        pauseSong();

    }else{

        playSong();

    }

});

/* Next Song */

nextBtn.addEventListener("click",()=>{

    if(shuffleMode){

        currentSong =
            Math.floor(Math.random()*songs.length);

    }else{

        currentSong++;

        if(currentSong >= songs.length){

            currentSong = 0;

        }

    }

    loadSong(currentSong);

    playSong();

});

/* Previous Song */

prevBtn.addEventListener("click",()=>{

    currentSong--;

    if(currentSong < 0){

        currentSong =
            songs.length - 1;

    }

    loadSong(currentSong);

    playSong();

});

/* Progress */

audio.addEventListener("timeupdate",()=>{

    const progressPercent =
        (audio.currentTime /
        audio.duration) * 100;

    progress.value =
        progressPercent || 0;

    currentTimeEl.textContent =
        formatTime(audio.currentTime);

    durationEl.textContent =
        formatTime(audio.duration);

});

/* Seek */

progress.addEventListener("input",()=>{

    audio.currentTime =
        (progress.value / 100)
        * audio.duration;

});

/* Volume */

volume.addEventListener("input",()=>{

    audio.volume =
        volume.value / 100;

});

/* Favorite */

favoriteBtn.addEventListener("click",()=>{

    if(favorites.includes(currentSong)){

        favorites =
            favorites.filter(
                song => song !== currentSong
            );

        favoriteBtn.classList.remove(
            "favorite-active"
        );

        favoriteBtn.innerHTML =
            '<i class="fa-regular fa-heart"></i>';

    }else{

        favorites.push(currentSong);

        favoriteBtn.classList.add(
            "favorite-active"
        );

        favoriteBtn.innerHTML =
            '<i class="fa-solid fa-heart"></i>';

    }

});

/* Shuffle */

shuffleBtn.addEventListener("click", () => {

    shuffleMode = !shuffleMode;

    if(shuffleMode){
        repeatMode = false;
        repeatBtn.classList.remove("repeat-active");
    }

    shuffleBtn.classList.toggle("shuffle-active");



});

/* Repeat */

repeatBtn.addEventListener("click", () => {

    repeatMode = !repeatMode;

    if(repeatMode){
        shuffleMode = false;
        shuffleBtn.classList.remove("shuffle-active");
    }

    repeatBtn.classList.toggle("repeat-active");

});

/* Search */

searchInput.addEventListener("input",()=>{

    const searchValue =
        searchInput.value.toLowerCase();

    const items =
        playlist.querySelectorAll("li");

    let found = false;

    items.forEach(item=>{

        const songName =
            item.textContent.toLowerCase();

        if(songName.includes(searchValue)){

            item.style.display = "block";

            found = true;

        }else{

            item.style.display = "none";

        }

    });

    searchMessage.textContent =
        found ? "" : "No songs found";

});



/* Auto Next / Repeat */

audio.addEventListener("ended", () => {

    /* Repeat Current Song */

    if(repeatMode){

        audio.currentTime = 0;

        playSong();

        return;
    }

    /* Shuffle Random Song */

    if(shuffleMode){

        let randomSong;

        do{

            randomSong =
                Math.floor(
                    Math.random() * songs.length
                );

        }while(
            songs.length > 1 &&
            randomSong === currentSong
        );

        currentSong = randomSong;

    }
    else{

        currentSong++;

        if(currentSong >= songs.length){

            currentSong = 0;

        }

    }

    loadSong(currentSong);

    playSong();

});
    

/* Time Format */

function formatTime(time){

    if(isNaN(time))
        return "0:00";

    const minutes =
        Math.floor(time / 60);

    const seconds =
        Math.floor(time % 60);

    return `${minutes}:${seconds
        .toString()
        .padStart(2,"0")}`;

}

/* Initialize */

createPlaylist();
loadSong(currentSong);