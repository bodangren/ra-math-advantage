'use client';

import { useState } from 'react';
import { Play, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  videoUrl: string;
  duration: number;
  transcript?: string;
  thumbnailUrl?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  );
  return match?.[1] ?? null;
}

export function VideoPlayer({ videoUrl, duration, transcript }: VideoPlayerProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const youtubeId = getYouTubeId(videoUrl);
  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`
    : videoUrl;

  return (
    <div className="my-4 rounded-lg border border-l-4 border-l-red-500 overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Video */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={() => setVideoLoaded(true)} size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Load Video
              </Button>
            </div>
          )}
          {videoLoaded && (
            <iframe
              src={embedUrl}
              title="Video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Duration: {duration} minutes
        </div>

        {/* Transcript */}
        {transcript && (
          <div>
            <Button
              variant="outline"
              onClick={() => setTranscriptOpen(o => !o)}
              className="w-full flex items-center justify-between"
              aria-label="Toggle video transcript"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Video Transcript
              </span>
              {transcriptOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {transcriptOpen && (
              <div className="mt-3 bg-muted/30 p-4 rounded-lg border max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                  {transcript}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
