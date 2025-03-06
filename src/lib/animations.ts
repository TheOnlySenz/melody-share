
import { useEffect, useRef, useState, CSSProperties } from 'react';

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface AnimationOptions {
  delay?: number;
  duration?: number;
  easing?: string;
  threshold?: number;
  once?: boolean;
}

export interface AnimationRef {
  ref: React.MutableRefObject<any>;
  style: CSSProperties;
}

const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const ref = useRef<any>(null);
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
  { threshold = 0.1, delay = 0, duration = 600, easing = 'ease-out', once = true }: AnimationOptions = {}
): AnimationRef => {
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
  
  const style: CSSProperties = {
    opacity: shouldAnimate ? 1 : 0,
    transform: shouldAnimate ? 'none' : getTransform(),
    transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
    transitionDelay: `${delay}ms`,
  };
  
  return { ref, style };
};

export const useSequentialFadeIn = (
  count: number,
  delayIncrement: number = 100,
  direction: FadeDirection = 'up',
  options: AnimationOptions = {}
): AnimationRef[] => {
  return Array.from({ length: count }).map((_, i) => 
    useFadeIn(direction, { ...options, delay: (options.delay || 0) + delayIncrement * i })
  );
};
