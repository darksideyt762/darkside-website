document.addEventListener('DOMContentLoaded', function() {
    // Dashboard toggle
    const dashboardToggle = document.querySelector('.dashboard-toggle');
    const dashboardMenu = document.querySelector('.dashboard-menu');
    const dashboardOverlay = document.querySelector('.dashboard-overlay');
    const closeBtn = document.querySelector('.close-btn');
    
    dashboardToggle.addEventListener('click', function() {
        document.body.classList.toggle('dashboard-open');
    });
    
    dashboardOverlay.addEventListener('click', function() {
        document.body.classList.remove('dashboard-open');
    });
    
    closeBtn.addEventListener('click', function() {
        document.body.classList.remove('dashboard-open');
    });
    
    // Animation trigger on scroll
    const animatedElements = document.querySelectorAll('.slide-up, .fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.style.opacity = 0;
        if (el.classList.contains('slide-up')) {
            el.style.transform = 'translateY(30px)';
        }
        observer.observe(el);
    });
});