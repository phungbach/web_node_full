import { useEffect, useState } from 'react';
import api from '../services/api';

export const defaultSeoSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  additionalType: 'https://schema.org/DrivingSchool',
  name: 'Học lái xe Tuyên Quang',
  url: 'https://hoclaixetq.com',
  logo: 'https://hoclaixetq.com/logo.svg',
  image: 'https://hoclaixetq.com/logo.svg',
  telephone: '+84987499141',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tuyên Quang',
    addressCountry: 'VN',
  },
  areaServed: 'Tuyên Quang',
}, null, 2);

const setMeta = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  element.setAttribute('content', content || '');
};

const setLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  element.setAttribute('rel', rel);
  element.setAttribute('href', href || '');
};

export const defaultSiteSettings = {
  siteName: 'Học lái xe Tuyên Quang',
  phone: '0987499141',
  zalo: '0987499141',
  email: 'info@hoclaixetq.com',
  address: 'Tuyên Quang, Việt Nam',
  facebook: '',
  logo: '',
  logoWidth: 180,
  logoHeight: 80,
  favicon: '',
  seoTitle: 'Học lái xe Tuyên Quang | Học ô tô, xe máy uy tín',
  seoDescription: 'Học lái xe ô tô B1, B2 và xe máy A1, A2 tại Tuyên Quang. Lộ trình rõ ràng, giáo viên tận tâm, tư vấn nhanh qua 0987499141.',
  seoKeywords: 'học lái xe Tuyên Quang, học lái xe B1, học lái xe B2, học lái xe A1, học lái xe A2, thi bằng lái xe Tuyên Quang',
  canonicalUrl: 'https://hoclaixetq.com',
  ogTitle: 'Học lái xe Tuyên Quang | B1, B2, A1, A2',
  ogDescription: 'Tư vấn học lái ô tô B1, B2 và xe máy A1, A2 tại Tuyên Quang. Gọi 0987499141 để được hỗ trợ.',
  ogImage: 'https://hoclaixetq.com/logo.svg',
  robotsIndex: true,
  robotsFollow: true,
  schemaJson: defaultSeoSchema,
  heroTitle: 'Học lái xe ô tô & xe máy tại Tuyên Quang',
  heroDescription: 'Tư vấn lộ trình, thủ tục và khóa học phù hợp với nhu cầu của bạn.',
};

function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api.get('/settings', { params: { t: Date.now() } })
      .then((response) => {
        if (isMounted && response.data?.data) {
          setSettings((current) => ({ ...current, ...response.data.data }));
        }
      })
      .catch(() => {
        // Public pages keep their defaults when the API is unavailable.
      })
      .finally(() => {
        if (isMounted) setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const title = settings.seoTitle || settings.siteName;
    const description = settings.seoDescription || settings.heroDescription;
    document.title = title;
    setMeta('meta[name="description"]', { name: 'description' }, description);
    setMeta('meta[name="keywords"]', { name: 'keywords' }, settings.seoKeywords);
    setMeta('meta[name="robots"]', { name: 'robots' }, `${settings.robotsIndex ? 'index' : 'noindex'},${settings.robotsFollow ? 'follow' : 'nofollow'}`);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, settings.ogTitle || title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, settings.ogDescription || description);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    setMeta('meta[property="og:image"]', { property: 'og:image' }, settings.ogImage || `${settings.canonicalUrl}/logo.svg`);
    if (settings.canonicalUrl) setLink('canonical', settings.canonicalUrl);

    const schemaId = 'global-seo-schema';
    let schemaScript = document.head.querySelector(`script[data-seo-id="${schemaId}"]`);
    if (settings.schemaJson) {
      try {
        if (!schemaScript) {
          schemaScript = document.createElement('script');
          schemaScript.type = 'application/ld+json';
          schemaScript.setAttribute('data-seo-id', schemaId);
          document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = settings.schemaJson;
      } catch {
        schemaScript?.remove();
      }
    } else {
      schemaScript?.remove();
    }

    let iconLink = document.querySelector('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }

    if (settings.favicon) {
      iconLink.href = settings.favicon;
    }
  }, [settings.siteName, settings.seoTitle, settings.seoDescription, settings.seoKeywords, settings.robotsIndex, settings.robotsFollow, settings.ogTitle, settings.ogDescription, settings.ogImage, settings.canonicalUrl, settings.schemaJson, settings.favicon, settings.heroDescription]);

  return { ...settings, isLoaded };
}

export default useSiteSettings;
