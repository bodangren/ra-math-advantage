/**
 * Layout wrapper for authentication pages, centering content in a constrained card.
 *
 * @returns {JSX.Element} The rendered auth layout JSX.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
