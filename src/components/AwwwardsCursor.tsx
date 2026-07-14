import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { useSoundEffects } from '../hooks/useSoundEffects';

export const AwwwardsCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { playHoverSound, playClickSound } = useSoundEffects();

  // Smooth spring physics for the cursor
  const springX = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });
  const springY = useSpring(0, { stiffness: 500, damping: 28, mass: 0.5 });

  useEffect(() => {
    let lastHoverTarget: Element | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX);
      springY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isInteractable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('hover-target');

      if (isInteractable) {
        setIsHovering(true);
        // Only play hover sound if we entered a NEW interactable element
        const newTarget = target.closest('button, a, .hover-target') || target;
        if (newTarget !== lastHoverTarget) {
          playHoverSound();
          lastHoverTarget = newTarget;
        }
      } else {
        setIsHovering(false);
        lastHoverTarget = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('hover-target');

      if (isInteractable) {
        playClickSound();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
    };
  }, [springX, springY, playHoverSound, playClickSound]);

  // Hide the custom cursor if the user is using a touch device
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <motion.div
      className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
      style={{
        x: springX,
        y: springY,
      }}
    />
  );
};
