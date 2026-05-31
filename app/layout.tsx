import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import TopNav from "@/components/top-nav";

export const metadata: Metadata = {
  title: "SmartTransit Jakarta Multi-Page Dashboard",
  description: "Operational dashboard, realtime monitoring, corridor detail, and developer hand-off"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
