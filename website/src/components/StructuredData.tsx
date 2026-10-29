export default function StructuredData() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MCast",
    url: "https://mcast.fun",
    description:
      "MCast is a Minecraft plugin that connects YouTube streaming with Minecraft servers, showing live streaming status in-game.",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MCast",
    url: "https://mcast.fun",
    applicationCategory: "GameApplication",
    operatingSystem: "Java",
    description:
      "A Minecraft plugin that displays YouTube live streaming status on player nametags, connecting YouTube streamers with their Minecraft server communities.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}

