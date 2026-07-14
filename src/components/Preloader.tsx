import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsLoaded(true);
          setTimeout(onComplete, 1200); // Wait for exit animation
        }, 500);
      }
      setProgress(current);
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-[#050505] flex flex-col justify-between p-8 md:p-16"
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-[#f4f3ef] font-mono text-xs uppercase tracking-widest">Initialization</span>
            <span className="text-[#f4f3ef] font-mono text-xs uppercase tracking-widest">{progress}%</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                className="text-6xl md:text-8xl lg:text-[10rem] font-display text-[#f4f3ef] leading-[0.8] tracking-tighter"
              >
                NEXUS
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
                className="text-6xl md:text-8xl lg:text-[10rem] font-display text-[#8b7355] leading-[0.8] tracking-tighter italic"
              >
                LENDING
              </motion.h1>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
