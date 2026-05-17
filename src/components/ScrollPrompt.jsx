import React, { useEffect, useState, useRef } from "react";

export default function ScrollPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // Hide while scrolling
      setIsVisible(false);
      setIsIdle(false);
      
      // Clear previous timer
      if (idleTimer.current) clearTimeout(idleTimer.current);

      // Show after stop scrolling if not at the very end
      idleTimer.current = setTimeout(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = window.scrollY / maxScroll;
        
        if (progress < 0.98) {
          setIsVisible(true);
          setIsIdle(true);
        }
      }, 3000); // 3 seconds of idle time
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial timer for the very first appearance (only if user hasn't scrolled)
    idleTimer.current = setTimeout(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / maxScroll;
      if (progress < 0.98) {
        setIsVisible(true);
        setIsIdle(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Hide if we are at the very end.
  const maxScroll = typeof document !== 'undefined' ? document.documentElement.scrollHeight - window.innerHeight : 0;
  const progress = typeof window !== 'undefined' ? (maxScroll > 0 ? window.scrollY / maxScroll : 0) : 0;
  
  const opacity = isVisible && progress < 0.98 ? 1 : 0;

  return (
    <div 
      className="scroll-prompt"
      style={{ 
        opacity,
        pointerEvents: "none",
        transition: "opacity 0.6s ease-in-out"
      }}
    >
      <div className="scroll-prompt__content">
        <div className="scroll-prompt__icon">
          <div className="scroll-prompt__mouse">
            <div className="scroll-prompt__wheel" />
          </div>
          <div className="scroll-prompt__arrow" />
        </div>
      </div>
    </div>
  );
}
