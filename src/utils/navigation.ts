export const scrollToSection = (sectionId: string) => {
  // Remove the # if it exists
  const id = sectionId.replace('#', '');
  
  // Find the element
  const element = document.getElementById(id);
  
  if (element) {
    // Smooth scroll to the element
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }
};

export const navigateToSection = (sectionId: string) => {
  // If we're already on the landing page, just scroll
  if (window.location.pathname === '/') {
    scrollToSection(sectionId);
    return;
  }
  
  // If we're on a different page, navigate to landing page first
  // Store the section to scroll to after navigation
  sessionStorage.setItem('scrollToSection', sectionId);
  window.location.href = `/${sectionId}`;
};