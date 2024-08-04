import { yourCourses, features, upcomingCourses, courseData } from './data.js';
import { handleVideoClick } from './main.js';
import { closeDrawer, openDrawer, switchTab, toggleAccordion } from './utils.js';

export function createHeader() {
    const header = document.createElement('header');
    header.className = 'figtree-400 text-gray-400 bg-[#13181d] body-font';

    const navItems = [
        { name: 'Home', icon: 'fa-house', href: 'index.html' },
        { name: 'Purchases', icon: 'fa-briefcase', href: 'purchases.html' },
    ];

    const navHTML = navItems.map(item => `
    <a href=${item.href} class="flex items-center justify-center flex-col gap-1 border-b-4 border-transparent hover:border-white w-[120px] p-2 hover:text-white figtree-400 transition-colors duration-300">
      <i class="fa-solid ${item.icon} sm:text-2xl text-base"></i>
      <span class="my-1">${item.name}</span>
    </a>
  `).join('');

    header.innerHTML = `
    <div class="container mx-auto flex flex-wrap p-5 py-0 flex-col md:flex-row items-center">
      <nav id="main-nav" class="flex text-center flex-wrap items-center justify-center w-full pt-3 text-base gap-3">
        ${navHTML}
      </nav>
    </div>
  `;

    return header;
}

export function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'text-white body-font';
    footer.innerHTML = `
    <div class="bg-[#2b303d]">
      <div class="container mx-auto py-4 px-5 flex items-center justify-center flex-wrap flex-col sm:flex-row">
        <p class="text-lg text-center sm:text-left">© 2024 Aleena Rais</p>
      </div>
    </div>
  `;
    return footer;
}

export function createMainContent() {
    const main = document.createElement('main');
    main.id = 'content';

    main.appendChild(createYourCoursesSection());
    main.appendChild(createFeaturesSection());
    main.appendChild(createUpcomingCoursesSection());

    return main;
}

function createYourCoursesSection() {
    const section = document.createElement('section');
    section.className = 'text-gray-600 body-font';
    section.id = 'your_course';

    const coursesHTML = yourCourses.map(course => `
    <div class="xl:w-1/3 md:w-1/2 p-4">
      <a href="${course.link}">
        <div class="bg-[#d9b25d] rounded-[20px] overflow-hidden">
          <img
            class="sm:h-72 h-52 rounded-[20px] w-full object-cover object-center"
            src="${course.image}"
            alt="${course.title}"
          />
          <div class="flex items-center justify-between p-4 px-8">
            <h2 class="text-lg text-gray-900 font-semibold mb-0">${course.duration}</h2>
            <h2 class="text-lg text-gray-900 font-semibold mb-0">${course.modules}</h2>
            <h2 class="text-lg text-gray-900 font-semibold mb-0">${course.language}</h2>
          </div>
        </div>
      </a>
    </div>
  `).join('');

    section.innerHTML = `
    <div class="container px-5 sm:py-24 py-12 pt-24 mx-auto">
      <div class="flex flex-wrap w-full sm:mb-10 mb-6">
        <div class="lg:w-1/2 w-full sm:mb-6 mb-2 lg:mb-0">
          <h1 class="sm:text-5xl text-4xl font-bold title-font mb-2 text-gray-900">Your Courses</h1>
          <div class="h-1 w-20 bg-indigo-500 rounded"></div>
        </div>
      </div>
      <div class="flex flex-wrap -m-4">
        ${coursesHTML}
      </div>
    </div>
  `;

    return section;
}

function createFeaturesSection() {
    const section = document.createElement('section');
    section.className = 'text-gray-600 body-font';
    section.id = 'features';

    const featuresHTML = features.map(feature => `
    <div class="p-4 sm:w-1/5 md:w-1/5 w-full">
      <div class="flex sm:items-start items-center justify-between rounded-lg h-full bg-[#13181d] p-5 sm:flex-col">
        <h2 class="text-white sm:text-2xl sm:w-full w-full max-w-[150px] text-base title-font font-medium mb-0">
          ${feature.title}
        </h2>
        <div class="sm:mt-6 mt-0">
          <a href="${feature.link}" class="text-[#13181d] sm:px-5 px-3 sm:py-2 py-2 sm:text-lg text-sm font-medium rounded-lg inline-flex bg-[#f4f5ed] items-center">
            Get Access
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `).join('');

    section.innerHTML = `
    <div class="container px-5 sm:py-4 py-8 pb-0 mx-auto">
      <div class="flex flex-wrap w-full mb-10">
        <div class="lg:w-1/2 w-full sm:mb-6 mb-2 lg:mb-0">
          <h1 class="sm:text-4xl text-3xl font-bold title-font mb-2 text-gray-900">Additional Features</h1>
          <div class="h-1 w-20 bg-indigo-500 rounded"></div>
        </div>
      </div>
      <div class="flex flex-wrap -m-4">
        ${featuresHTML}
      </div>
    </div>
  `;

    return section;
}

// function createUpcomingCoursesSection() {
//     const section = document.createElement('section');
//     section.className = 'text-gray-600 body-font';
//     section.id = 'courses';

//     const coursesHTML = upcomingCourses.map((course, index) => `
//     <div class="p-4 md:w-1/5">
//       <div class="flex items-start justify-between rounded-lg h-full bg-[#13181d] p-5 flex-col min-h-[240px] cursor-pointer course-card" data-course-index="${index}">
//         <div class="mb-4">
//           <a class="text-[#13181d] px-3 p-1 text-sm font-medium rounded-lg inline-flex bg-[#f4f5ed] items-center">
//             Coming Soon
//           </a>
//         </div>
//         <h2 class="text-white text-3xl title-font font-semibold mb-auto">
//           ${course.title} <br class="mb-0" />
//           ${course.subtitle ? `<span class="text-white text-sm font-normal">${course.subtitle}</span>` : ''}
//         </h2>
//       </div>
//     </div>
//   `).join('');

//     section.innerHTML = `
//     <div class="container px-5 sm:py-20 py-14 pb-36 mx-auto">
//       <div class="flex flex-wrap w-full mb-10">
//         <div class="lg:w-1/2 w-full sm:mb-6 mb-2 lg:mb-0">
//           <h1 class="sm:text-4xl text-3xl font-bold title-font mb-2 text-gray-900">Upcoming Courses</h1>
//           <div class="h-1 w-20 bg-indigo-500 rounded"></div>
//         </div>
//       </div>
//       <div class="flex flex-wrap -m-4">
//         ${coursesHTML}
//       </div>
//     </div>
//   `;

//     return section;
// }

function createUpcomingCoursesSection() {
    const section = document.createElement('section');
    section.className = 'text-gray-600 body-font';
    section.id = 'courses';

    const coursesHTML = upcomingCourses.map((course, index) => `
    <div class="p-4 md:w-1/5">
      <div class="flex items-start justify-between rounded-lg h-full bg-[#13181d] p-5 flex-col min-h-[240px] cursor-pointer course-card" data-course-index="${index}">
        <div class="mb-4">
          <a class="text-[#13181d] px-3 p-1 text-sm font-medium rounded-lg inline-flex bg-[#f4f5ed] items-center">
            Coming Soon
          </a>
        </div>
        <h2 class="text-white text-3xl title-font font-semibold mb-auto">
          ${course.title} <br class="mb-0" />
          ${course.subtitle ? `<span class="text-white text-sm font-normal">${course.subtitle}</span>` : ''}
        </h2>
      </div>
    </div>
  `).join('');

    section.innerHTML = `
    <div class="container px-5 sm:py-20 py-14 pb-36 mx-auto">
      <div class="flex flex-wrap w-full mb-10">
        <div class="lg:w-1/2 w-full sm:mb-6 mb-2 lg:mb-0">
          <h1 class="sm:text-4xl text-3xl font-bold title-font mb-2 text-gray-900">Upcoming Courses</h1>
          <div class="h-1 w-20 bg-indigo-500 rounded"></div>
        </div>
      </div>
      <div class="flex flex-wrap -m-4">
        ${coursesHTML}
      </div>
    </div>
  `;

    // Add click event listeners to course cards
    section.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            console.log('Card clicked'); // Debug log
            const courseIndex = parseInt(card.dataset.courseIndex);
            if (!isNaN(courseIndex) && upcomingCourses[courseIndex]) {
                console.log('Opening drawer for course:', upcomingCourses[courseIndex]); // Debug log
                openDrawerWithCourseDetails(upcomingCourses[courseIndex]);
            } else {
                console.error('Invalid course index or course not found');
            }
        });
    });

    return section;
}

function openDrawerWithCourseDetails(course) {
    console.log('openDrawerWithCourseDetails called with course:', course); // Debug log
    const drawerContent = document.querySelector('.drawer-content');

    if (!drawerContent) {
        console.error('Drawer content element not found');
        return;
    }

    drawerContent.innerHTML = createDrawerContent(course);

    const closeDrawerBtn = document.getElementById('closeDrawer');
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeDrawer);
    }

    openDrawer();
    console.log('Drawer should be open now'); // Debug log
}

export function renderModules() {
    const modulesContainer = document.getElementById('modules-container');
    if (!courseData || !modulesContainer) return;

    function render() {
        const isMobile = window.innerWidth <= 1000;

        modulesContainer.innerHTML = courseData.modules.map((module, moduleIndex) => `
      <div class="accordion-item bg-white border-2 border-black rounded-lg shadow w-full">
        <button class="accordion-header w-full text-left px-4 py-3 flex justify-between items-start transition">
          <div>
            <h3 class="font-medium">${module.title}</h3>
            <p class="text-xl text-gray-900 font-medium">${module.description}</p>
            <span class="text-xs text-gray-900">${module.lessonCount} Lessons</span>
          </div>
          <svg class="w-5 h-5 transition-transform transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="accordion-content hidden px-4 pb-3 transition">
          <ul class="space-y-2">
            ${module.lessons.map((lesson, lessonIndex) => `
              <${isMobile ? 'a href="speak-english/' + lesson.href + '"' : 'li'} class="video-item" data-module="${moduleIndex}" data-lesson="${lessonIndex}">
                <div class="flex-shrink-0 mr-3">
                  <svg class="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-grow">
                  <p class="font-medium w-full">${lesson.title}</p>
                  <p class="text-xs text-gray-500">${lesson.type} • Data: ${lesson.data}</p>
                </div>
              </${isMobile ? 'a' : 'li'}>
            `).join('')}
          </ul>
        </div>
      </div>
    `).join('');

        // Highlight the first video item
        const firstVideoItem = document.querySelector('.video-item');
        if (firstVideoItem) {
            firstVideoItem.classList.add('bg-gray-200');
        }

        // Add click event listeners to video items
        document.querySelectorAll('.video-item').forEach(item => {
            item.addEventListener('click', handleVideoClick);
        });

        // Add click event listeners to accordion headers
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', toggleAccordion);
        });
    }

    // Initial render
    render();

    // Re-render on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            render();
        }, 250); // Debounce the resize event
    });
}

export function updateVideoContent(lesson) {
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
        videoContainer.innerHTML = `
      <h2 class="sm:text-3xl text-2xl title-font w-full font-semibold text-gray-900 mt-2 mb-4">${lesson.title}</h2>
      <video id="video-player" class="w-full h-full border-2 border-black rounded-2xl" autoplay loop muted>
        <source src="${lesson.videoUrl}" type="video/mp4">
      </video>
    `;
    }
}

export function updateInfoContent(lesson) {
    const infoContainer = document.getElementById('info-container');
    if (infoContainer) {
        infoContainer.innerHTML = `
      <div class="flex border-b">
        <button class="py-2 px-4 sm:text-xl text-xl font-medium text-center text-black border-b-2 border-black rounded-t-lg active" id="lesson-tab" data-tabs-target="#lesson" type="button" role="tab" aria-controls="lesson" aria-selected="true">
          Lesson Info
        </button>
        <button class="py-2 px-4 sm:text-xl text-xl font-medium text-center text-gray-500 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-black" id="resources-tab" data-tabs-target="#resources" type="button" role="tab" aria-controls="resources" aria-selected="false">
          Resources
        </button>
      </div>
      <div id="tab-content" class="w-full">
        <div class="rounded-lg py-8" id="lesson" role="tabpanel" aria-labelledby="lesson-tab">
          <p class="sm:text-xl text-md text-black w-full">${lesson.lessonInfo}</p>
        </div>
        <div class="hidden rounded-lg py-8" id="resources" role="tabpanel" aria-labelledby="resources-tab">
          <p class="sm:text-xl text-md text-black w-full">${lesson.resources}</p>
        </div>
      </div>
    `;

        // Add click event listeners to tabs
        document.querySelectorAll('[data-tabs-target]').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab));
        });
    }
}

// export function createDrawerContent(course) {
//     return `
//       <div class="p-5">
//         <div class="flex justify-between items-center mb-6">
//           <h3 class="text-2xl font-bold text-gray-900">${course.title}</h3>
//           <button id="closeDrawer"
//             class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center">
//             <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//               <path fill-rule="evenodd"
//                 d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                 clip-rule="evenodd"></path>
//             </svg>
//           </button>
//         </div>
//         <div class="mb-4">
//           <img src="${course.image || 'https://dummyimage.com/600x300'}" alt="Course Image" class="w-full rounded-lg">
//         </div>
//         <div class="flex justify-between items-center mb-4">
//           <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">${course.category || 'UPCOMING COURSE'}</span>
//           <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${course.duration || 'Coming Soon'}</span>
//         </div>
//         <p class="text-sm text-gray-500 mb-4">${course.subtitle || ''}</p>
//         <p class="text-base text-gray-700 mb-4">This course is coming soon. Stay tuned for more details!</p>
//         <button id="notifyMe" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
//           Notify me when available
//         </button>
//       </div>
//     `;
// }

export function createDrawer() {
    const drawer = document.createElement('div');
    drawer.id = 'drawer';
    drawer.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-hidden h-full w-full hidden drawer-backdrop';
    drawer.innerHTML = `
      <div class="absolute right-0 top-0 h-full w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white shadow-xl drawer-content overflow-y-auto">
        <!-- Drawer content will be inserted here -->
      </div>
    `;
    return drawer;
}

export function createDrawerContent(course) {
    return `
      <div class="p-5">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">${course.title}</h3>
          <button id="closeDrawer" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="mb-4">
          <img src="${course.image || 'https://dummyimage.com/600x300'}" alt="Course Image" class="w-full rounded-lg">
        </div>
        <div class="flex justify-between items-center mb-4">
          <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">${course.category || 'UPCOMING COURSE'}</span>
          <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${course.duration || 'Coming Soon'}</span>
        </div>
        <p class="text-sm text-gray-500 mb-4">${course.subtitle || ''}</p>
        <p class="text-base text-gray-700 mb-4">This course is coming soon. Stay tuned for more details!</p>
        <button id="notifyMe" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Notify me when available
        </button>
      </div>
    `;
}