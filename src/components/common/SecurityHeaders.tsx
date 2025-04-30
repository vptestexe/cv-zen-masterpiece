
import { useEffect } from "react";

const SecurityHeaders = () => {
  useEffect(() => {
    // Only check in development mode
    if (import.meta.env.DEV) {
      // Check if we're running on Netlify with the proper headers
      const isNetlify = window.location.hostname.includes('netlify.app');
      const hasSecurityHeaders = 
        document.querySelector('meta[http-equiv="Content-Security-Policy"]') ||
        (typeof window !== 'undefined' && 
          (window.location.protocol === 'https:' || window.location.hostname === 'localhost'));
      
      if (!hasSecurityHeaders && !isNetlify) {
        console.info("Security headers recommendation:");
        console.info("1. Content-Security-Policy - Add appropriate content security policy");
        console.info("2. X-XSS-Protection - Protect against XSS attacks");
        console.info("3. X-Content-Type-Options - Prevent MIME type sniffing");
        console.info("4. Referrer-Policy - Control referrer information");
        console.info("These headers are configured in netlify.toml for production.");
      }
    }
  }, []);
  
  return null;
};

export default SecurityHeaders;
