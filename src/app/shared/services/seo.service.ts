import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  setDynamicMeta(config: SeoConfig) {
    this.titleService.setTitle(config.title);

    this.metaService.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'منصة السالم التعليمية' });
    
    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
      this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
      this.metaService.updateTag({ property: 'og:image:height', content: '630' });
      this.metaService.updateTag({ property: 'og:image:alt', content: config.title });
      this.metaService.updateTag({ name: 'twitter:image', content: config.image });
    }
    
    if (config.url) {
      this.metaService.updateTag({ property: 'og:url', content: config.url });
      this.setCanonicalUrl(config.url);
    }

    // Twitter
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
  }

  setCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.doc.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setHreflangTags(url: string) {
    const oldLinks = this.doc.head.querySelectorAll('link[rel="alternate"][hreflang]');
    oldLinks.forEach((el) => el.remove());

    const arLink = this.doc.createElement('link');
    arLink.setAttribute('rel', 'alternate');
    arLink.setAttribute('hreflang', 'ar');
    arLink.setAttribute('href', url);
    this.doc.head.appendChild(arLink);

    const xLink = this.doc.createElement('link');
    xLink.setAttribute('rel', 'alternate');
    xLink.setAttribute('hreflang', 'x-default');
    xLink.setAttribute('href', url);
    this.doc.head.appendChild(xLink);
  }

  setStructuredData(schemaObj: any, scriptId: string = 'dynamic-jsonld') {
    const oldScript = this.doc.getElementById(scriptId);
    if (oldScript) {
      oldScript.remove();
    }

    const script = this.doc.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaObj);
    this.doc.head.appendChild(script);
  }

  setBreadcrumbSchema(items: { name: string, url: string }[]) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
    this.setStructuredData(schema, 'breadcrumb-jsonld');
  }

  generateCourseSchema(details: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      "name": details.name,
      "description": details.description,
      "url": details.url,
      "image": [details.image],
      "provider": {
        "@type": "Organization",
        "name": "منصة السالم التعليمية",
        "url": "https://alssalem.com/",
        "logo": "https://alssalem.com/assets/imgs/logo2.webp"
      },
      "offers": {
        "@type": "Offer",
        "price": details.price || 0,
        "priceCurrency": "SAR",
        "availability": "https://schema.org/InStock",
        "url": details.url
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "instructor": {
          "@type": "Person",
          "name": details.instructorName
        }
      }
    };
  }
}
