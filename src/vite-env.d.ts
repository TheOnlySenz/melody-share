
/// <reference types="vite/client" />

// Type definitions for animation hooks
declare module '@/lib/animations' {
  import { MutableRefObject, CSSProperties } from 'react';

  export interface AnimationRef {
    ref: MutableRefObject<any>;  // Using 'any' here allows the ref to be assigned to any HTML element
    style: CSSProperties;
  }

  export interface AnimationOptions {
    delay?: number;
    duration?: number;
    easing?: string;
  }

  export function useFadeIn(
    direction?: 'up' | 'down' | 'left' | 'right' | 'none',
    options?: AnimationOptions
  ): AnimationRef;

  export function useSequentialFadeIn(
    count: number,
    delayIncrement: number,
    direction?: 'up' | 'down' | 'left' | 'right' | 'none',
    options?: AnimationOptions
  ): AnimationRef[];
}

