import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartTransit Jakarta Realtime Map Dashboard",
  description: "Realtime GPS, real map, feeder prediction, and traffic-aware ETA dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
