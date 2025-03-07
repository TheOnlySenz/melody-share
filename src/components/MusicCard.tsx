
import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Share2, Plus, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  isExclusive?: boolean;
}

interface MusicCardProps {
  song: Song;
  onUse?: (song: Song) => void;
  isCompact?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, onUse, isCompact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Audio playback error:', error);
        toast.error('Unable to play audio. Please try again.');
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleUse = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      if (onUse) onUse(song);
      setIsLoading(false);
      toast.success(`Added "${song.title}" to your library`);
    }, 800);
  };

  const handleShare = () => {
    toast.success('Share link copied to clipboard');
  };

  return (
    <div 
      className={cn(
        "group relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated",
        isCompact ? "flex items-center" : "flex flex-col",
      )}
    >
      <audio 
        ref={audioRef} 
        src={song.audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      {/* Cover Image */}
      <div 
        className={cn(
          "relative overflow-hidden bg-muted",
          isCompact ? "w-24 h-24 flex-shrink-0" : "aspect-square w-full"
        )}
      >
        {song.coverUrl ? (
          <img 
            src={song.coverUrl} 
            alt={song.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <Music className="h-12 w-12 text-primary/40" />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={togglePlay}
        >
          <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110">
            {isPlaying ? (
              <Pause className="h-6 w-6 text-primary" />
            ) : (
              <Play className="h-6 w-6 text-primary ml-1" />
            )}
          </div>
        </div>
        
        {/* Exclusive Badge */}
        {song.isExclusive && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            Exclusive
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex flex-col",
        isCompact ? "flex-1 p-3" : "p-4"
      )}>
        <h3 className={cn(
          "font-semibold line-clamp-1",
          isCompact ? "text-sm" : "text-lg"
        )}>
          {song.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-1 mb-1">{song.artist}</p>
        
        <div className="flex items-center text-xs text-muted-foreground space-x-2 mb-3">
          <span className="px-2 py-0.5 bg-muted rounded-full">{song.genre}</span>
          <span>{song.duration}</span>
        </div>
        
        {!isCompact && (
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <Button size="sm" onClick={handleUse} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" /> Use
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicCard;
