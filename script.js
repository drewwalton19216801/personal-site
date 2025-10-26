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

    // Blog functionality
    const blogGrid = document.getElementById('blogGrid');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const blogModal = document.getElementById('blogModal');
    const blogModalContent = document.getElementById('blogModalContent');
    const blogModalClose = document.querySelector('.blog-modal-close');
    
    let allPosts = [];
    let displayedPosts = 0;
    const postsPerLoad = 6; // Show 6 posts initially

    // Load blog posts
    async function loadBlogPosts() {
        try {
            // Fetch the posts manifest file
            const manifestResponse = await fetch('posts/posts.json');
            if (!manifestResponse.ok) {
                throw new Error('Failed to load posts manifest');
            }
            const manifest = await manifestResponse.json();
            const postFiles = manifest.posts;

            const posts = await Promise.all(
                postFiles.map(async (file) => {
                    try {
                        const response = await fetch(`posts/${file}`);
                        if (!response.ok) throw new Error(`Failed to load ${file}`);
                        return await response.json();
                    } catch (error) {
                        console.warn(`Could not load post: ${file}`, error);
                        return null;
                    }
                })
            );

            // Filter out failed loads and sort by date (newest first)
            allPosts = posts
                .filter(post => post !== null)
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            displayBlogPosts();
        } catch (error) {
            console.error('Error loading blog posts:', error);
            showBlogError();
        }
    }

    // Display blog posts
    function displayBlogPosts() {
        const loading = document.querySelector('.blog-loading');
        if (loading) {
            loading.remove();
        }

        const postsToShow = allPosts.slice(0, displayedPosts + postsPerLoad);
        displayedPosts = postsToShow.length;

        // Clear existing posts if this is the first load
        if (displayedPosts === postsToShow.length) {
            blogGrid.innerHTML = '';
        }

        postsToShow.forEach((post, index) => {
            if (index >= displayedPosts - postsPerLoad) {
                const postCard = createBlogCard(post);
                blogGrid.appendChild(postCard);
            }
        });

        // Show/hide "View All" button - only show if there are more than 6 posts total
        if (allPosts.length > 6 && displayedPosts < allPosts.length) {
            viewAllBtn.style.display = 'flex';
        } else {
            viewAllBtn.style.display = 'none';
        }
    }

    // Calculate dynamic read time based on content length
    function calculateReadTime(content) {
        // Remove HTML tags and count words
        const textContent = content.replace(/<[^>]*>/g, '');
        const wordCount = textContent.trim().split(/\s+/).length;
        // Average reading speed is 200-250 words per minute, using 225
        const readTimeMinutes = Math.ceil(wordCount / 225);
        return `${readTimeMinutes} min read`;
    }

    // Create blog card element
    function createBlogCard(post) {
        const card = document.createElement('div');
        card.className = `blog-card glass-container${post.featured ? ' featured' : ''}`;
        card.setAttribute('data-post-id', post.id);

        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate dynamic read time
        const dynamicReadTime = calculateReadTime(post.content);

        card.innerHTML = `
            <div class="blog-meta">
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                <span><i class="fas fa-clock"></i> ${dynamicReadTime}</span>
                <span><i class="fas fa-user"></i> ${post.author}</span>
            </div>
            <h3 class="blog-title">${post.title}</h3>
            <p class="blog-excerpt">${post.excerpt}</p>
            <div class="blog-category">${post.category}</div>
            <div class="blog-tags">
                ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
        `;

        // Add click event to open modal
        card.addEventListener('click', () => openBlogModal(post));

        return card;
    }

    // Open blog modal
    function openBlogModal(post) {
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate dynamic read time for modal
        const dynamicReadTime = calculateReadTime(post.content);

        blogModalContent.innerHTML = `
            <h1>${post.title}</h1>
            <div class="blog-modal-meta">
                <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                <span><i class="fas fa-clock"></i> ${dynamicReadTime}</span>
                <span><i class="fas fa-user"></i> ${post.author}</span>
                <span class="blog-category">${post.category}</span>
            </div>
            <div class="blog-tags">
                ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
            </div>
            <div class="blog-modal-content-body">
                ${post.content}
            </div>
        `;

        blogModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close blog modal
    function closeBlogModal() {
        blogModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Show error message
    function showBlogError() {
        const loading = document.querySelector('.blog-loading');
        if (loading) {
            loading.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load blog posts. Please try again later.</p>
            `;
        }
    }

    // Event listeners for blog modal
    if (blogModalClose) {
        blogModalClose.addEventListener('click', closeBlogModal);
    }

    if (blogModal) {
        blogModal.addEventListener('click', (event) => {
            if (event.target === blogModal) {
                closeBlogModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && blogModal.style.display === 'block') {
            closeBlogModal();
        }
    });

    // View All button event listener
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', displayBlogPosts);
    }

    // Load blog posts when page loads
    loadBlogPosts();
});