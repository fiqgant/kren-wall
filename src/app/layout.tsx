import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    "Bagikan momen kamu di acara KREN 2026. Foto dan komentar terbaik dipilih — tag @politeknikwbi dan @wbi_nexgenofe di Instagram untuk hadiah menarik. Expo kewirausahaan Politeknik Wilmar Bisnis Indonesia dan WBIIC.",
  keywords: ["KREN 2026", "KREN Wall", "WBI", "WBIIC", "entrepreneurship expo"],
  icons: {
    icon: "https://wbiic.wbi.ac.id/favicon.png",
  },
  openGraph: {
    title: "KREN Wall — KREN 2026",
    description: "Bagikan momen kamu di acara KREN 2026. Tag @politeknikwbi dan @wbi_nexgenofe untuk hadiah menarik.",
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
        <Analytics />
      </body>
    </html>
  );
}
