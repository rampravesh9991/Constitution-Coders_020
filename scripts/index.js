document.addEventListener('DOMContentLoaded', function () {
    // Intersection Observer setup for scroll-based animations
    const sections = document.querySelectorAll('section, .feature');
    const productShowcase = document.getElementById('product-showcase'); // Specific section for animation
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a specific animation for #product-showcase
                if (entry.target.id === 'product-showcase') {
                    entry.target.classList.add('fadeIn');
                } else {
                    entry.target.classList.add('fadeIn');
                }
                observer.unobserve(entry.target); // Stop observing once animation is triggered
            }
        });
    }, options);

    // Observe all sections including specific product-showcase section
    sections.forEach(section => {
        observer.observe(section);
    });

    // Back to Top Button setup
    const backToTopBtn = document.getElementById('backToTop');

    // Show the button when user scrolls down
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // Scroll smoothly to the top when button is clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });

    // Navbar mobile menu toggle
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    const navbarMenu = document.querySelector('.navbar-menu');

    mobileMenuIcon.addEventListener('click', () => {
        navbarMenu.classList.toggle('show');
    });

    // Optional: Close mobile menu when a menu item is clicked
    navbarMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navbarMenu.classList.remove('show');
        }
    });

    // Button transition setup
    const button = document.querySelector('.hero .btn');

    // Delay the transition to ensure it's applied after page load
    setTimeout(() => {
        button.style.opacity = 1;
        button.style.transform = 'scale(1)';
    }, 100); // Adjust delay if needed
});
