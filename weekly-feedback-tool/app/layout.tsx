import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "./site-header";

export const metadata = {
  title: "Weekly Feedback Tool",
  description: "Weekly start / stop / continue retrospectives for projects",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
