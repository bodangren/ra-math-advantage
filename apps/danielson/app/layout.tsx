import type { Metadata } from "next";
import { ConvexClientProvider, AuthProvider } from "@math-platform/app-shell";
import { OrganizationBranding } from "@/components/organization-branding";
import { HDKWA_BRANDING, HDKWA_ORGANIZATION_NAME } from "@/lib/organization-branding";
import "./globals.css";

export const metadata: Metadata = {
  title: "Danielson Teacher Growth",
  description: "Teacher proficiency evidence aligned to the Danielson Framework for Teaching.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publicBranding = process.env.CONVEX_DEPLOYMENT?.startsWith("local:")
    ? HDKWA_BRANDING
    : undefined;
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AuthProvider>
            <OrganizationBranding
              publicBranding={publicBranding}
              publicOrganizationName={publicBranding ? HDKWA_ORGANIZATION_NAME : undefined}
            >
              {children}
            </OrganizationBranding>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
