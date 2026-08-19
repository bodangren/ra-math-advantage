import type { Metadata } from 'next';
import { ConvexClientProvider, AuthProvider } from '@math-platform/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Danielson Teacher Growth',
  description: 'Teacher proficiency evidence aligned to the Danielson Framework for Teaching.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
