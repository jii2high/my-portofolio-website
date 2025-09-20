//=== CORE FUNCTIONALITY ===
// Footer year update
document.querySelectorAll('#year').forEach(n => n.textContent = new Date().getFullYear());

// Theme toggle (dark <-> light)
const root = document.documentElement;
const THEME_KEY = 'mf_theme';
const saved = localStorage.getItem(THEME_KEY);

// Apply saved theme
if (saved === 'light') { 
  root.classList.add('light'); 
}

// Theme toggle functionality
document.getElementById('themeToggle')?.addEventListener('click', () => {
  root.classList.toggle('light');
  const newTheme = root.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, newTheme);
  
  // Optional: Announce theme change for screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Theme changed to ${newTheme} mode`;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
});

//=== MOBILE NAVIGATION ===
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

// Mobile menu toggle
menuToggle?.addEventListener('click', () => {
  const isActive = nav.classList.contains('active');
  nav.classList.toggle('active');
  
  // Update button icon and aria-expanded
  const newIcon = isActive ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
  menuToggle.innerHTML = newIcon;
  menuToggle.setAttribute('aria-expanded', !isActive);
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = isActive ? '' : 'hidden';
});

// Close mobile menu when clicking nav links
nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!nav?.contains(e.target) && !menuToggle?.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close mobile menu with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('active')) {
    closeMobileMenu();
  }
});

function closeMobileMenu() {
  nav?.classList.remove('active');
  if (menuToggle) {
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}

//=== PROJECT MODAL FUNCTIONALITY ===
const projects = document.querySelectorAll('.project');
let modal = null;

if (projects.length) {
  // Create modal elements once
  modal = document.createElement('dialog');
  modal.className = 'card';
  modal.style.maxWidth = '560px';
  modal.style.width = 'min(92%, 560px)';
  modal.innerHTML = `
    <form method="dialog" style="margin:0; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
        <h3 id="modalTitle" style="color:var(--fg); margin: 0;">Judul</h3>
        <button type="button" class="modal-close" style="background: none; border: none; color: var(--muted); font-size: 24px; cursor: pointer; padding: 0;">&times;</button>
      </div>
      <p id="modalDesc" style="color:var(--muted); line-height: 1.6; margin-bottom: 16px;"></p>
      <p style="margin-bottom: 20px;"><b style="color:var(--fg)">Teknologi:</b> <span id="modalTech" style="color:var(--muted)"></span></p>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn" value="cancel">Tutup</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);

  // Show modal function
  const showModal = (el) => {
    modal.querySelector('#modalTitle').textContent = el.dataset.title || 'Detail';
    modal.querySelector('#modalDesc').textContent = el.dataset.desc || '';
    modal.querySelector('#modalTech').textContent = el.dataset.tech || '-';
    modal.showModal();
  };

  // Close modal function
  const closeModal = () => {
    modal.close();
  };

  // Event listeners for projects
  projects.forEach(el => {
    el.addEventListener('click', () => showModal(el));
    el.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showModal(el);
      }
    });
  });

  // Close modal when clicking X or backdrop
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Close modal with Escape key
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

//=== CONTACT FORM FUNCTIONALITY ===
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();
    const subject = (data.get('subject') || '').toString().trim();
    
    const status = document.getElementById('formStatus');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;

    // Reset previous status
    status.className = '';
    
    // Validation
    if (!name || !email || !message) {
      showFormStatus('Lengkapi semua kolom yang wajib diisi.', 'error');
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFormStatus('Format email tidak valid.', 'error');
      return;
    }

    // Message length validation
    if (message.length < 10) {
      showFormStatus('Pesan terlalu pendek, minimal 10 karakter.', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Mengirim...';
    showFormStatus('Mengirim pesan...', 'loading');
    
    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      // Success state
      showFormStatus('Pesan berhasil terkirim! Terima kasih sudah menghubungi.', 'success');
      form.reset();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        status.textContent = '';
        status.className = '';
      }, 5000);
      
    } catch (error) {
      showFormStatus('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });

  // Form status helper function
  function showFormStatus(message, type) {
    const status = document.getElementById('formStatus');
    status.textContent = message;
    status.className = `status-${type}`;
    
    // Add corresponding CSS
    if (!document.querySelector('#form-status-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'form-status-styles';
      styleSheet.textContent = `
        .status-success { color: var(--success); }
        .status-error { color: var(--error); }
        .status-loading { color: var(--muted); }
      `;
      document.head.appendChild(styleSheet);
    }
  }
}

//=== PROJECT FILTER FUNCTIONALITY ===
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project[data-category]');

if (filterBtns.length && projectCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter projects
      projectCards.forEach(card => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          // Animate in
          setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 100);
        } else {
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

//=== SCROLL ANIMATIONS ===
// Intersection Observer for fade-in animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe elements for animation
  document.querySelectorAll('.card, .hero-text, .hero-art, .page-header').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

// Initialize scroll animations if not reduced motion
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  initScrollAnimations();
}

//=== SKILL PROGRESS ANIMATION ===
function animateSkillBars() {
  const skillBars = document.querySelectorAll('.progress-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
          bar.style.width = width;
        }, 200);
        
        observer.unobserve(bar);
      }
    });
  });

  skillBars.forEach(bar => observer.observe(bar));
}

// Initialize skill bar animations
if (document.querySelectorAll('.progress-fill').length) {
  animateSkillBars();
}

//=== SMOOTH SCROLL FOR HASH LINKS ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      closeMobileMenu();
    }
  });
});

//=== PERFORMANCE OPTIMIZATIONS ===
// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Lazy load images when they come into view
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Initialize lazy loading
initLazyLoading();

//=== KEYBOARD NAVIGATION IMPROVEMENTS ===
// Improve focus management for modal
function trapFocusInModal(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
}

// Apply focus trapping to modal if it exists
if (modal) {
  trapFocusInModal(modal);
}

//=== FORM ENHANCEMENTS ===
// Auto-resize textarea
function autoResizeTextarea(textarea) {
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
}

// Apply auto-resize to textareas
document.querySelectorAll('textarea').forEach(textarea => {
  autoResizeTextarea(textarea);
});

// Form field validation feedback
function addFieldValidation() {
  const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');
  
  inputs.forEach(input => {
    // Real-time validation feedback
    input.addEventListener('blur', () => {
      validateField(input);
    });
    
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        validateField(input);
      }
    });
  });
}

function validateField(field) {
  const isValid = field.checkValidity();
  
  if (isValid) {
    field.classList.remove('invalid');
    field.classList.add('valid');
  } else {
    field.classList.remove('valid');
    field.classList.add('invalid');
  }
}

// Initialize field validation
addFieldValidation();

//=== UTILITY FUNCTIONS ===
// Copy to clipboard function
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        textArea.remove();
        resolve();
      } else {
        textArea.remove();
        reject();
      }
    });
  }
}

// Add copy functionality to contact info (if needed)
document.querySelectorAll('.contact li').forEach(item => {
  const emailMatch = item.textContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = item.textContent.match(/([\d-]+)/);
  
  if (emailMatch || phoneMatch) {
    item.style.cursor = 'pointer';
    item.title = 'Klik untuk copy';
    
    item.addEventListener('click', async () => {
      const textToCopy = emailMatch ? emailMatch[1] : phoneMatch[1];
      try {
        await copyToClipboard(textToCopy);
        // Show temporary feedback
        const originalText = item.innerHTML;
        item.innerHTML = item.innerHTML.replace(textToCopy, `<strong style="color: var(--success);">${textToCopy} (copied!)</strong>`);
        setTimeout(() => {
          item.innerHTML = originalText;
        }, 2000);
      } catch (err) {
        console.log('Copy failed:', err);
      }
    });
  }
});

//=== PROGRESSIVE ENHANCEMENT ===
// Enhanced animations for supported browsers
if (CSS.supports('backdrop-filter', 'blur(10px)')) {
  document.documentElement.classList.add('supports-backdrop-filter');
}

// Add classes for JS-enabled features
document.documentElement.classList.add('js-enabled');

//=== ERROR HANDLING ===
// Global error handler for better UX
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
  
  // Show user-friendly error message if needed
  if (e.error?.message?.includes('fetch')) {
    const status = document.getElementById('formStatus');
    if (status) {
      status.textContent = 'Koneksi bermasalah. Silakan coba lagi.';
      status.className = 'status-error';
    }
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault(); // Prevent default browser behavior
});

//=== DEVELOPMENT HELPERS ===
// Console welcome message (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log(`
    🚀 Muhammad Fajri's Website
    ===========================
    Built with vanilla HTML, CSS, and JavaScript
    Responsive design & modern web practices
    
    Developer: Muhammad Fajri
    GitHub: https://github.com/Jii4u
    
    Thanks for checking out the code! 🎉
  `);
}

//=== INITIALIZATION ===
// Run initialization functions when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Website initialized successfully!');
  
  // Optional: Add loading complete event
  window.dispatchEvent(new CustomEvent('websiteLoaded', {
    detail: { timestamp: Date.now() }
  }));
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}