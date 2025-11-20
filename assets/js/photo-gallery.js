// Photo Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
  const galleries = document.querySelectorAll('.photo-gallery');
  
  galleries.forEach(function(gallery) {
    const track = gallery.querySelector('.gallery-track');
    const slides = gallery.querySelectorAll('.gallery-slide');
    const prevButton = gallery.querySelector('.gallery-prev');
    const nextButton = gallery.querySelector('.gallery-next');
    const dots = gallery.querySelectorAll('.gallery-dot');
    
    if (!track) return;
    if (slides.length <= 1) {
      console.log('Gallery has only 1 slide, skipping initialization');
      return;
    }
    console.log(`Initializing gallery with ${slides.length} slides`);
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function updateGallery() {
      const translateX = -currentSlide * 100;
      track.style.transform = `translateX(${translateX}%)`;
      
      // Update dots
      dots.forEach((dot, index) => {
        if (index === currentSlide) {
          dot.classList.add('bg-opacity-100');
          dot.classList.remove('bg-opacity-50');
        } else {
          dot.classList.remove('bg-opacity-100');
          dot.classList.add('bg-opacity-50');
        }
      });
      
      // Update photo counter if present
      const counter = gallery.querySelector('.gallery-counter .gallery-current');
      if (counter) {
        counter.textContent = currentSlide + 1;
      }
      
      // Position counter to align with caption first line (same distance as caption from photo)
      const counterElement = gallery.querySelector('.gallery-counter');
      if (counterElement && slides[currentSlide]) {
        const currentSlideElement = slides[currentSlide];
        const image = currentSlideElement.querySelector('img');
        if (image) {
          // Get the relative container (parent of gallery-container)
          const relativeContainer = gallery.querySelector('.relative');
          if (relativeContainer) {
            const imageRect = image.getBoundingClientRect();
            const containerRect = relativeContainer.getBoundingClientRect();
            
            // Calculate image bottom relative to the relative container top
            const imageBottomRelative = imageRect.bottom - containerRect.top;
            
            // Caption has mt-2 (0.5rem = 8px), so counter should be at same vertical position
            const captionMargin = 8; // 0.5rem = 8px
            counterElement.style.top = `${imageBottomRelative + captionMargin}px`;
          }
        }
      }
      
      // Show/hide navigation buttons
      if (prevButton) {
        prevButton.style.opacity = currentSlide === 0 ? '0.3' : '1';
        prevButton.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
      }
      if (nextButton) {
        nextButton.style.opacity = currentSlide === totalSlides - 1 ? '0.3' : '1';
        nextButton.style.pointerEvents = currentSlide === totalSlides - 1 ? 'none' : 'auto';
      }
    }
    
    function goToSlide(index) {
      if (index < 0 || index >= totalSlides) return;
      currentSlide = index;
      updateGallery();
    }
    
    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1);
      }
    }
    
    function prevSlide() {
      if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
    }
    
    // Event listeners
    if (nextButton) {
      nextButton.addEventListener('click', nextSlide);
    }
    if (prevButton) {
      prevButton.addEventListener('click', prevSlide);
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Keyboard navigation
    gallery.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });
    
    // Make gallery focusable for keyboard navigation
    gallery.setAttribute('tabindex', '0');
    
    // Initialize
    updateGallery();
  });
});

