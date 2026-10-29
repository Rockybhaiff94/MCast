import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect YouTube Channel",
  description: "Link your YouTube channel to your Minecraft account with MCast.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

