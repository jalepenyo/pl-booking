import type { Metadata } from "next";
import BookingPage from "../components/BookingPage";

export const metadata: Metadata = {
  title: "Book a Demo to Win — PolicyLift",
  description:
    "Book a demo and win an all-inclusive trip to the Caribbean for 2. Learn how PolicyLift cuts quoting time in half.",
  openGraph: {
    title: "Book a Demo to Win — PolicyLift",
    description:
      "Win an all-inclusive trip to the Caribbean for 2. Book a 20-minute demo and enter to win.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Demo to Win — PolicyLift",
    description:
      "Win an all-inclusive trip to the Caribbean for 2. Book a 20-minute demo and enter to win.",
  },
};

export default function WinPage() {
  return (
    <BookingPage
      variant="win"
      kicker="BOOK A DEMO TO WIN"
      headline="Less time quoting, more time relaxing. Win an all-inclusive trip to the Caribbean for 2."
      subtext="Learn how PolicyLift can help increase your visibility, help manage your conversations, and cut quoting time in half."
      bgImage="/images/win-bg.png"
    />
  );
}
