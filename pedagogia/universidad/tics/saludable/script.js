// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(navTab => navTab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.closest('.nav-tab').classList.add('active');
    
    // Trigger animations
    animateOnScroll();
}

// Accordion functionality
function toggleAccordion(header) {
    const item = header.parentElement;
    const allItems = document.querySelectorAll('.accordion-item');
    
    // Close all other items
    allItems.forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
        }
    });
    
    // Toggle current item
    item.classList.toggle('active');
}

// Modal functions
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function openSnackModal() {
    document.getElementById('snackModal').style.display = 'block';
}

function closeSnackModal() {
    document.getElementById('snackModal').style.display = 'none';
}

function openModalAlcohol() {
    document.getElementById('alcoholModal').style.display = 'block';
}

function closeModalAlcohol() {
    document.getElementById('alcoholModal').style.display = 'none';
}

function openHelpModal() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Toggle content
function toggleContent(contentId) {
    const content = document.getElementById(contentId);
    content.classList.toggle('show');
    
    const btn = event.target.closest('.toggle-btn');
    const icon = btn.querySelector('i');
    
    if (content.classList.contains('show')) {
        icon.classList.remove('fa-plus-circle');
        icon.classList.add('fa-minus-circle');
    } else {
        icon.classList.remove('fa-minus-circle');
        icon.classList.add('fa-plus-circle');
    }
}

// Animate on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('animated');
        }
    });
}

// Initialize animations on scroll
window.addEventListener('scroll', animateOnScroll);

// Initial check for animations
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    
    // Simulate progress bar animation
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }, 500);
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});