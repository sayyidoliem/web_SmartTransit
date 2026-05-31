import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartTransit Jakarta Dashboard",
  description: "AI-powered transit dashboard for feeder prediction and ETA monitoring"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
