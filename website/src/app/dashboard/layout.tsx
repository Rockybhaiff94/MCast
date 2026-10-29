import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Status Dashboard",
  description: "Look up linked Minecraft streamers and YouTube channel live broadcast status.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

