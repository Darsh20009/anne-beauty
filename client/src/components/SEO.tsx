import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export function SEO({ title, description, keywords }: SEOProps) {
  useEffect(() => {
    const siteName = "Anne Beauty | آن بيوتي";
    document.title = title ? `${title} - ${siteName}` : siteName;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "keywords");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", keywords);
    }
  }, [title, description, keywords]);

  return null;
}
