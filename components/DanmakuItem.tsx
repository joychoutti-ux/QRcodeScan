import React, { useEffect, useState } from 'react';
import { DanmakuItemProps } from '../types';

const DanmakuItem: React.FC<DanmakuItemProps> = ({ 
  id, 
  user, 
  text, 
  top, 
  duration, 
  onComplete,
  color 
}) => {
  const [start, setStart] = useState(false);

  useEffect(() => {
    // Trigger animation frame
    const timer = requestAnimationFrame(() => {
      setStart(true);
    });

    // Cleanup timer
    const cleanupTimer = setTimeout(() => {
      onComplete(id);
    }, duration * 1000);

    return () => {
      cancelAnimationFrame(timer);
      clearTimeout(cleanupTimer);
    };
  }, [id, duration, onComplete]);

  return (
    <div
      className="fixed whitespace-nowrap pointer-events-none z-20 flex items-center gap-3 px-4 py-2 rounded-full border border-opacity-30 bg-black/40 backdrop-blur-sm shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-transform ease-linear will-change-transform"
      style={{
        top: `${top}%`,
        left: '100%',
        transform: start ? `translateX(calc(-100vw - 100%))` : 'translateX(0)',
        transitionDuration: `${duration}s`,
        borderColor: color || '#00f3ff',
      }}
    >
      <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-gray-400 border-r border-gray-600 pr-3 mr-1">
        {user}
      </span>
      <span 
        className="font-orbitron font-medium text-lg md:text-2xl text-white drop-shadow-md"
        style={{ textShadow: `0 0 5px ${color || '#00f3ff'}` }}
      >
        {text}
      </span>
    </div>
  );
};

export default React.memo(DanmakuItem);
