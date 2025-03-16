import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Component to add pull-to-refresh functionality for mobile devices
const PullToRefresh = ({ onRefresh, threshold = 80, maxPull = 120, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      // Only enable pull to refresh when at the top of the page
      if (window.scrollY !== 0) return;
      
      startYRef.current = e.touches[0].clientY;
      currentYRef.current = startYRef.current;
      setIsPulling(true);
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      
      currentYRef.current = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(currentYRef.current - startYRef.current, maxPull));
      
      if (distance > 0) {
        // Prevent default scrolling behavior when pulling down
        e.preventDefault();
      }
      
      setPullDistance(distance);
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      
      if (pullDistance >= threshold) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(0);
        
        // Call the onRefresh callback
        if (onRefresh) {
          Promise.resolve(onRefresh())
            .finally(() => {
              setTimeout(() => {
                setIsRefreshing(false);
              }, 1000); // Minimum refresh time for UX
            });
        } else {
          // If no refresh callback, just reload the page
          window.location.reload();
        }
      } else {
        // Reset without refreshing
        setPullDistance(0);
      }
      
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, threshold, maxPull, onRefresh]);

  // Calculate progress percentage
  const progress = Math.min(100, (pullDistance / threshold) * 100);

  return (
    <Box ref={containerRef} sx={{ position: 'relative', height: '100%', overflow: 'visible' }}>
      {/* Pull indicator */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          transition: isPulling ? 'none' : 'height 0.2s ease-out',
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
        {(pullDistance > 0 || isRefreshing) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress
              size={30}
              thickness={5}
              variant={isRefreshing ? 'indeterminate' : 'determinate'}
              value={progress}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
              {isRefreshing ? 'جاري التحديث...' : pullDistance >= threshold ? 'اسحب للتحديث' : 'اسحب للأسفل للتحديث'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
          height: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefresh;
