import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viewport Guard — Known-Bad Fixture',
};

/**
 * Known-bad overflow fixture for the responsive/mobile viewport guard.
 *
 * The 200vw host deliberately triggers horizontal overflow so the guard
 * can prove it detects clipping regressions. This route is intentionally
 * public (no auth) so the Playwright viewport project can navigate to it
 * without seeding a session.
 */
export default function KnownBadOverflowFixturePage() {
  return (
    <div
      className="w-[200vw] h-20 bg-red-300 border-2 border-dashed border-red-800 box-border"
      data-testid="known-bad-overflow-host"
      aria-label="Known-bad overflow container"
    >
      width: 200vw — guard should fail here.
    </div>
  );
}
