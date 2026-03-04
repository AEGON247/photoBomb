import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Upgraded to premium tech font
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhotoBomb AI",
  description: "Find your face in thousands of photos instantly using Machine Learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
