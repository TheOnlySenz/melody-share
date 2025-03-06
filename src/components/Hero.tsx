
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Music, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFadeIn } from '@/lib/animations';

const Hero: React.FC = () => {
  const headingAnimation = useFadeIn('up', { delay: 100 });
  const subheadingAnimation = useFadeIn('up', { delay: 200 });
  const ctaAnimation = useFadeIn('up', { delay: 300 });
  const imageAnimation = useFadeIn('up', { delay: 400 });

  return (
    <div className="relative pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 lg:pt-24 pb-12 md:pb-20 mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div 
            className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5"
            ref={headingAnimation.ref}
            style={headingAnimation.style}
          >
            <Music className="w-4 h-4 mr-1.5" />
            <span>Music for Creators</span>
          </div>
          
          {/* Heading */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            ref={headingAnimation.ref}
            style={headingAnimation.style}
          >
            Turn Your YouTube Shorts Into 
            <span className="text-primary"> Income</span>
          </h1>
          
          {/* Subheading */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            ref={subheadingAnimation.ref}
            style={subheadingAnimation.style}
          >
            Unlock exclusive licensed music for your Shorts and earn royalties. The perfect collaboration between musicians and content creators.
          </p>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            ref={ctaAnimation.ref}
            style={ctaAnimation.style}
          >
            <Link to="/auth?mode=register">
              <Button size="lg" className="px-6 gap-2">
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="px-6 gap-2">
                How It Works
                <Play className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero graphic */}
        <div 
          className="max-w-5xl mx-auto mt-8"
          ref={imageAnimation.ref}
          style={imageAnimation.style}
        >
          <div className="relative bg-gradient-to-br from-white to-secondary rounded-2xl shadow-elevated overflow-hidden border border-border p-6">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-bl-[100px]" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/10 rounded-tr-[80px]" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <div className="flex items-center gap-4 glass p-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Premium Music Library</h3>
                    <p className="text-sm text-muted-foreground">Licensed tracks ready for your content</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 glass p-4 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Track Your Earnings</h3>
                    <p className="text-sm text-muted-foreground">Real-time analytics and payouts</p>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="bg-white rounded-lg shadow-subtle overflow-hidden border border-border">
                <div className="h-8 bg-muted flex items-center px-4 border-b border-border">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="w-full h-64 bg-muted rounded animate-pulse opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
