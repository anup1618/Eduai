import React, { useEffect, useState, useRef } from 'react';

interface MotionCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const MotionCounter: React.FC<MotionCounterProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 900,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef<number>(0);

  useEffect(() => {
    startValRef.current = displayValue;
    startTimeRef.current = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValRef.current + (value - startValRef.current) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return (
    <span className={`inline-block font-bold tracking-tight ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

