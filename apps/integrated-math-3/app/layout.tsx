import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { HeaderSimple } from "@/components/header-simple";
import { Footer } from "@/components/footer";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Integrated Math 3",
  description: "An interactive textbook for Integrated Math 3.",
  authors: [{ name: "Daniel Bodanske" }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Skip to main content
        </a>
        <ConvexClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <HeaderSimple />
              <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
              </main>
              <Footer />
            </ThemeProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
