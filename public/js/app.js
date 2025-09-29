// EDMS Application JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initFormValidation();
    initLoadingStates();
    initFileUpload();
    initSearchEnhancements();
    initAnimations();
    initAnalytics();
});

// Vercel Analytics
function initAnalytics() {
    // Track page views
    if (window.va) {
        window.va('track', 'page_view');
    }

    // Track file uploads
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function () {
            if (this.files.length > 0 && window.va) {
                window.va('track', 'file_upload', {
                    file_type: this.files[0].type,
                    file_size: this.files[0].size
                });
            }
        });
    });

    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function () {
            if (window.va) {
                const formName = form.id || form.className || 'unknown_form';
                window.va('track', 'form_submit', {
                    form_name: formName
                });
            }
        });
    });

    // Track file downloads
    const downloadLinks = document.querySelectorAll('a[href*="/download/"]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.va) {
                window.va('track', 'file_download', {
                    file_name: this.textContent.trim()
                });
            }
        });
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });

            input.addEventListener('input', function () {
                clearFieldError(this);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Special validation for password confirmation
    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirm_pass"]');

    if (password && confirmPassword) {
        if (password.value !== confirmPassword.value) {
            showFieldError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }
    }

    // Email validation
    const email = form.querySelector('input[type="email"]');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }
    }

    // Phone validation
    const phone = form.querySelector('input[name="phone"]');
    if (phone && phone.value) {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!phoneRegex.test(phone.value)) {
            showFieldError(phone, 'Phone number must be in format: 123-456-7890');
            isValid = false;
        }
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);

    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--color-error)';
    errorDiv.style.fontSize = 'var(--font-size-sm)';
    errorDiv.style.marginTop = 'var(--space-1)';

    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Loading States
function initLoadingStates() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function () {
            const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                submitBtn.value = submitBtn.value || 'Processing...';
            }
        });
    });

    // Download links - no special handling needed
    // Downloads will work normally without status changes
}

// File Upload Enhancements
function initFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach(input => {
        input.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                // Show file info
                showFileInfo(file, this);

                // Validate file size (10MB limit)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    showFieldError(this, 'File size must be less than 10MB');
                    this.value = '';
                    return;
                }

                // Validate file type
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                    'image/jpeg',
                    'image/png',
                    'image/gif'
                ];

                if (!allowedTypes.includes(file.type)) {
                    showFieldError(this, 'File type not supported. Please upload PDF, DOC, DOCX, TXT, or image files.');
                    this.value = '';
                    return;
                }

                clearFieldError(this);
            }
        });
    });
}

function showFileInfo(file, input) {
    // Remove existing file info
    const existingInfo = input.parentNode.querySelector('.file-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    // Create file info display
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.style.marginTop = 'var(--space-2)';
    fileInfo.style.padding = 'var(--space-2)';
    fileInfo.style.background = 'var(--color-background-secondary)';
    fileInfo.style.borderRadius = 'var(--radius-md)';
    fileInfo.style.fontSize = 'var(--font-size-sm)';

    const size = (file.size / 1024).toFixed(1);
    fileInfo.innerHTML = `
        <strong>Selected:</strong> ${file.name}<br>
        <strong>Size:</strong> ${size} KB<br>
        <strong>Type:</strong> ${file.type}
    `;

    input.parentNode.appendChild(fileInfo);
}

// Search Enhancements
function initSearchEnhancements() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
        // Add search icon
        const searchContainer = searchInput.parentNode;

        const searchIcon = document.createElement('span');
        searchIcon.innerHTML = '🔍';
        searchIcon.className = 'search-icon';
        searchContainer.appendChild(searchIcon);

        // Clear search functionality
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.innerHTML = '✕';
        clearBtn.style.position = 'absolute';
        clearBtn.style.right = 'var(--space-3)';
        clearBtn.style.top = '50%';
        clearBtn.style.transform = 'translateY(-50%)';
        clearBtn.style.background = 'none';
        clearBtn.style.border = 'none';
        clearBtn.style.cursor = 'pointer';
        clearBtn.style.opacity = '0.5';
        clearBtn.style.display = searchInput.value ? 'block' : 'none';

        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            searchInput.focus();
            this.style.display = 'none';
        });

        searchInput.addEventListener('input', function () {
            clearBtn.style.display = this.value ? 'block' : 'none';
        });

        searchContainer.appendChild(clearBtn);
    }
}

// Animations
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-fade-in, .file-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.position = 'fixed';
    notification.style.top = 'var(--space-4)';
    notification.style.right = 'var(--space-4)';
    notification.style.padding = 'var(--space-3) var(--space-4)';
    notification.style.borderRadius = 'var(--radius-lg)';
    notification.style.color = 'white';
    notification.style.fontWeight = 'var(--font-weight-medium)';
    notification.style.zIndex = 'var(--z-tooltip)';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform var(--transition-normal)';

    switch (type) {
        case 'success':
            notification.style.background = 'var(--color-success)';
            break;
        case 'error':
            notification.style.background = 'var(--color-error)';
            break;
        case 'warning':
            notification.style.background = 'var(--color-warning)';
            break;
        default:
            notification.style.background = 'var(--color-primary)';
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
    .field-error {
        color: var(--color-error);
        font-size: var(--font-size-sm);
        margin-top: var(--space-1);
    }

    input.error {
        border-color: var(--color-error) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }

    .loading {
        position: relative;
        pointer-events: none;
    }

    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
