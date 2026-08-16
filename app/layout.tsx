import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "guest@shakib:~$",
  description:
    "Shakib Khan — Backend Developer & CEH v13 Certified Ethical Hacker. Interactive terminal portfolio.",
  authors: [{ name: "Shakib Khan", url: "https://github.com/shakib-SKRLS" }],
  openGraph: {
    title: "Shakib Khan — Terminal Portfolio",
    description:
      "Backend Developer · CEH v13 Certified · Interactive shell portfolio",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
