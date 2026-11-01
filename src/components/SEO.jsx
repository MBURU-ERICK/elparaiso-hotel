
import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  path = "",
}) {
  const siteName = "Elparaiso Hotel";
  const baseUrl = "https://elparaiso-hotel.vercel.app";
  const pageUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      <title>{title} | {siteName}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={pageUrl} />

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
