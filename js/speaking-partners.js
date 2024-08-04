// speaking-partners.js

document.addEventListener('DOMContentLoaded', function () {
    fetchModules();
});

async function fetchModules() {
    try {
        const response = await fetch('../data/speaking-modules.json');
        const data = await response.json();
        renderModules(data.modules);
        if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
            loadLesson(data.modules[0].lessons[0]);
        }
    } catch (error) {
        console.error('Error fetching modules:', error);
    }
}

function renderModules(modules) {
    console.log('Rendering modules:', modules);
    const modulesContainer = document.getElementById('modules-container');
    if (!modulesContainer) {
        console.error('modules-container not found');
        return;
    }
    modulesContainer.innerHTML = '';

    modules.forEach((module, moduleIndex) => {
        console.log('Rendering module:', module.title);
        const moduleElement = document.createElement('div');
        moduleElement.className = 'bg-white rounded-lg shadow mb-4';
        moduleElement.innerHTML = `
            <button class="accordion-header w-full text-left p-4 font-semibold flex justify-between items-center">
                <span>${module.title}</span>
                <span class="text-sm text-gray-500">${module.lessons.length} Lessons</span>
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <ul class="p-4 space-y-2">
                    ${module.lessons.map((lesson, lessonIndex) => `
                        <li class="flex items-center cursor-pointer" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
                            <i class="fa-solid fa-play mr-2 text-sm"></i>
                            <span>${lesson.title}</span>
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
}

function loadLesson(moduleIndex, lessonIndex) {
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

    const lessonTitle = document.getElementById('lesson-title');
    const lessonContent = document.getElementById('lesson-content');
    const lessonInfoResources = document.getElementById('lesson-info-resources');
    const lessonView = document.getElementById('lesson-view');

    if (!lessonTitle || !lessonContent || !lessonInfoResources || !lessonView) {
        console.error('One or more required elements are missing from the DOM');
        return;
    }

    lessonTitle.textContent = lesson.title;
    lessonTitle.style.marginBottom = "20px";

    lessonContent.innerHTML = `
        <div class="rounded-lg my-4">
            <video id="video-player" class="w-full h-full border-2 border-black rounded-2xl" controls>
                <source src='${lesson.video}' type="video/mp4"/>
                Your browser does not support the video tag.
            </video>
        </div>
    `;

    console.log("lesson", lesson);

    lessonInfoResources.innerHTML = `
        <div class="flex border-b mb-4">
            <button class="py-2 px-4 border-b-2 border-blue-500 text-blue-500" id="lesson-info-tab">Lesson Info</button>
            <button class="py-2 px-4" id="resources-tab">Resources</button>
        </div>
        <div id="lesson-info" class="mt-4">
            <p>${lesson.info}</p>
        </div>
        <div id="resources-content" class="mt-4 hidden">
            <h3 class="font-semibold mb-2">Chapter Notes:</h3>
            <a href="${lesson.pdfResource || '#'}" download class="bg-gray-800 text-white py-2 px-4 rounded inline-block hover:bg-gray-700 transition-colors">
                Download
            </a>
            <h3 class="font-semibold mt-4 mb-2">Additional Resources:</h3>
            <ul class="list-disc pl-5">
                ${lesson.resources.map(resource => `<li>${resource}</li>`).join('')}
            </ul>
        </div>
    `;

    // Add event listeners for tab switching
    const lessonInfoTab = document.getElementById('lesson-info-tab');
    const resourcesTab = document.getElementById('resources-tab');
    const lessonInfo = document.getElementById('lesson-info');
    const resourcesContent = document.getElementById('resources-content');

    if (lessonInfoTab && resourcesTab && lessonInfo && resourcesContent) {
        lessonInfoTab.addEventListener('click', function () {
            this.classList.add('border-b-2', 'border-blue-500', 'text-blue-500');
            resourcesTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-500');
            lessonInfo.classList.remove('hidden');
            resourcesContent.classList.add('hidden');
        });

        resourcesTab.addEventListener('click', function () {
            this.classList.add('border-b-2', 'border-blue-500', 'text-blue-500');
            lessonInfoTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-500');
            resourcesContent.classList.remove('hidden');
            lessonInfo.classList.add('hidden');
        });
    }

    // Show lesson view on mobile
    lessonView.classList.remove('hidden');
}