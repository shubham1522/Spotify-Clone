console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    if (songs.length === 0) {
        songUL.innerHTML = `<li class="no-songs">No songs found. Add MP3 files!</li>`;
    } else {
        for (const song of songs) {
            songUL.innerHTML += `<li><img class="invert" width="28" src="img/music.svg" alt="">
                                <div class="info">
                                    <div> ${song.replaceAll("%20", " ")}</div>
                                    <div>Artist</div>
                                </div>
                                <div class="playnow">
                                    <img class="invert" src="img/play.svg" alt="Play Now">
                                </div> </li>`;
        }
        Array.from(songUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`/songs.json`);
    let response = await a.json();
    let spotifyPlaylists = document.querySelector(".spotifyPlaylists");
    
    let playlistsSection = document.createElement('div');
    playlistsSection.className = 'playlist-section';
    playlistsSection.innerHTML = `<h2>Spotify Playlists</h2><div class="cardContainer"></div>`;
    spotifyPlaylists.appendChild(playlistsSection);
    let cardContainer = playlistsSection.querySelector(".cardContainer");
    for (const album of response.albums) {
        cardContainer.innerHTML += ` <div data-folder="songs/${album.folder}" class="card">
            <div class="play"><svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/></svg></div>
            <img src="/songs/${album.folder}/cover.jpg" alt="">
            <h4>${album.title}</h4>
            <p>${album.description}</p>
        </div>`;
    }

    let artistsSection = document.createElement('div');
    artistsSection.className = 'playlist-section';
    artistsSection.innerHTML = `<h2>Popular Artists</h2><div class="cardContainer"></div>`;
    spotifyPlaylists.appendChild(artistsSection);
    let artistCardContainer = artistsSection.querySelector(".cardContainer");
    for (const artist of response.artists) {
        artistCardContainer.innerHTML += ` <div data-folder="songs/${artist.folder}" class="card artist-card">
            <img src="/songs/${artist.folder}/cover.jpg" class="artist-img" alt="${artist.name}">
            <h4>${artist.name}</h4>
            <p>Artist</p>
        </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            songs = await getSongs(folder);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {
    await getSongs("songs/ncs");
    if (songs && songs.length > 0) {
        playMusic(songs[0], true);
    }
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });
}

main();

// Modal and Search Logic
const loginModal = document.getElementById("loginModal");
const loginBtn = document.querySelector(".loginbtn");
const closeBtn = document.querySelector(".close-btn");
loginBtn.onclick = () => { loginModal.style.display = "block"; }
closeBtn.onclick = () => { loginModal.style.display = "none"; }

const signupModal = document.getElementById("signupModal");
const signupBtn = document.querySelector(".signupbtn");
const closeSignupBtn = document.querySelector(".close-signup-btn");
signupBtn.onclick = () => { signupModal.style.display = "block"; }
closeSignupBtn.onclick = () => { signupModal.style.display = "none"; }

window.onclick = (event) => {
    if (event.target == loginModal) { loginModal.style.display = "none"; }
    if (event.target == signupModal) { signupModal.style.display = "none"; }
}

document.getElementById("searchInput").addEventListener("keyup", function() {
    let filter = this.value.toUpperCase();
    document.querySelectorAll(".cardContainer .card").forEach(card => {
        let title = card.querySelector("h4");
        if (title && title.innerHTML.toUpperCase().indexOf(filter) > -1) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
});