"use client"

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MovieData } from '@/lib/types';
import { MovieCard } from '@/components/movie-card';
import { Button } from '@/components/ui/button';

interface MovieListProps {
  displayedMovies: MovieData[];
  hasMore: boolean;
  onLoadMore: () => void;
  totalMovies: number;
  totalResults: number;
  totalPages: number;
}

export function MovieList({
  displayedMovies,
  hasMore,
  onLoadMore,
  totalMovies,
  totalResults,
  totalPages
}: MovieListProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    skipSnaps: false,
    containScroll: 'trimSnaps',
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      // Load more when approaching the end
      if (hasMore && emblaApi.selectedScrollSnap() >= displayedMovies.length - 3) {
        onLoadMore();
      }
    }
  }, [emblaApi, hasMore, onLoadMore, displayedMovies.length]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (displayedMovies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {selectedIndex + 1} out of {displayedMovies.length} movies
          {totalMovies < totalResults && ` (limited to ${totalPages} pages)`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext && !hasMore}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displayedMovies.map((movie) => (
            <div key={movie.imdbID} className="flex-[0_0_85%] min-w-0 px-4">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
