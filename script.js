const progBar = document.querySelector("#progress-bar");
const coverImg = document.querySelector("#cover-image");
const trackTitle = document.querySelector("#track-title");
const trackArtist = document.querySelector("#track-artist");
const currentTime = document.querySelector("#current-time");
const duration = document.querySelector("#duration");
const shuffleButton = document.querySelector("#shuffle-button");
const previousButton = document.querySelector("#previous-button");
const playButton = document.querySelector("#play-button");
const nextButton = document.querySelector("#next-button");
const repeatButton = document.querySelector("#repeat-button");
const volumeBar = document.querySelector("#volume-bar");
const volumeValue = document.querySelector("#volume-value");
const trackCount = document.querySelector("#track-count");
const playlist = document.querySelector("#playlist");
const audioPlayer = document.querySelector("#audio-player");

const savedVolume = localStorage.getItem("nightwave-volume");
const savedTrackIndex = localStorage.getItem("nightwave-track");

if (savedVolume !== null) {
    volumeBar.value = savedVolume;
    volumeValue.textContent = `${savedVolume}%`;
}


const tracks = [
    {
        title: "midnight-tide.",
        artist: "Nightwave Demo",
        src: "music/midnight-tide.mp3",
        cover: "covers/midnight-tide.webp"
    },

    {
        title: "rainline",
        artist: "Nightwave Demo",
        src: "music/rainline.mp3",
        cover: "covers/rainline.webp",
    }
]


let currentTrackIndex = 0;

if (savedTrackIndex !== null) {
    currentTrackIndex = Number(savedTrackIndex);
}

function loadTrack() {
    const currentTrack = tracks[currentTrackIndex];
    // audioPlayer уже найден в querySelector поэтому писать const не надо 
    audioPlayer.src = currentTrack.src;
    coverImg.src = currentTrack.cover;

    trackTitle.textContent = currentTrack.title;
    trackArtist.textContent = currentTrack.artist;

    progBar.value = 0;
    currentTime.textContent = formatTime(0);

    updateActiveTrack();

    localStorage.setItem("nightwave-track", currentTrackIndex);
}

function renderPlayList() {
    playlist.innerHTML = "";

    trackCount.textContent = `${tracks.length} треков`;

    tracks.forEach((track, index) => {    
        const item = document.createElement("li");
        item.classList.add("playlist-item");

        item.addEventListener("click", () => {
            const wasPlaying = !audioPlayer.paused;
            
            currentTrackIndex = index;

            loadTrack();

            if (wasPlaying) {
                audioPlayer.play();
            }
        });

        const photo = document.createElement("img");
        photo.classList.add("playlist-cover");
        photo.src = track.cover;
        item.appendChild(photo);

        const info = document.createElement("div");
        info.classList.add("playlist-info");
        item.appendChild(info);
        
        const titleText = document.createElement("span");
        titleText.classList.add("playlist-item-title");
        titleText.textContent = track.title;
        info.appendChild(titleText);

        const itemArtist = document.createElement("span");
        itemArtist.classList.add("playlist-item-artist");
        itemArtist.textContent = track.artist;
        info.appendChild(itemArtist);
        playlist.appendChild(item);
    });

}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = Math.floor(seconds % 60);

    const formattedSeconds = String(secondsLeft).padStart(2, "0");
    
    return `${minutes}:${formattedSeconds}`;
}

function updateActiveTrack() {
    const playlistItems = document.querySelectorAll(".playlist-item");

    playlistItems.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add("is-current");
        } else {
            item.classList.remove("is-current");
        }
    });
}

playButton.addEventListener("click", () => {
    if (audioPlayer.paused === true) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
});

audioPlayer.addEventListener("timeupdate", () => {
    currentTime.textContent = formatTime(audioPlayer.currentTime);

    // Пока длительность трека не загрузилась, сбрасываем ползунок и пропускаем расчёт.
    if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) {
        progBar.value = 0;
        return;
    }

    const percent = audioPlayer.currentTime / audioPlayer.duration * 100;

    progBar.value = percent;
});

audioPlayer.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("play", () => {
    playButton.textContent = "⏸";
});

audioPlayer.addEventListener("pause", () => {
    playButton.textContent = "▶";
});


progBar.addEventListener("input", () => {
    const newTime = progBar.value / 100 * audioPlayer.duration;

    audioPlayer.currentTime = newTime;
});

volumeBar.addEventListener("input", () => {
    const newVolume = volumeBar.value / 100;
    
    audioPlayer.volume = newVolume
    
    volumeValue.textContent = `${volumeBar.value}%`;

    localStorage.setItem("nightwave-volume", volumeBar.value);
});

nextButton.addEventListener("click", () => {
    const wasPlaying = !audioPlayer.paused; // ! означает логическое Не: меняет true на false а false на true
    
    currentTrackIndex += 1;

    if (currentTrackIndex >= tracks.length) {
        currentTrackIndex = 0;

    }

    loadTrack();

    if (wasPlaying) {
        audioPlayer.play();
    }
});

previousButton.addEventListener("click", () => {
    const wasPlaying = !audioPlayer.paused;

    currentTrackIndex -= 1;

    if (currentTrackIndex < 0) {
        currentTrackIndex = tracks.length - 1;
    }

    loadTrack();

    if (wasPlaying) {
        audioPlayer.play();
    }
});


repeatButton.addEventListener("click", () => {
    audioPlayer.loop = !audioPlayer.loop;

    if (audioPlayer.loop) {
        repeatButton.classList.add("is-active");
    } else {
        repeatButton.classList.remove("is-active");
    }
});

audioPlayer.addEventListener("ended", () => {
    nextButton.click();
    audioPlayer.play();
   
});

shuffleButton.addEventListener("click", () => {
    const wasPlaying = !audioPlayer.paused;
    const previousTrackIndex = currentTrackIndex;

    do {
        currentTrackIndex = Math.floor(Math.random() * tracks.length);
    } while (currentTrackIndex === previousTrackIndex);
    
    loadTrack();

    if (wasPlaying) {
        audioPlayer.play();
    }
});

renderPlayList();
loadTrack();

audioPlayer.volume = volumeBar.value / 100;