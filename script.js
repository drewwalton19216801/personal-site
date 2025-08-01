// --- JAVASCRIPT LOGIC ---
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    // Function to handle page switching
    function showPage(targetId) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show the target page
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update active state on nav links
        navLinks.forEach(link => {
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Add click event listeners to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default anchor link behavior
            const targetId = this.dataset.target;
            showPage(targetId);

            // Optional: Update URL hash without jumping
            if (history.pushState) {
                history.pushState(null, null, '#' + targetId);
            } else {
                location.hash = '#' + targetId;
            }
        });
    });

    // Show initial page based on URL hash or default to 'home'
    const initialPage = window.location.hash.substring(1) || 'home';
    showPage(initialPage);

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function () {
        const pageIdFromHash = window.location.hash.substring(1) || 'home';
        showPage(pageIdFromHash);
    });

    // Modal functionality for artwork
    const modal = document.getElementById('artworkModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalClose = document.querySelector('.modal-close');
    const artworkCards = document.querySelectorAll('.artwork-card');

    // Open modal when artwork card is clicked
    artworkCards.forEach(card => {
        card.addEventListener('click', function () {
            const img = this.querySelector('.artwork-thumbnail');
            const title = this.querySelector('.artwork-info h3').textContent;
            const description = this.querySelector('.artwork-info p').textContent;

            // Get image source (either from src or data-src for lazy loading)
            const imgSrc = img.src || img.getAttribute('data-src');
            modalImg.src = imgSrc;
            modalImg.alt = img.alt;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modal.style.display = 'block';

            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        });
    });

    // Close modal when clicking the close button
    modalClose.addEventListener('click', function () {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside the image
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // Apply the saved theme
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
    } else {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', function () {
        const currentTheme = body.getAttribute('data-theme');

        if (currentTheme === 'light') {
            // Switch to dark mode
            body.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        } else {
            // Switch to light mode
            body.setAttribute('data-theme', 'light');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        }
    });

    // Lazy Loading Implementation
    const lazyImages = document.querySelectorAll('.lazy-image');

    // Create intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Add loading class for skeleton effect
                img.classList.add('loading');

                // Load the image
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;

                    // Handle successful load
                    img.onload = () => {
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    };

                    // Handle load error
                    img.onerror = () => {
                        img.classList.remove('loading');
                        console.warn('Failed to load image:', src);
                    };
                }

                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        // Start loading when image is 100px away from viewport
        rootMargin: '100px 0px',
        threshold: 0.01
    });

    // Start observing all lazy images
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Fallback for browsers that don't support Intersection Observer
    if (!('IntersectionObserver' in window)) {
        lazyImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            }
        });
    }
});