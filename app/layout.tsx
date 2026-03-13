import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MLS Listing Generator",
  description: "Turn property photos and details into polished MLS listings in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
