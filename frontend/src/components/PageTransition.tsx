import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <div className="relative w-full">
      {/* 500ms Vertical Curtain Wipe using the preloader curve [0.22, 1, 0.36, 1] */}
      <motion.div
        key={`curtain-${location.pathname}`}
        initial={{ scaleY: 1, originY: 0 }}
        animate={{ scaleY: 0, originY: 0 }}
        exit={{ scaleY: 1, originY: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--background)',
          borderBottom: '1px solid var(--accent)',
          zIndex: 90,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="w-full flex-grow flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
}
