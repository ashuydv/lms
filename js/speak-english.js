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
    if (window.innerWidth < 768) {
        document.getElementById('modules-list').classList.remove('hidden');
        document.getElementById('mobile-lesson-view').classList.add('hidden');
    }
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
            <video id="video-player" class="w-full h-full border-2 border-black rounded-2xl" autoplay="" loop="" muted="">
                <source src='${lesson.video}' type="video/mp4"/>
            </video>
        </div>
    `;
    document.getElementById('lesson-info').textContent = lesson.info;

    // Update mobile view
    const mobileLessonView = document.getElementById('mobile-lesson-view');
    mobileLessonView.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-2xl font-bold mb-4">${lesson.title}</h2>
            <div class="rounded-lg my-4">
                <video id="mobile-video-player" class="w-full h-full border-2 border-black rounded-2xl" controls>
                    <source src='${lesson.video}' type="video/mp4"/>
                </video>
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