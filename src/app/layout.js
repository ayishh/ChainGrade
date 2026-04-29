/**
 * Root layout: fonts, global CSS, styled-components SSR registry, wallet provider.
 */
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/styledRegistry";
import { WalletProvider } from "@/lib/WalletContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GPA Recorder DApp",
  description: "Blockchain-based GPA recorder for students and sponsors",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>
          <WalletProvider>{children}</WalletProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
