import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizForge — IoT Exam Prep",
  description: "Upload your exam PDF and practice with timed quizzes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
