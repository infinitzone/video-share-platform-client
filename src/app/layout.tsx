import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./global.css";  // this file will include Tailwind + your design tokens

const roboto = Roboto({
  weight: ["400", "500", "700"],  // common weights
  subsets: ["latin"],
  variable: "--font-roboto",       // optional CSS variable
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dekho",
  description: "Share videos to the world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas-default text-fg-default">
        {children}
      </body>
    </html>
  );
}