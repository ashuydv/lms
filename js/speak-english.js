console.log('Speak English script loaded');

let currentModule = 0;
let currentLesson = 0;
let isInLessonView = false;
let completedLessons = JSON.parse(localStorage.getItem('completedLessons')) || {};

document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM fully loaded and parsed');
    fetchModules();
    setupBackButtonListener();
});

async function fetchModules() {
    try {
        console.log('Fetching modules...');
        const response = await fetch('../data/speak-english-modules.json');
        const data = await response.json();
        localStorage.setItem('modules', JSON.stringify(data.modules));
        renderModules(data.modules);
        initializeProgressBar(data.modules);
        addLessonClickHandlers();
        initializeMobileView();

        // Only load the first lesson automatically on desktop
        if (window.innerWidth >= 768 && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
            loadLesson(0, 0);
        }
    } catch (error) {
        console.error('Error fetching modules:', error);
    }
}

function renderModules(modules) {
    const modulesContainer = document.getElementById('modules-container');

    if (!modulesContainer) {
        console.error('Error: modules-container element not found.');
        return;
    }

    modulesContainer.innerHTML = ''; // Clear existing content

    modules.forEach((module, moduleIndex) => {
        const moduleElement = document.createElement('div');
        moduleElement.className = 'bg-white transition rounded-lg border-2 border-black shadow mb-4';
        moduleElement.innerHTML = `
            <button class="accordion-header w-full rounded-xl text-left p-4 font-semibold flex justify-between items-start">
                <div class="flex items-start w-full flex-col">
                    <span class="text-md">Module ${module.sr_no}</span>   
                    <span class="text-xl leading-6 mb-2">${module.title}</span>
                    <span class="text-sm text-gray-500">${module.lessons.length} Lessons</span>
                </div>
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content transition">
                <ul class="sm:p-4 p-2 space-y-2">
                    ${module.lessons.map((lesson, lessonIndex) => `
                        <li class="lesson-item flex items-center cursor-pointer sm:px-3 sm:py-2 px-2 py-2 hover:bg-gray-100 rounded sm:border-0 ${isLessonCompleted(moduleIndex, lessonIndex) ? 'completed-lesson' : ''}" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
                            <div class="flex items-start flex-col w-full">
                                <div class="flex items-start justify-between w-full">
                                    <div>
                                        <i class="fa-solid fa-play mr-2 text-sm"></i>
                                        <span class="flex-grow font-semibold">${lesson.title}</span>
                                    </div>
                                    <button class="mark-complete-btn bg-green-500 text-white px-2 py-1 rounded text-xs" onclick="toggleLessonCompletion(event, ${moduleIndex}, ${lessonIndex})">
                                        ${isLessonCompleted(moduleIndex, lessonIndex) ? 'Completed' : 'Mark Complete'}
                                    </button>
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

    updateProgressBar(modules);
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

    console.log("Loading lesson:", lesson);

    // Update desktop view
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-content').innerHTML = `
        <div class="rounded-lg my-4 relative">
            <div class="video-loader"></div>
             <div class="iframe-wrapper relative">
             ${lesson.video}
             <div id="overlay-wrapper">
             <div class="watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl opacity-50 pointer-events-none select-none">
                 aleenarais
             </div>
             </div>
            </div>
        </div>
    `;
    document.getElementById('lesson-info').textContent = lesson.info;
    const resourcesList = document.getElementById('lesson-resources');

    // Update mobile view
    const mobileLessonView = document.getElementById('mobile-lesson-view');
    mobileLessonView.innerHTML = `
        <div class="figtree-400 rounded-lg mb-6">
            <h2 class="sm:text-2xl text-xl font-bold mb-4">${lesson.title}</h2>
            <div class="rounded-lg my-4 relative">
                <div class="video-loader"></div>
                 <div class="iframe-wrapper relative">
                    ${lesson.video}
                    <div class="watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl opacity-50 pointer-events-none select-none">
                        aleenarais
                    </div>
                </div>
            </div>
            <div class="flex justify-between mt-4 w-full px-3">
                <button id="mobile-prev-lesson" class="bg-black text-white px-4 py-2 rounded"><</button>
                <button id="mobile-next-lesson" class="bg-black text-white px-4 py-2 rounded">></button>
            </div>
            <div class="flex border-b my-4 mt-[12px] items-center justify-center">
                <button class="py-2 px-4 border-b-2 border-black text-black font-medium" id="mobile-lesson-info-tab">Lesson Info</button>
                <button class="py-2 px-4 font-medium" id="mobile-resources-tab">Resources</button>
            </div>
            <div id="mobile-lesson-info" class="mt-4">${lesson.info}</div>
            <div id="mobile-lesson-resources" class="mt-4 gap-4 flex items-center hidden"></div>
        </div>
    `;

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
        document.getElementById('modules-list').classList.add('hidden');
        document.getElementById('mobile-lesson-view').classList.remove('hidden');
    }

    // Add event listeners for mobile tabs
    document.getElementById('mobile-lesson-info-tab').addEventListener('click', function () {
        this.classList.add('border-b-2', 'border-black', 'text-black');
        document.getElementById('mobile-resources-tab').classList.remove('border-b-2', 'border-black', 'text-black');
        document.getElementById('mobile-lesson-info').classList.remove('hidden');
        document.getElementById('mobile-lesson-resources').classList.add('hidden');
    });

    document.getElementById('mobile-resources-tab').addEventListener('click', function () {
        this.classList.add('border-b-2', 'border-black', 'text-black');
        document.getElementById('mobile-lesson-info-tab').classList.remove('border-b-2', 'border-black', 'text-black');
        document.getElementById('mobile-lesson-resources').classList.remove('hidden');
        document.getElementById('mobile-lesson-info').classList.add('hidden');
    });

    document.getElementById('mobile-prev-lesson').addEventListener('click', () => navigateLesson(-1));
    document.getElementById('mobile-next-lesson').addEventListener('click', () => navigateLesson(1));

    // Remove highlight from all lessons
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('bg-black', 'text-white');
        item.classList.add('hover:bg-gray-100');
        item.querySelectorAll('.text-gray-500, .text-black').forEach(el => {
            el.classList.remove('text-white');
            el.classList.add('text-gray-500');
        });
    });

    // Add highlight to the selected lesson and change text color to white
    const selectedLesson = document.querySelector(`.lesson-item[data-module="${moduleIndex}"][data-lesson="${lessonIndex}"]`);
    if (selectedLesson) {
        selectedLesson.classList.add('bg-black', 'text-white');
        selectedLesson.classList.remove('hover:bg-gray-100');
        selectedLesson.querySelectorAll('.text-gray-500, .text-black').forEach(el => {
            el.classList.remove('text-gray-500', 'text-black');
            el.classList.add('text-white');
        });
    }

    // Load the Vimeo player script if not already loaded
    if (!document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        document.body.appendChild(script);
    }

    // Handle video loading and loader visibility
    const videoContainers = document.querySelectorAll('.rounded-lg.my-4.relative');
    videoContainers.forEach(container => {
        const loader = container.querySelector('.video-loader');
        const iframe = container.querySelector('iframe');

        if (iframe) {
            loader.style.display = 'block'; // Show loader

            iframe.addEventListener('load', () => {
                loader.style.display = 'none'; // Hide loader when video is loaded
            });

            // Fallback to hide loader after a set time, in case 'load' event doesn't fire
            setTimeout(() => {
                loader.style.display = 'none';
            }, 5000); // Adjust time as needed
        }
    });

    moveWatermark();
}

function isLessonCompleted(moduleIndex, lessonIndex) {
    return completedLessons[`${moduleIndex}-${lessonIndex}`] === true;
}

function toggleLessonCompletion(event, moduleIndex, lessonIndex) {
    event.stopPropagation();
    const lessonKey = `${moduleIndex}-${lessonIndex}`;
    completedLessons[lessonKey] = !completedLessons[lessonKey];
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));

    const button = event.target;
    const lessonItem = button.closest('.lesson-item');

    if (completedLessons[lessonKey]) {
        button.textContent = 'Completed';
        lessonItem.classList.add('completed-lesson');
    } else {
        button.textContent = 'Mark Complete';
        lessonItem.classList.remove('completed-lesson');
    }

    const modules = JSON.parse(localStorage.getItem('modules'));
    updateProgressBar(modules);

    // Update the button in the lesson view if it exists
    const lessonViewButton = document.querySelector('#lesson-content .mark-complete-btn');
    if (lessonViewButton) {
        lessonViewButton.textContent = completedLessons[lessonKey] ? 'Completed' : 'Mark Complete';
    }
}

function updateProgressBar(modules) {
    const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
    const completedCount = Object.values(completedLessons).filter(Boolean).length;
    const progressPercentage = (completedCount / totalLessons) * 100;

    const progressBar = document.querySelector('.progress');
    const progressBarContainer = document.querySelector('.progress-bar');
    const percentageText = document.querySelector('.progress-percentage');

    if (progressBar && progressBarContainer && percentageText) {
        progressBar.style.width = `${progressPercentage}%`;
        percentageText.textContent = `${Math.round(progressPercentage)}%`;
    }

    // Update all mark complete buttons
    document.querySelectorAll('.mark-complete-btn').forEach(button => {
        const moduleIndex = parseInt(button.closest('.lesson-item').dataset.module);
        const lessonIndex = parseInt(button.closest('.lesson-item').dataset.lesson);
        const lessonKey = `${moduleIndex}-${lessonIndex}`;
        button.textContent = completedLessons[lessonKey] ? 'Completed' : 'Mark Complete';
    });
}


function initializeProgressBar(modules) {
    updateProgressBar(modules);
}

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

function setupBackButtonListener() {
    window.addEventListener('popstate', handleBackNavigation);
}

function handleBackNavigation(event) {
    if (window.innerWidth < 768) {
        if (isInLessonView) {
            event.preventDefault();
            showModulesList();
        }
        // If not in lesson view, let the default back behavior occur
    }
}

// Update the back button click handler
document.getElementById('back-button').addEventListener('click', function (e) {
    e.preventDefault();
    if (window.innerWidth < 768) {
        if (isInLessonView) {
            showModulesList();
        } else {
            window.history.back();
        }
    } else {
        window.location.href = '../index.html';
    }
});

// Update lesson item click handler
function addLessonClickHandlers() {
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', function (event) {
            if (!event.target.classList.contains('mark-complete-btn')) {
                const moduleIndex = parseInt(this.dataset.module);
                const lessonIndex = parseInt(this.dataset.lesson);
                loadLesson(moduleIndex, lessonIndex);
                if (window.innerWidth < 768) {
                    history.pushState({ page: 'lesson' }, '', '');
                }
            }
        });
    });
}

function initializeMobileView() {
    if (window.innerWidth < 768) {
        showModulesList();
    }
}

// Tab switching
document.getElementById('lesson-info-tab').addEventListener('click', function () {
    this.classList.add('border-b-2', 'border-black', 'text-black');
    document.getElementById('resources-tab').classList.remove('border-b-2', 'border-black', 'text-black');
    document.getElementById('lesson-info').classList.remove('hidden');
    document.getElementById('lesson-resources').classList.add('hidden');
});

document.getElementById('resources-tab').addEventListener('click', function () {
    this.classList.add('border-b-2', 'border-black', 'text-black');
    document.getElementById('lesson-info-tab').classList.remove('border-b-2', 'border-black', 'text-black');
    document.getElementById('lesson-resources').classList.remove('hidden');
    document.getElementById('lesson-info').classList.add('hidden');
});

// Navigation buttons
const addNavigationListener = (buttonId, direction) => {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => navigateLesson(direction));
    }
};

addNavigationListener('prev-lesson', -1);
addNavigationListener('next-lesson', 1);

function createCustomVideoControls(videoElement) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container relative overflow-hidden';

    const watermark = document.createElement('div');
    watermark.className = 'watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl opacity-50 pointer-events-none select-none';
    watermark.textContent = 'aleenarais';

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'custom-video-controls flex items-center justify-between bg-gray-800 rounded-b-2xl bg-opacity-10 text-white sm:px-8 sm:py-4 backdrop-filter backdrop-blur-xl absolute w-full overflow-hidden bottom-0';

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
    timeDisplay.className = 'time-display sm:w-24 w-full text-center';
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

    return videoContainer;
}

// Prevent right-click on video
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.video-container')) {
        e.preventDefault();
        alert('Right-clicking is not allowed on the video.');
    }
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
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.style.filter = 'blur(20px)';
    });
});

window.addEventListener('focus', () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.style.filter = 'none';
    });
});

// Detect fullscreen change
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        const video = document.fullscreenElement.querySelector('video');
        if (video) {
            video.style.filter = 'blur(20px)';
            setTimeout(() => { video.style.filter = 'none'; }, 500);
        }
    }
});

// Example of how you might add a function to update the watermark text
function updateWatermark(text) {
    const watermarks = document.querySelectorAll('.watermark');
    watermarks.forEach(watermark => {
        watermark.textContent = text;
    });
}

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

function moveWatermark() {
    const watermark = document.querySelector('.watermark');
    const wrapper = document.querySelector('.iframe-wrapper');

    if (!watermark || !wrapper) return;

    function updatePosition() {
        const maxX = wrapper.clientWidth - watermark.clientWidth;
        const maxY = wrapper.clientHeight - watermark.clientHeight;

        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;

        watermark.style.left = `${newX}px`;
        watermark.style.top = `${newY}px`;
    }

    // Initial position
    updatePosition();

    // Update position every 3 seconds
    setInterval(updatePosition, 10000);
}

function updateWatermark(text) {
    const watermark = document.querySelector('.watermark');
    if (watermark) {
        watermark.textContent = text;
    }
}

async function checkScreenSharing() {
    const overlayDisplay = document.getElementById("overlay-wrapper");

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        console.log(stream);
        if (stream.active) {
            overlayDisplay.classList.add("overlay")
        } else {
            overlayDisplay.classList.remove("overlay")
        }

        return true;
    } catch (err) {
        if (err.name === 'NotAllowedError') {
            overlayDisplay.classList.remove("overlay")
            // User denied permission, or screen sharing is already in progress
            console.log('Screen sharing permission denied or already in progress');
        } else {
            overlayDisplay.classList.remove("overlay")
            // Screen sharing is not supported or another error occurred
            console.error('Error checking screen sharing:', err);
        }
        return false;
    }
}