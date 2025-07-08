document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundBuffers = {};
    let bgmSource = null;
    let isBgmPlaying = false;
    let userInteracted = false;

    // Function to resume AudioContext on user interaction
    const resumeAudioContext = () => {
        if (audioContext.state === 'suspended' && userInteracted) {
            audioContext.resume();
        }
        document.body.removeEventListener('click', resumeAudioContext);
        document.body.removeEventListener('keydown', resumeAudioContext);
    };

    document.body.addEventListener('click', () => { userInteracted = true; resumeAudioContext(); });
    document.body.addEventListener('keydown', () => { userInteracted = true; resumeAudioContext(); });

    // List of sound files to load
    const soundFiles = [
        'coin.mp3',
        'laser.mp3',
        'explosion.mp3',
        'jump.mp3',
        'powerup.mp3',
        'hit.mp3',
        'gameover.mp3',
        'background_music.mp3'
    ];

    const buttons = document.querySelectorAll('#sound-buttons button');
    buttons.forEach(button => button.disabled = true);
    const mainTitle = document.querySelector('h1');
    mainTitle.textContent = 'Loading Sounds...';

    // Function to fetch and decode audio data
    async function loadSound(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            soundBuffers[url] = audioBuffer;
        } catch (error) {
            console.error(`Error loading sound: ${url}`, error);
        }
    }

    // Preload all sounds
    Promise.all(soundFiles.map(loadSound)).then(() => {
        console.log('All sounds loaded');
        mainTitle.textContent = 'Common Game Sounds';
        buttons.forEach(button => {
            button.disabled = false;
        });
    });

    // Function to play a sound
    function playSound(url, loop = false) {
        if (!soundBuffers[url]) return null;

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        source.buffer = soundBuffers[url];
        source.connect(audioContext.destination);
        source.loop = loop;
        source.start(0);
        return source;
    }

    // Add event listeners to buttons
    buttons.forEach(button => {
        const soundUrl = button.dataset.sound;

        if (soundUrl === 'background_music.mp3') {
            button.addEventListener('click', () => {
                toggleBgm();
            });
        } else {
            button.addEventListener('click', () => {
                playSound(soundUrl);
            });
        }
    });

    function toggleBgm() {
        const bgmButton = document.getElementById('bgm-button');
        if (isBgmPlaying) {
            if (bgmSource) {
                bgmSource.stop();
                bgmSource.disconnect();
                bgmSource = null;
            }
            isBgmPlaying = false;
            bgmButton.textContent = 'Toggle BGM';
            bgmButton.classList.remove('playing');
        } else {
            bgmSource = playSound('background_music.mp3', true);
            isBgmPlaying = true;
            bgmButton.textContent = 'Stop BGM';
            bgmButton.classList.add('playing');
        }
    }
});

