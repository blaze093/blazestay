document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initAnimations();
    
    // Mobile Menu Toggle
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

// Mobile Menu Functions
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
            
            // Simulate loading delay
            setTimeout(() => {
                // Redirect to listings page with search parameters
                window.location.href = `listings.html?city=${city}&budget=${budget}`;
            }, 800);
        });
    }
}

// Testimonial Slider Functions
function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    
    if (testimonials.length > 0) {
        let currentTestimonial = 0;
        
        // Function to show a specific testimonial
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('active');
            });
            
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            testimonials[index].classList.add('active');
            dots[index].classList.add('active');
        }
        
        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentTestimonial = index;
                showTestimonial(currentTestimonial);
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
        
        header.addEventListener('click', () => {
            // Close all other accordion items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
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
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
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
                // Update main image
                const imgSrc = thumb.querySelector('img').getAttribute('src');
                mainImage.setAttribute('src', imgSrc);
                
                // Update active thumb
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
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
                }
            });
            
            // Check password match
            const password = form.querySelector('input[name="password"]');
            const confirmPassword = form.querySelector('input[name="confirm_password"]');
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                isValid = false;
                showFieldError(confirmPassword, 'Passwords do not match');
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
    toast.className = 'toast';
    
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info-circle'}"></i>
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
        toast.remove();
    });
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
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
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
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

