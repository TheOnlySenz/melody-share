
import { useEffect, useRef, useState } from 'react';

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface AnimationOptions {
  threshold?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { ref, isIntersecting };
};

export const useFadeIn = (
  direction: FadeDirection = 'up',
  { threshold = 0.1, delay = 0, duration = 600, once = true }: AnimationOptions = {}
) => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const shouldAnimate = once ? isIntersecting && !hasAnimated : isIntersecting;
  
  useEffect(() => {
    if (isIntersecting && once && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isIntersecting, once, hasAnimated]);
  
  const getTransform = () => {
    if (direction === 'up') return 'translateY(20px)';
    if (direction === 'down') return 'translateY(-20px)';
    if (direction === 'left') return 'translateX(20px)';
    if (direction === 'right') return 'translateX(-20px)';
    return 'none';
  };
  
  const style = {
    opacity: shouldAnimate ? 1 : 0,
    transform: shouldAnimate ? 'none' : getTransform(),
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    transitionDelay: `${delay}ms`,
  };
  
  return { ref, style };
};

export const useSequentialFadeIn = (
  count: number,
  baseDelay: number = 100,
  direction: FadeDirection = 'up',
  options: AnimationOptions = {}
) => {
  return Array.from({ length: count }).map((_, i) => 
    useFadeIn(direction, { ...options, delay: baseDelay * i })
  );
};
