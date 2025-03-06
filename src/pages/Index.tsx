
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Music, TrendingUp, DollarSign, Shield } from "lucide-react";
import { useFadeIn, useSequentialFadeIn } from "@/lib/animations";

const Index = () => {
  const heroAnimation = useFadeIn('up', { delay: 100 });
  const statsAnimation = useFadeIn('up', { delay: 300 });
  const featureItems = useSequentialFadeIn(3, 100, 'up', { delay: 500 });
  const ctaAnimation = useFadeIn('up', { delay: 800 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/60">
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center" ref={heroAnimation.ref} style={heroAnimation.style}>
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
              Revolutionary Music Licensing for Shorts
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Turn Your <span className="text-primary">YouTube Shorts</span> Into Income
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Unlock exclusive licensed music for your Shorts and earn a share of royalties.
              The perfect collaboration between musicians and content creators.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={statsAnimation.ref} style={statsAnimation.style}>
            <div className="bg-background p-6 rounded-lg shadow-sm text-center">
              <p className="text-4xl font-bold text-primary mb-2">1M+</p>
              <p className="text-muted-foreground">Active Creators</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm text-center">
              <p className="text-4xl font-bold text-primary mb-2">50K+</p>
              <p className="text-muted-foreground">Licensed Tracks</p>
            </div>
            <div className="bg-background p-6 rounded-lg shadow-sm text-center">
              <p className="text-4xl font-bold text-primary mb-2">$2M+</p>
              <p className="text-muted-foreground">Distributed in Royalties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="p-6 rounded-xl bg-background border border-border" ref={featureItems[0].ref} style={featureItems[0].style}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Licensed Music Library</h3>
              <p className="text-muted-foreground">
                Browse our extensive library of high-quality, fully licensed tracks perfect for your Shorts content.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-background border border-border" ref={featureItems[1].ref} style={featureItems[1].style}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance Analytics</h3>
              <p className="text-muted-foreground">
                Track your content performance, view detailed analytics, and understand your audience better.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-background border border-border" ref={featureItems[2].ref} style={featureItems[2].style}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Royalty Sharing</h3>
              <p className="text-muted-foreground">
                Earn a share of the royalties generated when your videos using our licensed music perform well.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10" ref={ctaAnimation.ref} style={ctaAnimation.style}>
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Monetize Your Shorts?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators already earning from their content with our licensed music.
            </p>
            <Button size="lg" asChild>
              <Link to="/dashboard">Access Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto text-center">
          <div className="inline-flex items-center justify-center p-4 mb-8 bg-muted rounded-full">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="font-medium">Trusted by Top YouTube Creators</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-70">
            {/* Placeholder for partner logos */}
            <div className="h-12 bg-muted rounded animate-pulse"></div>
            <div className="h-12 bg-muted rounded animate-pulse"></div>
            <div className="h-12 bg-muted rounded animate-pulse"></div>
            <div className="h-12 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
