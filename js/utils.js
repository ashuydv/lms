export function switchTab(selectedTab) {
    const tabs = document.querySelectorAll('[data-tabs-target]');
    const tabContents = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(tab => {
        tab.classList.remove('active', 'border-black', 'text-black');
        tab.classList.add('text-gray-500', 'border-transparent');
    });

    tabContents.forEach(content => content.classList.add('hidden'));

    selectedTab.classList.add('active', 'border-black', 'text-black');
    selectedTab.classList.remove('text-gray-500', 'border-transparent');

    const target = document.querySelector(selectedTab.dataset.tabsTarget);
    target.classList.remove('hidden');
}

export function toggleAccordion(event) {
    const content = event.currentTarget.nextElementSibling;
    content.classList.toggle('hidden');
    event.currentTarget.querySelector('svg').classList.toggle('rotate-180');
}

export function openDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer) {
        drawer.classList.remove('hidden');
    }
}

export function closeDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer) {
        drawer.classList.add('hidden');
    }
}
