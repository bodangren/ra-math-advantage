import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { HeaderSimple } from "@/components/header-simple";
import { Footer } from "@/components/footer";
import dynamic from "next/dynamic";
import "./globals.css";

const ConvexClientProvider = dynamic(() => import("@/components/ConvexClientProvider").then(m => ({ default: m.ConvexClientProvider })), {
  ssr: false,
});

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
        <ConvexClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <HeaderSimple />
              <main className="flex-1">{children}</main>
              <Footer />
            </ThemeProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
