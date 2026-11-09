import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      id="scrollToTop"
      className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-accent text-white border-none flex items-center justify-center cursor-pointer shadow-glow z-50 hover:bg-accent-hover hover:scale-110 active:scale-95 transition-all duration-300"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <i className="fa-solid fa-chevron-up"></i>
    </button>
  );
};

export default ScrollToTop;
