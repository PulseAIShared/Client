import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '@/utils/navigation';

export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a section to scroll to after navigation
    const sectionToScrollTo = sessionStorage.getItem('scrollToSection');
    
    if (sectionToScrollTo && location.pathname === '/') {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        scrollToSection(sectionToScrollTo);
        sessionStorage.removeItem('scrollToSection');
      }, 100);
    } else {
      // Default behavior: scroll to top when navigating between pages
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [location.pathname]);

  return null;
};