import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Uma Musume Racing Dashboard",
  description: "Futuristic anime racing dashboard with training and racing mechanics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased dot-grid-bg spotlight-beam min-h-screen">
        <Navigation />
        <main className="pt-20 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
