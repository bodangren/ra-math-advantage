import Link from 'next/link';
import type { SourceVideo } from '@/content/learn/source-videos';
import { learnHref } from '@/lib/learn/href';

export function LearnSourceVideos({ videos, showTechniqueLinks = false }: {
  videos: readonly SourceVideo[];
  showTechniqueLinks?: boolean;
}) {
  if (videos.length === 0) return null;
  return (
    <section className="learn-source-videos" aria-labelledby="source-video-heading">
      <h2 id="source-video-heading">TLAC 3.0 video tutorials</h2>
      <p>Videos by Uncle Dan&apos;s Reading Advantage. Open a title to watch. If playback is unavailable, use the YouTube link.</p>
      {videos.map((video) => (
        <details key={video.id} open={videos.length === 1}>
          <summary>{video.title}</summary>
          {video.note ? <p>{video.note}</p> : null}
          <div className="learn-video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube (opens a new tab)</a></p>
          {showTechniqueLinks && video.techniqueId ? (
            <p><Link href={learnHref(video.techniqueId)}>Open the technique page</Link></p>
          ) : null}
        </details>
      ))}
    </section>
  );
}
