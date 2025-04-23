document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Preloader
    setTimeout(function() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    // Mobile Menu Toggle with improved animation
    initMobileMenu();
    
    // Search Form Submission
    initSearchForm();
    
    // Testimonial Slider
    initTestimonialSlider();
    
    // Initialize accordions
    initAccordions();
    
    // Initialize tabs
    initTabs();
    
    // Initialize gallery
    initGallery();
    
    // Initialize form validations
    initFormValidations();
    
    // Initialize counter animation
    initCounters();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize back to top button
    initBackToTop();
    
    // Initialize parallax effect
    initParallax();
    
    // Initialize animations
    initAnimations();
    
    // Initialize dark mode toggle
    initDarkMode();
    
    // Initialize room filters
    initRoomFilters();
    
    // Initialize image upload preview
    initImageUploadPreview();
    
    // Initialize date pickers
    initDatePickers();
});

// Animation Functions
function initAnimations() {
    // Fade in elements as they come into view
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Add animation delay to stagger animations
    document.querySelectorAll('.features-grid .feature-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    document.querySelectorAll('.rooms-grid .room-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Mobile Menu Functions with improved animation
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    
    if (hamburger && mobileNav && overlay) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
            
            // Add animation to menu items
            if (mobileNav.classList.contains('active')) {
                document.querySelectorAll('.mobile-nav-links a').forEach((link, index) => {
                    link.style.animation = `fadeInRight 0.5s forwards ${0.3 + index * 0.1}s`;
                    link.style.opacity = '0';
                    link.style.transform = 'translateX(20px)';
                });
            } else {
                document.querySelectorAll('.mobile-nav-links a').forEach((link) => {
                    link.style.animation = 'none';
                });
            }
        });
        
        overlay.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }
}

// Search Form Functions
function initSearchForm() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading animation
            showLoading();
            
            const city = document.getElementById('city').value;
            const budget = document.getElementById('budget').value;
            
            // Add page transition effect
            const transition = document.createElement('div');
            transition.className = 'page-transition';
            document.body.appendChild(transition);
            
            // Trigger transition animation
            setTimeout(() => {
                transition.classList.add('active');
            }, 10);
            
            // Simulate loading delay and redirect
            setTimeout(() => {
                window.location.href = `listings.html?city=${city}&budget=${budget}`;
            }, 800);
        });
    }
}

// Testimonial Slider Functions with improved animation
function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    
    if (testimonials.length > 0) {
        let currentTestimonial = 0;
        
        // Function to show a specific testimonial with improved animation
        function showTestimonial(index) {
            // Hide current testimonial
            testimonials.forEach(testimonial => {
                if (testimonial.classList.contains('active')) {
                    testimonial.style.opacity = '0';
                    testimonial.style.transform = 'translateX(-50px)';
                    setTimeout(() => {
                        testimonial.classList.remove('active');
                    }, 300);
                }
            });
            
            // Update dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            dots[index].classList.add('active');
            
            // Show new testimonial with delay for animation
            setTimeout(() => {
                testimonials[index].classList.add('active');
            }, 300);
        }
        
        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (currentTestimonial !== index) {
                    currentTestimonial = index;
                    showTestimonial(currentTestimonial);
                }
            });
        });
        
        // Event listeners for prev/next buttons
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentTestimonial--;
                if (currentTestimonial < 0) {
                    currentTestimonial = testimonials.length - 1;
                }
                showTestimonial(currentTestimonial);
            });
            
            nextBtn.addEventListener('click', () => {
                currentTestimonial++;
                if (currentTestimonial >= testimonials.length) {
                    currentTestimonial = 0;
                }
                showTestimonial(currentTestimonial);
            });
        }
        
        // Auto slide testimonials every 5 seconds
        let testimonialInterval = setInterval(() => {
            currentTestimonial++;
            if (currentTestimonial >= testimonials.length) {
                currentTestimonial = 0;
            }
            showTestimonial(currentTestimonial);
        }, 5000);
        
        // Pause auto slide on hover
        const testimonialSlider = document.querySelector('.testimonial-slider');
        if (testimonialSlider) {
            testimonialSlider.addEventListener('mouseenter', () => {
                clearInterval(testimonialInterval);
            });
            
            testimonialSlider.addEventListener('mouseleave', () => {
                testimonialInterval = setInterval(() => {
                    currentTestimonial++;
                    if (currentTestimonial >= testimonials.length) {
                        currentTestimonial = 0;
                    }
                    showTestimonial(currentTestimonial);
                }, 5000);
            });
        }
    }
}

// Accordion Functions
function initAccordions() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        if (header) {
            header.addEventListener('click', () => {
                // Close all other accordion items
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const content = otherItem.querySelector('.accordion-content');
                        content.style.maxHeight = '0';
                    }
                });
                
                // Toggle current item with animation
                item.classList.toggle('active');
                const content = item.querySelector('.accordion-content');
                
                if (item.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = '0';
                }
            });
        }
    });
}

// Tab Functions
function initTabs() {
    const tabs = document.querySelectorAll('.dashboard-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.opacity = '0';
                c.style.transform = 'translateY(10px)';
            });
            
            // Add active class to current tab and content with animation
            tab.classList.add('active');
            const activeContent = document.getElementById(target);
            if (activeContent) {
                activeContent.classList.add('active');
                
                setTimeout(() => {
                    activeContent.style.opacity = '1';
                    activeContent.style.transform = 'translateY(0)';
                }, 50);
            }
        });
    });
}

// Gallery Functions
function initGallery() {
    const mainImage = document.querySelector('.main-image img');
    const thumbs = document.querySelectorAll('.thumb');
    
    if (mainImage && thumbs.length > 0) {
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                // Update active thumb
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                // Update main image with fade animation
                const imgSrc = thumb.querySelector('img').getAttribute('src');
                mainImage.style.opacity = '0';
                mainImage.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    mainImage.setAttribute('src', imgSrc);
                    mainImage.style.opacity = '1';
                    mainImage.style.transform = 'scale(1)';
                }, 300);
            });
        });
    }
}

// Form Validation Functions
function initFormValidations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Check required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, 'This field is required');
                    
                    // Add shake animation to invalid field
                    field.classList.add('shake');
                    setTimeout(() => {
                        field.classList.remove('shake');
                    }, 500);
                } else {
                    removeFieldError(field);
                }
            });
            
            // Check email format
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value.trim() && !isValidEmail(field.value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid email address');
                    
                    // Add shake animation to invalid field
                    field.classList.add('shake');
                    setTimeout(() => {
                        field.classList.remove('shake');
                    }, 500);
                }
            });
            
            // Check password match
            const password = form.querySelector('input[name="password"]');
            const confirmPassword = form.querySelector('input[name="confirm_password"]');
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                isValid = false;
                showFieldError(confirmPassword, 'Passwords do not match');
                
                // Add shake animation to invalid field
                confirmPassword.classList.add('shake');
                setTimeout(() => {
                    confirmPassword.classList.remove('shake');
                }, 500);
            }
            
            // If form is not valid, prevent submission
            if (!isValid) {
                e.preventDefault();
                showToast('Error', 'Please fix the errors in the form', 'error');
            } else if (form.classList.contains('demo-form')) {
                // For demo purposes, prevent actual submission and show success message
                e.preventDefault();
                showLoading();
                
                setTimeout(() => {
                    hideLoading();
                    showToast('Success', 'Form submitted successfully!', 'success');
                    form.reset();
                }, 1500);
            }
        });
    });
}

// Counter Animation
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    if (counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'));
                    const duration = 2000; // 2 seconds
                    const step = target / (duration / 16); // 60fps
                    
                    let current = 0;
                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    // Header scroll effect
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// Back to Top Button
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Parallax Effect
function initParallax() {
    const parallaxElements = document.querySelectorAll('.hero, .cta-image, .app-image');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            parallaxElements.forEach(element => {
                const scrollPosition = window.scrollY;
                const elementPosition = element.offsetTop;
                const distance = elementPosition - scrollPosition;
                
                if (distance < window.innerHeight && distance > -element.offsetHeight) {
                    const speed = element.classList.contains('hero') ? 0.5 : 0.2;
                    const yPos = -(distance * speed);
                    
                    // Only apply to elements with background-image
                    if (window.getComputedStyle(element).backgroundImage !== 'none') {
                        element.style.backgroundPositionY = `${yPos}px`;
                    }
                }
            });
        });
    }
}

// Dark Mode Toggle
function initDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    
    if (darkModeToggle) {
        // Check for saved theme preference or respect OS preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.classList.add('active');
        }
        
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            darkModeToggle.classList.toggle('active');
            
            // Save preference to localStorage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            
            // Add animation effect
            const ripple = document.createElement('div');
            ripple.className = 'dark-mode-ripple';
            document.body.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    }
}

// Room Filters
function initRoomFilters() {
    const filterForm = document.getElementById('filter-form');
    const roomCards = document.querySelectorAll('.room-card');
    
    if (filterForm && roomCards.length > 0) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const city = document.getElementById('filter-city').value;
            const budget = document.getElementById('filter-budget').value;
            const roomType = document.getElementById('filter-room-type').value;
            const gender = document.getElementById('filter-gender').value;
            
            // Show loading animation
            showLoading();
            
            // Simulate filtering delay
            setTimeout(() => {
                roomCards.forEach(card => {
                    let shouldShow = true;
                    
                    // Filter by city
                    if (city && !card.getAttribute('data-city').includes(city)) {
                        shouldShow = false;
                    }
                    
                    // Filter by budget
                    if (budget) {
                        const roomPrice = parseInt(card.getAttribute('data-price'));
                        const [min, max] = budget.split('-').map(Number);
                        
                        if (budget === '20000+') {
                            if (roomPrice < 20000) shouldShow = false;
                        } else if (roomPrice < min || roomPrice > max) {
                            shouldShow = false;
                        }
                    }
                    
                    // Filter by room type
                    if (roomType && card.getAttribute('data-room-type') !== roomType) {
                        shouldShow = false;
                    }
                    
                    // Filter by gender
                    if (gender && card.getAttribute('data-gender') !== gender && card.getAttribute('data-gender') !== 'any') {
                        shouldShow = false;
                    }
                    
                    // Apply filter with animation
                    if (shouldShow) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
                
                hideLoading();
                
                // Show message if no results
                const visibleCards = document.querySelectorAll('.room-card[style="display: block;"]');
                const noResults = document.querySelector('.no-results');
                
                if (visibleCards.length === 0) {
                    if (!noResults) {
                        const noResultsDiv = document.createElement('div');
                        noResultsDiv.className = 'no-results';
                        noResultsDiv.innerHTML = `
                            <div class="empty-state">
                                <div class="empty-icon">
                                    <i class="fas fa-search"></i>
                                </div>
                                <h3>No Rooms Found</h3>
                                <p>Try adjusting your filters to find more rooms.</p>
                                <button class="btn btn-primary reset-filters">Reset Filters</button>
                            </div>
                        `;
                        
                        const roomsGrid = document.querySelector('.rooms-grid');
                        roomsGrid.appendChild(noResultsDiv);
                        
                        // Add event listener to reset button
                        document.querySelector('.reset-filters').addEventListener('click', () => {
                            filterForm.reset();
                            filterForm.dispatchEvent(new Event('submit'));
                        });
                    }
                } else if (noResults) {
                    noResults.remove();
                }
            }, 800);
        });
        
        // Apply URL parameters as filters on page load
        const urlParams = getUrlParams();
        if (Object.keys(urlParams).length > 0) {
            // Set form values from URL parameters
            if (urlParams.city) {
                const citySelect = document.getElementById('filter-city');
                if (citySelect) citySelect.value = urlParams.city;
            }
            
            if (urlParams.budget) {
                const budgetSelect = document.getElementById('filter-budget');
                if (budgetSelect) budgetSelect.value = urlParams.budget;
            }
            
            // Trigger form submission to apply filters
            filterForm.dispatchEvent(new Event('submit'));
        }
    }
}

// Image Upload Preview
function initImageUploadPreview() {
    const imageUploads = document.querySelectorAll('.image-upload');
    
    imageUploads.forEach(upload => {
        const input = upload.querySelector('input[type="file"]');
        const preview = upload.querySelector('.image-preview');
        
        if (input && preview) {
            input.addEventListener('change', () => {
                if (input.files && input.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        preview.style.backgroundImage = `url('${e.target.result}')`;
                        preview.classList.add('has-image');
                        
                        // Add animation
                        preview.style.animation = 'scaleIn 0.3s ease forwards';
                    };
                    
                    reader.readAsDataURL(input.files[0]);
                }
            });
        }
    });
}

// Date Picker Initialization
function initDatePickers() {
    const datePickers = document.querySelectorAll('.date-picker');
    
    if (datePickers.length > 0 && typeof flatpickr !== 'undefined') {
        datePickers.forEach(picker => {
            flatpickr(picker, {
                dateFormat: "Y-m-d",
                minDate: "today",
                animate: true
            });
        });
    }
}

// Helper Functions
function showFieldError(field, message) {
    // Remove any existing error
    removeFieldError(field);
    
    // Add error class to field
    field.classList.add('error');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '5px';
    errorElement.style.animation = 'fadeIn 0.3s ease';
    
    // Insert error message after field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

function removeFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function showToast(title, message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.animation = 'slideInRight 0.5s ease forwards';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 500);
    });
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 500);
        }
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function showLoading() {
    // Remove any existing loading element
    hideLoading();
    
    // Create loading element
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner">
            <svg class="circular" viewBox="25 25 50 50">
                <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/>
            </svg>
        </div>
    `;
    
    document.body.appendChild(loading);
    
    // Add animation
    setTimeout(() => {
        loading.style.opacity = '1';
    }, 10);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.remove();
        }, 300);
    }
}

// Page transition effect
function pageTransition(url) {
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    
    // Trigger transition animation
    setTimeout(() => {
        transition.classList.add('active');
    }, 10);
    
    // Navigate to new page after animation completes
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

// Get URL parameters helper
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
        if (!pairs[i]) continue;
        
        const pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return params;
}

// Add CSS for animations
document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* Animation Keyframes */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        /* Loading Overlay */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            position: relative;
        }
        
        .circular {
            animation: rotate 2s linear infinite;
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
        
        .path {
            stroke: var(--primary-color);
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
            animation: dash 1.5s ease-in-out infinite;
            stroke-linecap: round;
        }
        
        @keyframes rotate {
            100% {
                transform: rotate(360deg);
            }
        }
        
        @keyframes dash {
            0% {
                stroke-dasharray: 1, 200;
                stroke-dashoffset: 0;
            }
            50% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -35;
            }
            100% {
                stroke-dasharray: 89, 200;
                stroke-dashoffset: -124;
            }
        }
        
        /* Toast Notifications */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .toast {
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            min-width: 300px;
            max-width: 400px;
            overflow: hidden;
        }
        
        .toast.success .toast-icon {
            background-color: #2ecc71;
        }
        
        .toast.error .toast-icon {
            background-color: #e74c3c;
        }
        
        .toast.info .toast-icon {
            background-color: #3498db;
        }
        
        .toast-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
        }
        
        .toast-content {
            flex: 1;
        }
        
        .toast-title {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .toast-message {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .toast-close {
            cursor: pointer;
            padding: 5px;
            color: var(--text-light);
            transition: color 0.3s ease;
        }
        
        .toast-close:hover {
            color: var(--text-color);
        }
        
        /* Page Transition */
        .page-transition {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--primary-color);
            z-index: 9999;
            transform: translateY(100%);
            transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
        }
        
        .page-transition.active {
            transform: translateY(0);
        }
        
        /* Dark Mode Ripple */
        .dark-mode-ripple {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9998;
            clip-path: circle(0% at var(--x, 50%) var(--y, 50%));
            animation: rippleEffect 1s ease forwards;
        }
        
        @keyframes rippleEffect {
            to {
                clip-path: circle(150% at var(--x, 50%) var(--y, 50%));
            }
        }
        
        /* Shake Animation for Form Validation */
        .shake {
            animation: shake 0.5s ease;
            border-color: #e74c3c !important;
        }
    </style>
`);

// Initialize everything when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // All initialization functions are called at the top of the file
    });
} else {
    // DOM already loaded, run initialization
    // All initialization functions are called at the top of the file
}