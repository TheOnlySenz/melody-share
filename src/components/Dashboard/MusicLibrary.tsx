
import React, { useState } from 'react';
import { Search, Filter, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MusicCard, { Song } from '@/components/MusicCard';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFadeIn, useSequentialFadeIn } from '@/lib/animations';

// Mock data
const musicLibrary: Song[] = [
  {
    id: '1',
    title: 'Sunset Waves',
    artist: 'Ocean Dreams',
    genre: 'Lo-Fi',
    duration: '2:34',
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    audioUrl: 'https://example.com/audio1.mp3',
    isExclusive: true,
  },
  {
    id: '2',
    title: 'Urban Jungle',
    artist: 'City Lights',
    genre: 'Hip Hop',
    duration: '3:21',
    coverUrl: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    audioUrl: 'https://example.com/audio2.mp3',
  },
  {
    id: '3',
    title: 'Midnight Drive',
    artist: 'Synthwave Runner',
    genre: 'Synthwave',
    duration: '4:15',
    coverUrl: 'https://images.unsplash.com/photo-1603899968034-80a3937611ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    audioUrl: 'https://example.com/audio3.mp3',
    isExclusive: true,
  },
  {
    id: '4',
    title: 'Morning Coffee',
    artist: 'Cafe Vibes',
    genre: 'Jazz',
    duration: '3:42',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    audioUrl: 'https://example.com/audio4.mp3',
  },
  {
    id: '5',
    title: 'Electric Dreams',
    artist: 'Neon Future',
    genre: 'Electronic',
    duration: '3:18',
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    audioUrl: 'https://example.com/audio5.mp3',
  },
  {
    id: '6',
    title: 'Desert Wind',
    artist: 'Sands of Time',
    genre: 'Ambient',
    duration: '5:27',
    coverUrl: 'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
    audioUrl: 'https://example.com/audio6.mp3',
    isExclusive: true,
  },
];

const MusicLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  const headerAnimation = useFadeIn('up');
  const searchAnimation = useFadeIn('up', { delay: 100 });
  const cardAnimations = useSequentialFadeIn(musicLibrary.length, 75, 'up');

  // Filter music based on search term and genre filter
  const filteredMusic = musicLibrary.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = genreFilter === 'all' || song.genre.toLowerCase() === genreFilter.toLowerCase();
    
    return matchesSearch && matchesGenre;
  });

  // Sort music based on sortOrder
  const sortedMusic = [...filteredMusic].sort((a, b) => {
    if (sortOrder === 'newest') {
      return a.id > b.id ? -1 : 1; // Just using ID as a proxy for "newest" in this example
    } else if (sortOrder === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === 'artist') {
      return a.artist.localeCompare(b.artist);
    }
    return 0;
  });

  const handleSongUse = (song: Song) => {
    console.log('Using song:', song);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        ref={headerAnimation.ref}
        style={headerAnimation.style}
      >
        <div>
          <h1 className="text-3xl font-bold">Music Library</h1>
          <p className="text-muted-foreground">
            Browse and use licensed music for your YouTube Shorts
          </p>
        </div>
        <Button>
          <Music className="mr-2 h-4 w-4" />
          My Licensed Songs
        </Button>
      </div>
      
      {/* Search and filter */}
      <div 
        className="flex flex-col lg:flex-row gap-4"
        ref={searchAnimation.ref}
        style={searchAnimation.style}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or artist..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={genreFilter}
              onValueChange={setGenreFilter}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Lo-Fi">Lo-Fi</SelectItem>
                <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                <SelectItem value="Synthwave">Synthwave</SelectItem>
                <SelectItem value="Jazz">Jazz</SelectItem>
                <SelectItem value="Electronic">Electronic</SelectItem>
                <SelectItem value="Ambient">Ambient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select
            value={sortOrder}
            onValueChange={setSortOrder}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="artist">Artist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Music grid */}
      {sortedMusic.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedMusic.map((song, index) => (
            <div 
              key={song.id} 
              ref={cardAnimations[index].ref}
              style={cardAnimations[index].style}
            >
              <MusicCard song={song} onUse={handleSongUse} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium">No songs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicLibrary;
