import { useState, useEffect } from 'react';

export const useRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleRefresh = () => {
      setIsRefreshing(true);
      // Simulate data refresh
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    };

    // Add pull-to-refresh event listener
    if ('PullToRefresh' in window) {
      window.PullToRefresh.addEventListener('refresh', handleRefresh);
    }

    return () => {
      if ('PullToRefresh' in window) {
        window.PullToRefresh.removeEventListener('refresh', handleRefresh);
      }
    };
  }, []);

  return { isRefreshing };
};
