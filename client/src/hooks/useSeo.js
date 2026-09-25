import { useEffect } from 'react';

const ensureMeta = (selector, attributes = {}, content) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value) {
      element.setAttribute(key, value);
    }
  });

  if (content !== undefined) {
    element.setAttribute('content', content);
  }

  return element;
};

const ensureLink = (rel, href, attrs = {}) => {
  let link = document.head.querySelector(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement('link');
    document.head.appendChild(link);
  }

  link.setAttribute('rel', rel);
  link.setAttribute('href', href);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value) {
      link.setAttribute(key, value);
    }
  });

  return link;
};

const ensureScript = (id, json) => {
  let script = document.head.querySelector(`script[data-seo-id="${id}"]`);

  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-id', id);
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(json);
  return script;
};

function useSeo({ title, description, canonical, keywords = [], schema }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Học lái xe Tuyên Quang` : 'Học lái xe Tuyên Quang';
    document.title = fullTitle;

    ensureMeta('meta[name="description"]', { name: 'description' }, description || 'Học lái xe ô tô và xe máy tại Tuyên Quang.');
    ensureMeta('meta[name="keywords"]', { name: 'keywords' }, keywords.join(', '));
    ensureMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle);
    ensureMeta('meta[property="og:description"]', { property: 'og:description' }, description || 'Học lái xe ô tô và xe máy tại Tuyên Quang.');
    ensureMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, fullTitle);
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description || 'Học lái xe ô tô và xe máy tại Tuyên Quang.');

    if (canonical) {
      ensureLink('canonical', canonical);
    }

    if (schema) {
      ensureScript('local-business-schema', schema);
    }

    return () => {
      if (canonical) {
        const currentLink = document.head.querySelector('link[rel="canonical"]');
        if (currentLink) {
          currentLink.setAttribute('href', canonical);
        }
      }
    };
  }, [title, description, canonical, keywords, schema]);
}

export default useSeo;
