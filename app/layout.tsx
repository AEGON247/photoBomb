import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import { SplashScreen } from "@/components/ui/splash-screen";
import { GuidelinesModal } from "@/components/ui/guidelines-modal";
import { Footer } from "@/components/ui/footer";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-grotesk" });

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
      <body className={`${outfit.className} ${spaceGrotesk.variable} ${outfit.variable} selection:bg-primary selection:text-black font-sans`}>
        <SplashScreen>
          <GuidelinesModal />
          {children}
          <Footer />
        </SplashScreen>
      </body>
    </html>
  );
}
