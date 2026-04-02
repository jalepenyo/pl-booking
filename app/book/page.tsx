import type { Metadata } from "next";
import BookingPage from "../components/BookingPage";

export const metadata: Metadata = {
  title: "Book a Demo — PolicyLift",
  description:
    "See how PolicyLift connects your marketing, conversations, and quoting into one thread — so your team closes more, faster.",
};

export default function BookPage() {
  return (
    <BookingPage
      variant="book"
      kicker="TALK TO US"
      headline="See the full journey from lead to bind"
      subtext="A 20-minute walkthrough of how PolicyLift connects your marketing, conversations, and quoting into one thread — so your team closes more, faster."
    />
  );
}
