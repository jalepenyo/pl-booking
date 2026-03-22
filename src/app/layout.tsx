import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agency Grader — How Does Your Agency Stack Up Online?",
  description:
    "Free digital presence audit for insurance agencies. Get your score in 30 seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:wght@400;700&family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
