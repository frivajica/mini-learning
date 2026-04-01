import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Payload CMS",
  description:
    "A production-ready reference implementation for learning Payload CMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
