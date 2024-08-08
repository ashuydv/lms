console.log('Speak English script loaded');

let currentModule = 0;
let currentLesson = 0;
let isInLessonView = false;

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    fetchModules();
});

async function fetchModules() {
    try {
        console.log('Fetching modules...');
        const response = await fetch('../data/speak-english-modules.json');
        const data = await response.json();
        console.log('Modules data:', data);
        localStorage.setItem('modules', JSON.stringify(data.modules));
        renderModules(data.modules);

        // Only load the first lesson automatically on desktop
        if (window.innerWidth >= 768 && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
            loadLesson(0, 0);
        }
    } catch (error) {
        console.error('Error fetching modules:', error);
    }
}

function renderModules(modules) {
    console.log('Rendering modules:', modules);

    const modulesContainer = document.getElementById('modules-container');

    if (!modulesContainer) {
        console.error('Error: modules-container element not found.');
        return;
    }

    modulesContainer.innerHTML = ''; // Clear existing content

    modules.forEach((module, moduleIndex) => {
        const moduleElement = document.createElement('div');
        moduleElement.className = 'bg-white rounded-lg border-2 border-black shadow mb-4';
        moduleElement.innerHTML = `
            <button class="accordion-header w-full rounded-xl text-left p-4 font-semibold flex justify-between items-start">
                <div class="flex items-start w-full flex-col">
                    <span class="text-md">Module ${module.sr_no}</span>   
                    <span class="text-lg">${module.title}</span>
                    <span class="text-sm text-gray-500">${module.lessons.length} Lessons</span>
                </div>
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <ul class="p-4 space-y-2">
                    ${module.lessons.map((lesson, lessonIndex) => `
                        <li class="flex items-center cursor-pointer p-2 hover:bg-gray-100 rounded" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
                            <div class="flex items-start flex-col w-full">
                                <div>
                                    <span class="mr-2 text-sm font-semibold text-gray-500">${lesson.sr_no}.</span>
                                    <i class="fa-solid fa-play mr-2 text-sm text-black"></i>
                                    <span class="flex-grow font-semibold">${lesson.title}</span>
                                </div>
                                <span class="text-xs text-gray-500 pl-5 font-medium">video &bull; ${lesson.duration || '00m 00s'}</span>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        moduleElement.querySelector('.accordion-header').addEventListener('click', function () {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });

        modulesContainer.appendChild(moduleElement);
    });

    // Add event listeners to lesson items
    document.querySelectorAll('#modules-container li').forEach(item => {
        item.addEventListener('click', function () {
            const moduleIndex = parseInt(this.dataset.module);
            const lessonIndex = parseInt(this.dataset.lesson);
            loadLesson(moduleIndex, lessonIndex);
        });
    });

    // Make sure the modules list is visible on mobile
    document.getElementById('modules-list').classList.remove('hidden');
    document.getElementById('mobile-lesson-view').classList.add('hidden');
}

function loadLesson(moduleIndex, lessonIndex) {
    isInLessonView = true;
    currentModule = moduleIndex;
    currentLesson = lessonIndex;

    const modulesString = localStorage.getItem('modules');
    if (!modulesString) {
        console.error('No modules data found in localStorage');
        return;
    }

    const modules = JSON.parse(modulesString);
    if (!modules || !modules[moduleIndex] || !modules[moduleIndex].lessons[lessonIndex]) {
        console.error('Invalid module or lesson index');
        return;
    }

    const lesson = modules[moduleIndex].lessons[lessonIndex];

    // Update desktop view
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-title').style.marginBottom = "20px";
    document.getElementById('lesson-content').innerHTML = `
        <div class="rounded-lg my-4">
            <div id="desktop-video-container"></div>
        </div>
    `;
    const desktopVideoPlayer = document.createElement('video');
    desktopVideoPlayer.className = 'w-full h-full border-2 border-black rounded-2xl overflow-hidden';
    desktopVideoPlayer.innerHTML = `<source src='${lesson.video}' type="video/mp4"/>`;
    const desktopVideoContainer = createCustomVideoControls(desktopVideoPlayer);
    document.getElementById('desktop-video-container').appendChild(desktopVideoContainer);

    document.getElementById('lesson-info').textContent = lesson.info;

    // Update mobile view
    const mobileLessonView = document.getElementById('mobile-lesson-view');
    mobileLessonView.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-2xl font-bold mb-4">${lesson.title}</h2>
            <div class="rounded-lg my-4">
                <div id="mobile-video-container"></div>
            </div>
            <div class="flex border-b mb-4">
                <button class="py-2 px-4 border-b-2 border-blue-500 text-black font-medium" id="mobile-lesson-info-tab">Lesson Info</button>
                <button class="py-2 px-4 font-medium" id="mobile-resources-tab">Resources</button>
            </div>
            <div id="mobile-lesson-info" class="mt-4">${lesson.info}</div>
            <div id="mobile-lesson-resources" class="mt-4 hidden"></div>
        </div>
        <div class="flex justify-between mt-4">
            <button id="mobile-prev-lesson" class="bg-blue-500 text-white px-4 py-2 rounded">Previous</button>
            <button id="mobile-next-lesson" class="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        </div>
    `;
    const mobileVideoPlayer = document.createElement('video');
    mobileVideoPlayer.className = 'w-full h-full border-2 border-black overflow-hidden rounded-2xl';
    mobileVideoPlayer.innerHTML = `<source src='${lesson.video}' type="video/mp4"/>`;
    const mobileVideoContainer = createCustomVideoControls(mobileVideoPlayer);
    document.getElementById('mobile-video-container').appendChild(mobileVideoContainer);

    const resourcesList = document.getElementById('lesson-resources');
    const mobileResourcesList = document.getElementById('mobile-lesson-resources');
    resourcesList.innerHTML = '';
    mobileResourcesList.innerHTML = '';

    lesson.resources.forEach(resource => {
        if (resource.type === 'pdf') {
            const pdfLink = document.createElement('a');
            pdfLink.href = resource.url;
            pdfLink.className = "pdf bg-black text-white rounded-md px-4 py-2 inline-block mb-2";
            pdfLink.innerHTML = `
                <i class="fa-regular fa-file-pdf"></i>
                ${resource.title}
            `;
            pdfLink.download = '';
            resourcesList.appendChild(pdfLink.cloneNode(true));
            mobileResourcesList.appendChild(pdfLink);
        } else if (resource.type === 'text') {
            const resourceItem = document.createElement('div');
            resourceItem.className = "mb-2";
            resourceItem.textContent = resource.title;
            resourcesList.appendChild(resourceItem.cloneNode(true));
            mobileResourcesList.appendChild(resourceItem);
        }
    });

    // Show lesson view on mobile
    if (window.innerWidth < 768) {
        document.getElementById('modules-list').classList.remove('hidden');
        document.getElementById('mobile-lesson-view').classList.add('hidden');
    }

    // Add event listeners for mobile tabs
    document.getElementById('mobile-lesson-info-tab').addEventListener('click', function () {
        this.classList.add('border-b-2', 'border-blue-500', 'text-black');
        document.getElementById('mobile-resources-tab').classList.remove('border-b-2', 'border-blue-500', 'text-black');
        document.getElementById('mobile-lesson-info').classList.remove('hidden');
        document.getElementById('mobile-lesson-resources').classList.add('hidden');
    });

    document.getElementById('mobile-resources-tab').addEventListener('click', function () {
        this.classList.add('border-b-2', 'border-blue-500', 'text-black');
        document.getElementById('mobile-lesson-info-tab').classList.remove('border-b-2', 'border-blue-500', 'text-black');
        document.getElementById('mobile-lesson-resources').classList.remove('hidden');
        document.getElementById('mobile-lesson-info').classList.add('hidden');
    });

    document.getElementById('mobile-prev-lesson').addEventListener('click', () => navigateLesson(-1));
    document.getElementById('mobile-next-lesson').addEventListener('click', () => navigateLesson(1));
}

// Tab switching
document.getElementById('lesson-info-tab').addEventListener('click', function () {
    this.classList.add('border-b-2', 'border-blue-500', 'text-black');
    document.getElementById('resources-tab').classList.remove('border-b-2', 'border-blue-500', 'text-black');
    document.getElementById('lesson-info').classList.remove('hidden');
    document.getElementById('lesson-resources').classList.add('hidden');
});

document.getElementById('resources-tab').addEventListener('click', function () {
    this.classList.add('border-b-2', 'border-blue-500', 'text-black');
    document.getElementById('lesson-info-tab').classList.remove('border-b-2', 'border-blue-500', 'text-black');
    document.getElementById('lesson-resources').classList.remove('hidden');
    document.getElementById('lesson-info').classList.add('hidden');
});

// Navigation buttons
document.getElementById('prev-lesson').addEventListener('click', () => navigateLesson(-1));
document.getElementById('next-lesson').addEventListener('click', () => navigateLesson(1));

function navigateLesson(direction) {
    const modulesString = localStorage.getItem('modules');
    if (!modulesString) {
        console.error('No modules data found in localStorage');
        return;
    }
    const modules = JSON.parse(modulesString);

    let newModule = currentModule;
    let newLesson = currentLesson + direction;

    if (newLesson < 0) {
        newModule--;
        if (newModule >= 0) {
            newLesson = modules[newModule].lessons.length - 1;
        } else {
            return; // At the beginning, can't go back
        }
    } else if (newLesson >= modules[currentModule].lessons.length) {
        newModule++;
        if (newModule < modules.length) {
            newLesson = 0;
        } else {
            return; // At the end, can't go forward
        }
    }

    loadLesson(newModule, newLesson);
}

function showModulesList() {
    isInLessonView = false;
    document.getElementById('modules-list').classList.remove('hidden');
    document.getElementById('mobile-lesson-view').classList.add('hidden');
}

// Add event listener for the back button in the header
document.querySelector('header a').addEventListener('click', function (e) {
    if (window.innerWidth < 768 && isInLessonView) {  // Only for mobile view and when in a lesson
        e.preventDefault();
        showModulesList();
    }
    // If not in lesson view or not on mobile, the default behavior (going back to index) will occur
});

document.getElementById('back-button').addEventListener('click', function (e) {
    e.preventDefault();
    if (isInLessonView) {
        showModulesList();
    } else {
        window.location.href = '../index.html';
    }
});

function createCustomVideoControls(videoElement) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container relative overflow-hidden';

    const watermark = document.createElement('div');
    watermark.className = 'watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl opacity-50 pointer-events-none select-none';
    watermark.textContent = 'aleenarais';

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'custom-video-controls flex items-center justify-between bg-gray-800 rounded-b-2xl bg-opacity-10 text-white px-8 py-4 backdrop-filter backdrop-blur-xl absolute w-full overflow-hidden bottom-0';

    const playPauseBtn = document.createElement('button');
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.className = 'play-pause-btn';

    const progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;
    progressBar.className = 'progress-bar transition w-full mx-4';

    const timeDisplay = document.createElement('span');
    timeDisplay.className = 'time-display w-24';
    timeDisplay.textContent = '0:00 / 0:00';

    // Add fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fullscreenBtn.className = 'fullscreen-btn ml-4';

    controlsContainer.appendChild(playPauseBtn);
    controlsContainer.appendChild(progressBar);
    controlsContainer.appendChild(timeDisplay);
    controlsContainer.appendChild(fullscreenBtn);

    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(watermark);
    videoContainer.appendChild(controlsContainer);

    playPauseBtn.addEventListener('click', () => {
        if (videoElement.paused) {
            videoElement.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            videoElement.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    progressBar.addEventListener('input', () => {
        const time = videoElement.duration * (progressBar.value / 100);
        videoElement.currentTime = time;
    });

    videoElement.addEventListener('timeupdate', () => {
        const value = (100 / videoElement.duration) * videoElement.currentTime;
        progressBar.value = value;
        const currentMinutes = Math.floor(videoElement.currentTime / 60);
        const currentSeconds = Math.floor(videoElement.currentTime % 60);
        const durationMinutes = Math.floor(videoElement.duration / 60);
        const durationSeconds = Math.floor(videoElement.duration % 60);
        timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    });

    // Add event listener for video end
    videoElement.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.mozRequestFullScreen) { // Firefox
                videoContainer.mozRequestFullScreen();
            } else if (videoContainer.webkitRequestFullscreen) { // Chrome, Safari and Opera
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) { // IE/Edge
                videoContainer.msRequestFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });

    // Prevent right-click
    videoContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        alert('not allowed.');
    });

    // Disable print screen key
    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
            alert('Screenshots are not allowed!');
        }
    });

    // Blur video when window loses focus
    window.addEventListener('blur', () => {
        videoElement.style.filter = 'blur(20px)';
    });

    window.addEventListener('focus', () => {
        videoElement.style.filter = 'none';
    });

    // Detect fullscreen change
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            videoElement.style.filter = 'blur(20px)';
            setTimeout(() => { videoElement.style.filter = 'none'; }, 500);
        }
    });

    return videoContainer;
}

// Add any additional functions or event listeners here if needed

// Example of how you might add a function to update the watermark text
function updateWatermark(text) {
    const watermarks = document.querySelectorAll('.watermark');
    watermarks.forEach(watermark => {
        watermark.textContent = text;
    });
}

// You can call this function to update the watermark text
// updateWatermark('New Watermark Text');

// Example of how you might add a function to toggle video protection
let protectionEnabled = true;

function toggleVideoProtection() {
    protectionEnabled = !protectionEnabled;
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
        if (protectionEnabled) {
            container.addEventListener('contextmenu', (e) => e.preventDefault());
        } else {
            container.removeEventListener('contextmenu', (e) => e.preventDefault());
        }
    });

    if (protectionEnabled) {
        window.addEventListener('blur', blurVideo);
        window.addEventListener('focus', unblurVideo);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    } else {
        window.removeEventListener('blur', blurVideo);
        window.removeEventListener('focus', unblurVideo);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
}

function blurVideo() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.style.filter = 'blur(20px)';
    });
}

function unblurVideo() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.style.filter = 'none';
    });
}

function handleFullscreenChange() {
    if (document.fullscreenElement) {
        blurVideo();
        setTimeout(unblurVideo, 500);
    }
}