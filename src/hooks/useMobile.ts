
import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    const checkMobileScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobileScreen();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobileScreen);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobileScreen);
  }, []);
  
  return isMobile;
};

export default useMobile;
