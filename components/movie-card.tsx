'use client';

import React from 'react';
import Image from 'next/image';
import { MovieData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Clock, Calendar, AlertCircle, CheckCircle, XCircle, Film, User } from 'lucide-react';

interface MovieCardProps {
  movie: MovieData;
}

export function MovieCard({ movie }: MovieCardProps) {
  const rating = movie.rating;
  const ratingPercentage = (rating / 10) * 100;
  const [imageError, setImageError] = React.useState(false);

  const getRecommendation = () => {
    if (isNaN(rating)) {
      return null;
    }

    if (rating >= 8.0) {
      return {
        message: 'You should watch this movie right now!',
        variant: 'default' as const,
        icon: <CheckCircle className="h-4 w-4" />,
        className: 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400',
      };
    } else if (rating < 5.0) {
      return {
        message: 'Avoid this movie at all costs!',
        variant: 'destructive' as const,
        icon: <XCircle className="h-4 w-4" />,
        className: '',
      };
    } else {
      return {
        message: 'This movie has mixed reviews. Watch at your own discretion.',
        variant: 'default' as const,
        icon: <AlertCircle className="h-4 w-4" />,
        className: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400',
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <Card className="overflow-hidden h-[500px] w-full">
      <div className="flex flex-col md:flex-row h-full w-full">
        <div className="w-full md:w-[350px] md:min-w-[350px] md:max-w-[350px] relative h-64 md:h-full bg-muted flex-shrink-0 md:ml-6">
          <Image
            src={imageError ? '/placeholder-movie.jpg' : movie.poster}
            alt={`${movie.title} poster`}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              if (!imageError) {
                setImageError(true);
              }
            }}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-2xl font-bold line-clamp-2">{movie.title}</CardTitle>
              {!isNaN(rating) && rating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 text-lg px-3 py-1 flex-shrink-0">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {rating.toFixed(1)}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{movie.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{movie.runtime}</span>
              </div>
              {movie.rated && movie.rated !== 'Not Rated' && (
                <Badge variant="outline">{movie.rated}</Badge>
              )}
              <Badge variant="outline" className="capitalize">{movie.type}</Badge>
            </div>

            <div className="flex flex-col gap-2 text-sm mt-3">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Director: </span>
                  <span className="text-muted-foreground">{movie.director}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Film className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground">Genre: </span>
                  <span className="text-muted-foreground">{movie.genre}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            {!isNaN(rating) && rating > 0 && (
              <div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-semibold">Audience Score</span>
                  <span className="text-muted-foreground font-medium">{ratingPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      rating >= 8.0
                        ? 'bg-green-500'
                        : rating < 5.0
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{ width: `${ratingPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-base mb-2">Synopsis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">{movie.plot}</p>
            </div>

            {recommendation && (
              <Alert variant={recommendation.variant} className={`${recommendation.className}`}>
                {recommendation.icon}
                <AlertDescription className="font-medium">
                  {recommendation.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
