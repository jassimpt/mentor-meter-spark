import type { Metadata } from "next";
import { Providers } from "./providers";
import "../index.css"; // Ensure this path correctly points to your global css

export const metadata: Metadata = {
  title: "Mentor Meter — Track & Manage Your Mentorship Journey",
  description: "The all-in-one platform for mentors to log reviews, track payments, and generate professional reports.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/pwa-192x192.png",
    apple: "/pwa-192x192.png",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
