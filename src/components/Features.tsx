
import React from 'react';
import { Music, BarChart3, DollarSign, Shield, Youtube, Zap } from 'lucide-react';
import { useFadeIn, useSequentialFadeIn } from '@/lib/animations';

const featuresData = [
  {
    icon: <Music className="h-10 w-10 text-primary" />,
    title: 'Licensed Music Library',
    description: 'Access our exclusive collection of tracks specifically licensed for YouTube Shorts.',
  },
  {
    icon: <Youtube className="h-10 w-10 text-primary" />,
    title: 'YouTube Integration',
    description: 'Seamlessly connect your YouTube channel to track performance of videos using our music.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: 'Analytics Dashboard',
    description: 'Detailed insights into your content performance, views, and earnings from each video.',
  },
  {
    icon: <DollarSign className="h-10 w-10 text-primary" />,
    title: 'Revenue Sharing',
    description: 'Earn your share of royalties generated from the music used in your successful content.',
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: 'Fast Payments',
    description: 'Get paid monthly with transparent tracking of all your earnings and performance metrics.',
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: 'Copyright Protection',
    description: 'Create with confidence knowing all music is properly licensed and cleared for YouTube.',
  },
];

const Features: React.FC = () => {
  const headingAnimation = useFadeIn('up');
  const subheadingAnimation = useFadeIn('up', { delay: 100 });
  const featureAnimations = useSequentialFadeIn(featuresData.length, 100, 'up');

  return (
    <section className="section px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="container mx-auto">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            ref={headingAnimation.ref}
            style={headingAnimation.style}
          >
            Powerful Features for Creators
          </h2>
          <p 
            className="text-muted-foreground text-lg"
            ref={subheadingAnimation.ref}
            style={subheadingAnimation.style}
          >
            Everything you need to monetize your YouTube Shorts with licensed music
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-xl p-6 transition-all group hover:shadow-elevated card-hover"
              ref={featureAnimations[index].ref}
              style={featureAnimations[index].style}
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
