import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KREN Wall — KREN 2026",
    template: "%s | KREN Wall",
  },
  description:
    "Bagikan momenmu dan jadilah bagian dari KREN Wall. KREN 2026 — ARE YOU NEXT? Expo kewirausahaan Politeknik Wilmar Bisnis Indonesia dan WBIIC.",
  keywords: ["KREN 2026", "KREN Wall", "WBI", "WBIIC", "entrepreneurship expo"],
  icons: {
    icon: "https://wbiic.wbi.ac.id/favicon.png",
  },
  openGraph: {
    title: "KREN Wall — KREN 2026",
    description: "Bagikan momenmu dan jadilah bagian dari KREN Wall.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f8a86",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
