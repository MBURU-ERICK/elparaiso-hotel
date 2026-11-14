import { Helmet } from 'react-helmet-async';
import { hotelContacts } from '../data/contacts';
import { site, canonicalUrl, jsonLd } from '../config/site';

export default function SEO({ title, description, path = '/', noindex = false, canonical = true, image = '/images/hotel-room.jpg', imageAlt = 'A room at Elparaiso Hotel, Rumuruti' }) {
  const pageUrl = canonicalUrl(path);
  const pageTitle = `${title} | ${site.name}`;
  const imageUrl = new URL(image, site.origin).href;
  const hotelId = `${site.origin}/#hotel`;
  const websiteId = `${site.origin}/#website`;
  const primaryPhone = hotelContacts.find(contact => contact.label === 'Office')?.international;
  const hotel = {
    '@type': 'Hotel', '@id': hotelId, name: site.name, alternateName: site.alternateName,
    url: `${site.origin}/`, description: 'Hotel accommodation, restaurant dining, garden experiences, private stays, events and conferences in Rumuruti, Laikipia County, Kenya.',
    image: `${site.origin}/images/hotel-room.jpg`, logo: `${site.origin}/images/Logo%20elparaiso.png`,
    telephone: primaryPhone, email: site.email, address: site.address, hasMap: site.map,
    contactPoint: hotelContacts.map(contact => ({ '@type': 'ContactPoint', contactType: `${contact.label} enquiries`, telephone: contact.international })),
  };
  const graph = noindex ? [] : [
    hotel,
    { '@type': 'WebSite', '@id': websiteId, url: `${site.origin}/`, name: site.name, alternateName: site.alternateName, publisher: { '@id': hotelId }, inLanguage: 'en-KE' },
    { '@type': path === '/contact' ? 'ContactPage' : path === '/about' ? 'AboutPage' : 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: pageTitle, description, isPartOf: { '@id': websiteId }, about: { '@id': hotelId }, inLanguage: 'en-KE' },
  ];
  if (!noindex && path !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.origin}/` },
    { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
  ] });
  if (!noindex && path === '/restaurant') graph.push({ '@type': 'Restaurant', '@id': `${site.origin}/#restaurant`, name: site.alternateName, url: pageUrl, image: `${site.origin}/images/restaurant-dining.jpg`, telephone: primaryPhone, email: site.email, address: site.address, containedInPlace: { '@id': hotelId } });

  return <Helmet>
    <title>{pageTitle}</title>
    {path === '/' && import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim() && <meta name="google-site-verification" content={import.meta.env.VITE_GOOGLE_SITE_VERIFICATION.trim()} />}
    {path === '/' && import.meta.env.VITE_BING_SITE_VERIFICATION?.trim() && <meta name="msvalidate.01" content={import.meta.env.VITE_BING_SITE_VERIFICATION.trim()} />}
    <meta name="description" content={description} />
    <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
    {canonical && <link rel="canonical" href={pageUrl} />}
    {graph.length > 0 && <script type="application/ld+json">{jsonLd({ '@context': 'https://schema.org', '@graph': graph })}</script>}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={pageUrl} />
    <meta property="og:locale" content="en_KE" />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:alt" content={imageAlt} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    <meta name="twitter:image:alt" content={imageAlt} />
  </Helmet>;
}
