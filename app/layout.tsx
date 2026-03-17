import type { Metadata } from "next";
import { Outfit } from "next/font/google"; 
import "./globals.css";
import { SplashScreen } from "@/components/ui/splash-screen";
import { GuidelinesModal } from "@/components/ui/guidelines-modal";
import { Footer } from "@/components/ui/footer";

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
      <body className={outfit.className}>
        <SplashScreen>
          <GuidelinesModal />
          {children}
          <Footer />
        </SplashScreen>
      </body>
    </html>
  );
}
