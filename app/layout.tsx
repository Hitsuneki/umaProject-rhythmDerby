'use client';

import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <head>
        <title>Uma Musume Racing Dashboard</title>
        <meta name="description" content="Futuristic anime racing dashboard with training and racing mechanics" />
      </head>
      <body className="antialiased dot-grid-bg spotlight-beam min-h-screen">
        {!isAuthPage && <Navigation />}
        <main className={!isAuthPage ? "pt-20 pb-12 px-6" : ""}>
          {!isAuthPage ? (
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </body>
    </html>
  );
}
