console.log("JS loaded")

let currfolder;
let currentSong = new Audio()
let songs;

function formatTime(seconds) {
    // Ensure we are working with whole numbers
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder
    let a = await fetch(`${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    // console.log(as)

    songs = []
    for (let i = 0; i < as.length; i++) {
        const song = as[i];
        if (song.href.endsWith(".mp3")) {
            songs.push(song.href.split(`/${folder}/`)[1])
        }
    }
    let songsUL = document.querySelector(".lower-left-content").getElementsByTagName("ul")[0]
    songsUL.innerHTML = "" //clear the list
    //show all songs in a list
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li class="flex">
                            <img class="color-invert" src="img/music.svg" alt="No Img">
                            <div class="info">
                                <div class="songname">${song.replaceAll('%20', ' ')}</div>
                                <div class="songartist">Chardikalah</div>
                            </div>
                            <div class="playnow flex">
                                <span>Play Now!</span>
                                <img class="color-invert" src="img/playbutton.svg" alt="No Img">
                            </div></li>`
    }

    Array.from(document.querySelector(".lower-left-content").getElementsByTagName("li")).forEach(e => {
        // console.log(e.querySelector(".info"))
        e.addEventListener("click", () => {
            // console.log(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML.replaceAll('%20', ' '))
            playMusic(e.querySelector(".info").getElementsByTagName("div")[0].innerHTML.replaceAll('%20', ' '))
        })

    })
}

//function to get all the albums
async function displayAlbums() {
    let a = await fetch(`songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".songsalbum")
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs/")) {
            let foldername = e.href.split("/songs/")[1].split("/")[0]
            // console.log(foldername)
            //get metadata of the folder
            let a = await fetch(`songs/${foldername}/info.json`)
            let response = await a.json()
            // console.log(response)

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${foldername}" class="card white">
                    <img src="/songs/${foldername}/cover.jpeg" alt="No image">
                    <button class="play-button"><img src="img/playbutton.svg" alt=""></button>
                    <div class="title">${response.title}</div>
                    <div class="artist">${response.artist}</div>
                </div>`
        }
    }

    //getting songs from diffrent folders
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e.currentTarget)
        e.addEventListener("click", async (item) => {
            console.log(item.currentTarget.dataset)
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]) //play the first song by default
        })
    })
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/${track}`
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll('%20', ' ')
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main() {
    //gets songs from the file
    await getSongs("songs/one")
    playMusic(songs[0], true) //play the first song by default
    // console.log(songs) //debug statement 

    //display all the albums
    displayAlbums()

    //play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/playbutton.svg"
        }
    })

    //next and previous buttons
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/songs/")[1])
        if (currentIndex == songs.length - 1) {
            currentIndex = currentIndex - 1
        }
        playMusic(songs[currentIndex + 1])
    })
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/songs/")[1])
        if (currentIndex == 0) {
            currentIndex = songs.length
        }
        playMusic(songs[currentIndex - 1])
    })

    //update the song time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`
    })

    //seekbar click event
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.offsetX/e.target.getBoundingClientRect().width * 100)
        let percent = (e.offsetX / e.target.getBoundingClientRect().width)
        document.querySelector(".circle").style.left = percent * 100 + "%";
        currentSong.currentTime = percent * currentSong.duration
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0';
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-100%';
    })

    //to show the left div in big screens
    window.addEventListener('resize', function () {

        if (window.innerWidth > 1350) {
            document.querySelector(".left").style.left = '0'; // or left: 0, whatever you use
        } else {
            document.querySelector(".left").style.left = '-100%'; // or left: -100%, whatever you use
        }
    });

    //volume chnange
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        console.log(document.querySelector(".volume img").src)
        if(parseInt(e.target.value) > 0){
            document.querySelector(".volume img").src = "img/volume.svg"
        }
        else{
            document.querySelector(".volume img").src = "img/mute.svg"
        }
    });

    //volume mute event listner
    document.querySelector(".volume img").addEventListener("click", (e) => {
        // console.log(e.target.src)
        if (currentSong.volume > 0) {
            e.target.src = e.target.src.replace("img/volume.svg",  "img/mute.svg")
            currentSong.volume = 0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = 1
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 100
        }
    })

}

main()