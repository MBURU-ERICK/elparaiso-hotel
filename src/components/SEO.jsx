import { hotelContacts } from '../data/contacts';

import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  path = "",
  noindex = false,
}) {
  const siteName = "Elparaiso Hotel";
  const baseUrl = "https://www.elparaisohotelltd.com";
  const pageUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      <title>{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta property="og:image" content={`${baseUrl}/images/Logo%20elparaiso.png`} />
      <meta property="og:image:alt" content="Elparaiso Hotel — Simply Amazing" />
      <meta name="twitter:image" content={`${baseUrl}/images/Logo%20elparaiso.png`} />
      <link rel="canonical" href={pageUrl} />

      {(path === "/" || path === "") && <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "Hotel", name: siteName, url: baseUrl, image: `${baseUrl}/images/Logo%20elparaiso.png`, telephone: hotelContacts.map(contact => contact.international), address: { "@type": "PostalAddress", addressLocality: "Rumuruti", addressRegion: "Laikipia", addressCountry: "KE" } }).replace(/</g, "\\u003c")}</script>}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={`${title} | ${siteName}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${siteName}`} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
