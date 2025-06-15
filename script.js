// ======================
// Dashboard Functionality
// ======================
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

  // ======================
  // New Download Notification
  // ======================
  let lastKnownDownloadCount = localStorage.getItem('lastDownloadCount') || 0;
  const downloadAlert = document.getElementById('newDownloadAlert');
  const alertMessage = document.getElementById('alertMessage');
  const alertClose = document.querySelector('.alert-close');

  // Check for new downloads
  function checkNewDownloads() {
    fetch('downloads.html?t=' + new Date().getTime())
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const currentCount = doc.querySelectorAll('.update-item').length;
        
        if (currentCount > lastKnownDownloadCount && lastKnownDownloadCount > 0) {
          const newItemsCount = currentCount - lastKnownDownloadCount;
          showNewDownloadAlert(newItemsCount);
        }
        lastKnownDownloadCount = currentCount;
        localStorage.setItem('lastDownloadCount', currentCount);
      })
      .catch(err => console.log('Download check error:', err));
  }

// Load Telegram Widget
function loadTelegramWidget() {
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.async = true;
  script.setAttribute('data-telegram-discussion', 'DARKSIDE_762'); // Your channel
  script.setAttribute('data-comments-limit', '5'); // Show 5 messages
  script.setAttribute('data-colorful', '1'); // Colorful mode
  script.setAttribute('data-height', '400'); // Widget height
  script.setAttribute('data-dark', '1'); // Dark mode
  document.getElementById('telegram-widget').appendChild(script);
}

// Call when page loads
document.addEventListener('DOMContentLoaded', loadTelegramWidget);

  // Show notification
  function showNewDownloadAlert(count) {
    alertMessage.textContent = `${count} new ${count > 1 ? 'downloads' : 'download'} available!`;
    downloadAlert.classList.add('show');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      downloadAlert.classList.remove('show');
    }, 10000);
  }

  // Close notification
  alertClose.addEventListener('click', () => {
    downloadAlert.classList.remove('show');
  });

  // Check every 5 minutes + on page load
  checkNewDownloads();
  setInterval(checkNewDownloads, 300000); // 5 minutes

  // ======================
  // Animations
  // ======================
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        if (entry.target.classList.contains('slide-up')) {
          entry.target.style.transform = 'translateY(0)';
        }
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

  // ======================
  // Button Effects
  // ======================
  const buttons = document.querySelectorAll('.btn, .download-btn, .alert-btn');
  
  buttons.forEach(btn => {
    // Shine effect on hover
    btn.addEventListener('mousemove', (e) => {
      const x = e.pageX - btn.getBoundingClientRect().left;
      const y = e.pageY - btn.getBoundingClientRect().top;
      
      btn.style.setProperty('--x', x + 'px');
      btn.style.setProperty('--y', y + 'px');
    });
    
    // Click effect
    btn.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);
    });
  });
});

// ======================
// Utility Functions
// ======================
function debounce(func, wait = 100) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}
