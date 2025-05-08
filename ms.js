// ລາຍການເພງ
let songs = [
    {
        title: "ເນາະຄົນງາມ",
        artist: "T'nakha",
        album: "",
        cover: "pic/ເນາະຄົນງາມ.png",
        src: "ms/ເນາະຄົນງາມ เนาะคนงาม - T_nakha.mp3",
        duration: "4:15",
        playCount: 0
    },{
        title: "bellaມ",
        artist: "T'nakha",
        album: "",
        cover: "pic/ເນາະຄົນງາມ.png",
        src: "ms/Bella Ciao - La Casa De Papel (CrazyDaniel Remix).mp3",
        duration: "4:15",
        playCount: 0
    },{
        title: "ດຶງຂື້ນໄປ",
        artist: "T'nakha",
        album: "",
        cover: "pic/ດຶງຂື້ນໄປ.png",
        src: "ms/ດຶງຂື້ນໄປ ดึงขึ้นไป - T.tao X Tnakha [ GT L.A.O ].mp3",
        duration: "4:15",
        playCount: 0
    },
    {
        title: "ພຽງຄົນບ້ານນອກ",
        artist: "T'nakha",
        album: "",
        cover: "pic/ພຽງຄົນບ້ານນອກ.png",
        src: "ms/ພຽງຄົນບ້ານນອກ แค่คนบ้านนอก - T_nakha.mp3",
        duration: "4:22",
        playCount: 0
    }
];

// ระบบ Audio ที่ดีขึ้นสำหรับเล่นเมื่อหน้าจอดับ
let audioContext;
let audioElement = document.getElementById('audio-player');
let audioSource;
let isAudioContextStarted = false;

// เริ่มต้น Audio Context
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioElement = document.getElementById('audio-player');
        
        // สร้าง MediaElementSource เพื่อเชื่อมกับ AudioContext
        audioSource = audioContext.createMediaElementSource(audioElement);
        audioSource.connect(audioContext.destination);
        
        console.log("AudioContext initialized successfully");
    } catch (error) {
        console.error("Error initializing AudioContext:", error);
    }
}

// เรียกใช้เมื่อผู้ใช้มี interaction ครั้งแรก
function startAudioContext() {
    if (!isAudioContextStarted && audioContext) {
        // Resume the audio context
        audioContext.resume().then(() => {
            console.log('AudioContext resumed successfully');
            isAudioContextStarted = true;
        }).catch(error => {
            console.error('Error resuming AudioContext:', error);
        });
    }
}

// ໂຫລດຂໍ້ມູນການຫລິ້ນຈາກ localStorage ຖ້າມີ
function loadPlayCounts() {
    const savedPlayCounts = localStorage.getItem('songPlayCounts');
    if (savedPlayCounts) {
        const playCounts = JSON.parse(savedPlayCounts);
        songs = songs.map(song => {
            const savedSong = playCounts.find(s => s.src === song.src);
            return savedSong ? {...song, playCount: savedSong.playCount} : song;
        });
    }
}

// ບັນທຶກຂໍ້ມູນການຫລິ້ນລົງ localStorage
function savePlayCounts() {
    const playCounts = songs.map(song => ({
        src: song.src,
        playCount: song.playCount
    }));
    localStorage.setItem('songPlayCounts', JSON.stringify(playCounts));
}

// ຈັດລຽງລຳດັບເພງຕາມຈຳນວນຄັ້ງທີ່ຫລິ້ນ (ຫລາຍໄປຫນ້ອຍ)
function sortSongsByPlayCount() {
    songs.sort((a, b) => b.playCount - a.playCount);
}

// ຕົວແປສຳຄັນ
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const progress = document.getElementById('progress');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const playlistElement = document.getElementById('playlist');
const searchInput = document.getElementById('search-input');
const speedBtn = document.getElementById('speed-btn');
const speedOptions = document.getElementById('speed-options');

// ຂໍ້ມູນເພງປະຈຸບັນ
const currentCover = document.getElementById('current-cover');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const currentAlbum = document.getElementById('current-album');

let currentSongIndex = 0;
let isPlaying = false;
let filteredSongs = [];

// ໂຫລດຂໍ້ມູນການຫລິ້ນເມື່ອເລີ່ມຕົ້ນ
loadPlayCounts();
sortSongsByPlayCount();
initAudio(); // เริ่มต้น Audio Context

// เพิ่ม Media Session สำหรับควบคุมจาก notification
function setupMediaSession(song) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album,
            artwork: [
                { src: song.cover, sizes: '96x96', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
            playPause();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            playPause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            prevSong();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            nextSong();
        });
    }
}

// ອັບເດດສະຖານະປຸ່ມ play/pause
function updatePlayButton() {
    if (isPlaying) {
        playIcon.classList.remove('active');
        pauseIcon.classList.add('active');
    } else {
        playIcon.classList.add('active');
        pauseIcon.classList.remove('active');
    }
}

// ສ້າງ playlist
function createPlaylist(songsToDisplay = songs) {
    playlistElement.innerHTML = '';
    
    if (songsToDisplay.length === 0) {
        playlistElement.innerHTML = '<div class="no-results">ບໍ່ພົບເພງທີ່ກົງກັບການຄົ້ນຫາ</div>';
        return;
    }
    
    songsToDisplay.forEach((song, index) => {
        const songElement = document.createElement('div');
        songElement.className = 'song';
        
        const isActive = songs[currentSongIndex] && song.src === songs[currentSongIndex].src && isPlaying;
        
        if (isActive) {
            songElement.classList.add('active');
        }
        
        songElement.innerHTML = `
            <img class="song-cover" src="${song.cover}" alt="${song.title}">
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-duration">${song.duration}</div>
        `;
        
        songElement.addEventListener('click', () => {
            playSongFromList(index, songsToDisplay);
        });
        
        playlistElement.appendChild(songElement);
    });
}

// ຫລິ້ນເພງຈາກລາຍການ
function playSongFromList(index, songList) {
    const song = songList[index];
    const mainIndex = songs.findIndex(s => s.src === song.src);
    
    if (mainIndex !== -1) {
        currentSongIndex = mainIndex;
        playSong(currentSongIndex);
    }
}

// ຫລິ້ນເພງ
function playSong(index) {
    const songToPlay = songs[index];
    
    if (!songToPlay) return;
    
    // ເພີ່ມຈຳນວນຄັ້ງທີ່ຫລິ້ນ
    songToPlay.playCount = (songToPlay.playCount || 0) + 1;
    
    savePlayCounts();
    sortSongsByPlayCount();
    
    // ອັບເດດຂໍ້ມູນເພງປະຈຸບັນ
    currentCover.src = songToPlay.cover;
    currentTitle.textContent = songToPlay.title;
    currentArtist.textContent = songToPlay.artist;
    currentAlbum.textContent = songToPlay.album;
    durationDisplay.textContent = songToPlay.duration;
    
    // ตั้งค่า Media Session
    setupMediaSession(songToPlay);
    
    // ຕັ້ງຄ່າເພງ
    audioPlayer.src = songToPlay.src;
    
    // เริ่มเล่นเพลง
    const playPromise = audioPlayer.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            updatePlayButton();
            createPlaylist(filteredSongs.length > 0 ? filteredSongs : songs);
            
            // เริ่ม Audio Context ถ้ายังไม่เริ่ม
            startAudioContext();
        })
        .catch(error => {
            console.error('Error playing song:', error);
            
            // ในกรณีที่เล่นไม่ได้เนื่องจากนโยบาย autoplay
            // ให้แสดงปุ่มให้ผู้ใช้กดเล่นเอง
            isPlaying = false;
            updatePlayButton();
        });
    }
}

// ປ່ຽນສະຖານະຫລິ້ນ/ຢຸດ
function playPause() {
    if (audioPlayer.src === '') {
        playSong(0);
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                startAudioContext(); // เริ่ม Audio Context เมื่อผู้ใช้กดเล่น
            })
            .catch(error => {
                console.error('Error playing song:', error);
            });
        }
    }
    
    updatePlayButton();
    createPlaylist(filteredSongs.length > 0 ? filteredSongs : songs);
}

// ເພງກ່ອນໜ້າ
function prevSong() {
    if (filteredSongs.length > 0) {
        const currentSong = songs[currentSongIndex];
        const currentFilteredIndex = filteredSongs.findIndex(s => s.src === currentSong.src);
        const prevFilteredIndex = (currentFilteredIndex - 1 + filteredSongs.length) % filteredSongs.length;
        playSongFromList(prevFilteredIndex, filteredSongs);
    } else {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    }
}

// ເພງຖັດໄປ
function nextSong() {
    if (filteredSongs.length > 0) {
        const currentSong = songs[currentSongIndex];
        const currentFilteredIndex = filteredSongs.findIndex(s => s.src === currentSong.src);
        const nextFilteredIndex = (currentFilteredIndex + 1) % filteredSongs.length;
        playSongFromList(nextFilteredIndex, filteredSongs);
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    }
}

// ເປີດ/ປິດຕົວເລືອກຄວາມໄວ
function toggleSpeedOptions() {
    speedOptions.style.display = speedOptions.style.display === 'block' ? 'none' : 'block';
}

// ຕັ້ງຄ່າຄວາມໄວໃນການຫລິ້ນ
function setPlaybackSpeed(speed) {
    audioPlayer.playbackRate = speed;
    speedOptions.style.display = 'none';
    
    const notification = document.createElement('div');
    notification.textContent = `ຕັ້ງຄ່າຄວາມໄວຫລິ້ນເປັນ ${speed}x`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#333';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}

// ຄົ້ນຫາເພງ
function searchSongs() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === '') {
        filteredSongs = [];
        createPlaylist(songs);
        return;
    }
    
    filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm) || 
        song.artist.toLowerCase().includes(searchTerm) ||
        (song.album && song.album.toLowerCase().includes(searchTerm))
    );
    
    createPlaylist(filteredSongs);
}

// ອັບເດດແຖບຄວາມຄືບໜ້າ
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    currentTimeDisplay.textContent = formatTime(currentTime);
    
    if (durationDisplay.textContent === '00:00' && !isNaN(duration)) {
        durationDisplay.textContent = formatTime(duration);
    }
}

// ໄປຍັງຕຳແໜ່ງທີ່ຄລິກ
function seek(event) {
    const progressBar = event.currentTarget;
    const clickPosition = event.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const seekTime = (clickPosition / progressBarWidth) * audioPlayer.duration;
    
    audioPlayer.currentTime = seekTime;
}

// ຈັດຮູບແບບເວລາ
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ປິດເມນູຄວາມໄວເມື່ອຄລິກທີ່ອື່ນ
document.addEventListener('click', function(event) {
    if (!event.target.closest('.speed-container')) {
        speedOptions.style.display = 'none';
    }
});

// Event listeners
document.addEventListener('click', startAudioContext); // เริ่ม Audio Context เมื่อมี interaction
document.addEventListener('keydown', startAudioContext); // เริ่ม Audio Context เมื่อมี interaction

audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', nextSong);
audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButton();
    createPlaylist(filteredSongs.length > 0 ? filteredSongs : songs);
});
audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButton();
    createPlaylist(filteredSongs.length > 0 ? filteredSongs : songs);
});
searchInput.addEventListener('input', searchSongs);

// ເລີ່ມຕົ້ນ
createPlaylist(songs);
updatePlayButton();

// ໂຫລດຂໍ້ມູນເພງທຳອິດ
if (songs.length > 0) {
    const initialSong = songs[0];
    currentCover.src = initialSong.cover;
    currentTitle.textContent = initialSong.title;
    currentArtist.textContent = initialSong.artist;
    currentAlbum.textContent = initialSong.album;
    durationDisplay.textContent = initialSong.duration;
}
