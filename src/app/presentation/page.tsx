import type { Metadata } from "next";
import { PresentationBoard } from "./presentation-board";

export const metadata: Metadata = {
  title: "Interview Presentation | Lo-Carb GGE Dashboard",
  description: "Interactive interview walkthrough for the Lo-Carb GGE Dashboard.",
};

export default function PresentationPage() {
  return <PresentationBoard />;
}
