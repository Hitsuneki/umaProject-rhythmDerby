import { useState, useEffect } from 'react';

export function useSystemTime() {
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatSystemTime = (date: Date) => {
    return date.toISOString().replace('T', '_').substring(0, 19);
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return {
    systemTime,
    formatSystemTime,
    formatDisplayTime
  };
}
