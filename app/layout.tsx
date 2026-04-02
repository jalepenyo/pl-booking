import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book a Demo — PolicyLift",
  description:
    "See how PolicyLift connects your marketing, conversations, and quoting into one thread.",
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
          href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
