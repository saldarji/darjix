// Inset modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create a single global modal if it doesn't exist
  let modal = document.getElementById('inset-global-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'inset-global-modal';
    modal.className = 'inset-modal hidden';
    modal.innerHTML = `
      <div class="inset-modal-content relative max-w-[95vw] max-h-[95vh] overflow-auto bg-white p-6">
        <button class="inset-modal-close absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-black text-white hover:bg-gray-800 transition-colors" aria-label="Close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="inset-modal-body"></div>
        <div class="inset-modal-caption text-sm text-gray-600 mt-4 italic text-center" style="display: none;"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const modalBody = modal.querySelector('.inset-modal-body');
  const modalCaption = modal.querySelector('.inset-modal-caption');
  const closeButton = modal.querySelector('.inset-modal-close');
  
  // Find all inset triggers
  const insetTriggers = document.querySelectorAll('.inset-trigger');
  
  insetTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      const container = trigger.closest('.inset-container');
      if (!container) return;
      
      // Get content from the wrapper
      const contentWrapper = trigger.querySelector('.inset-content-wrapper');
      const caption = trigger.querySelector('.inset-caption');
      
      if (contentWrapper) {
        // Clone the content to avoid removing it from the original
        modalBody.innerHTML = contentWrapper.innerHTML;
      }
      
      if (caption) {
        modalCaption.textContent = caption.textContent;
        modalCaption.style.display = 'block';
      } else {
        modalCaption.style.display = 'none';
      }
      
      // Show modal
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  });
  
  // Close modal functionality
  closeButton.addEventListener('click', function(e) {
    e.stopPropagation();
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scrolling
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scrolling
    }
  });
});

