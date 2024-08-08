// import { yourCourses, features, upcomingCourses, courseData } from './data.js';
// import { openDrawer, closeDrawer, switchTab, toggleAccordion } from './utils.js';
// import {
//     createHeader,
//     createFooter,
//     createMainContent,
//     renderModules,
//     updateVideoContent,
//     updateInfoContent,
//     createDrawer,
//     createDrawerContent
// } from './dom.js';

// function initializePage(route) {
//     if (window.location.pathname === route) {
//         const header = createHeader();
//         const content = createMainContent();
//         const footer = createFooter();
//         const drawer = createDrawer();

//         document.body.appendChild(header);
//         document.body.appendChild(content);
//         document.body.appendChild(footer);
//         document.body.appendChild(drawer);
//     }
// }

// function loadFirstVideo() {
//     if (courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
//         const firstLesson = courseData.modules[0].lessons[0];
//         updateVideoContent(firstLesson);
//         updateInfoContent(firstLesson);
//     }
// }

// function handleVideoClick(event) {
//     document.querySelectorAll('.video-item').forEach(item => {
//         item.classList.remove('bg-gray-200');
//     });

//     event.currentTarget.classList.add('bg-gray-200');

//     const moduleIndex = event.currentTarget.dataset.module;
//     const lessonIndex = event.currentTarget.dataset.lesson;
//     const lesson = courseData.modules[moduleIndex].lessons[lessonIndex];

//     updateVideoContent(lesson);
//     updateInfoContent(lesson);
// }

// function openDrawerWithCourseDetails(course) {
//     const drawerContent = document.querySelector('.drawer-content');

//     if (!drawerContent) {
//         console.error('Drawer content element not found');
//         return;
//     }

//     drawerContent.innerHTML = createDrawerContent(course);

//     const closeDrawerBtn = document.getElementById('closeDrawer');
//     if (closeDrawerBtn) {
//         closeDrawerBtn.addEventListener('click', closeDrawer);
//     }

//     openDrawer();
// }

// document.addEventListener('DOMContentLoaded', () => {
//     initializePage('/');
//     renderModules();
//     loadFirstVideo();

//     const coursesSection = document.getElementById('courses');
//     if (coursesSection) {
//         coursesSection.addEventListener('click', (event) => {
//             const courseCard = event.target.closest('.course-card');
//             if (courseCard) {
//                 const courseIndex = parseInt(courseCard.dataset.courseIndex);
//                 if (!isNaN(courseIndex) && upcomingCourses[courseIndex]) {
//                     openDrawerWithCourseDetails(upcomingCourses[courseIndex]);
//                 } else {
//                     console.error('Invalid course index or course not found');
//                 }
//             }
//         });
//     } else {
//         console.error('Courses section not found');
//     }
// });

// export { handleVideoClick };

document.addEventListener("DOMContentLoaded", function () {
    fetchCourses();
})

function showLoader() {
    const loaderHTML = `
        <div id="loader" class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
            <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500">
                loading ...
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.remove();
    }
}

async function fetchCourses() {
    try {
        const res = await fetch('data/course.json');
        const data = await res.json();

        renderYourCourses(data.yourCourses);
        renderUpcomingCourses(data.upcomingCourses);
    } catch (e) {
        console.error('Error fetching courses', e);
    } finally {
        hideLoader();
    }
}

function renderYourCourses(courses) {
    const container = document.getElementById('yourCoursesContainer');

    courses.forEach(course => {
        const courseHTML = `
            <div class="xl:w-1/3 md:w-1/2 p-4">
                <a href="${course.link}">
                    <div class="bg-[#d9b25d] rounded-[20px] overflow-hidden">
                        <img class="h-72 rounded-[20px] w-full object-cover object-center"
                            src="${course.image}" alt="${course.title}" />
                        <div class="flex items-center justify-between p-4 px-8">
                            <h2 class="text-lg text-gray-900 font-semibold mb-0">
                                ${course.duration}
                            </h2>
                            <h2 class="text-lg text-gray-900 font-semibold mb-0">
                                ${course.modules}
                            </h2>
                            <h2 class="text-lg text-gray-900 font-semibold mb-0">
                                ${course.language}
                            </h2>
                        </div>
                    </div>
                </a>
            </div>
        `;
        container.innerHTML += courseHTML;
    });
}

function renderUpcomingCourses(courses) {
    const container = document.getElementById('upcomingCoursesContainer');
    courses.forEach((course, index) => {
        const courseHTML = `
            <div class="p-4 xl:w-1/4 md:w-1/2 w-full">
                <div class="flex items-start justify-between rounded-lg h-full bg-[#13181d] p-5 flex-col min-h-[240px]">
                    <div class="mb-4">
                        <a class="text-[#13181d] px-3 p-1 text-sm font-medium rounded-lg inline-flex bg-[#f4f5ed] items-center">
                            ${course.status}
                        </a>
                    </div>
                    <h2 class="text-white text-2xl title-font font-semibold mb-auto">
                        ${course.title}
                    </h2>
                    <button class="openDrawer mt-4 bg-[#f4f5ed] text-[#13181d] px-3 py-1 rounded" data-index="${index}">
                        Learn More
                    </button>
                </div>
            </div>
        `;
        container.innerHTML += courseHTML;
    });

    // Add event listeners to the "Learn More" buttons
    const openDrawerButtons = document.querySelectorAll('.openDrawer');
    openDrawerButtons.forEach(button => {
        button.addEventListener('click', () => openDrawer(courses[button.dataset.index]));
    });
}

function openDrawer(course) {
    const drawer = document.getElementById('courseDrawer');
    const drawerContent = drawer.querySelector('.drawer-content');
    const content = document.getElementById('drawerContent');

    content.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900">${course.title}</h3>
            <button id="closeDrawer" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
        <div class="mb-4">
            <img src="${course.image || 'https://dummyimage.com/600x300'}" alt="${course.title}" class="w-full rounded-lg">
        </div>
        <div class="flex justify-between items-center mb-4">
            <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">${course.category || 'UPCOMING'}</span>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${course.duration || 'Coming Soon'}</span>
        </div>
        <p class="text-sm text-gray-500 mb-4">${course.description || 'More details coming soon'}</p>
        <!-- Add more course details here as needed -->
    `;

    drawer.classList.remove('hidden');
    setTimeout(() => {
        drawer.classList.add('show');
        drawerContent.classList.add('show');
    }, 10);

    const closeDrawerBtn = document.getElementById('closeDrawer');
    closeDrawerBtn.addEventListener('click', closeDrawer);

    drawer.addEventListener('click', (e) => {
        if (e.target === drawer) {
            closeDrawer();
        }
    });
}

function closeDrawer() {
    const drawer = document.getElementById('courseDrawer');
    const drawerContent = drawer.querySelector('.drawer-content');

    drawer.classList.remove('show');
    drawerContent.classList.remove('show');
    setTimeout(() => {
        drawer.classList.add('hidden');
    }, 300);
}

// Prevent right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    alert('This feature is not allowed.');
});