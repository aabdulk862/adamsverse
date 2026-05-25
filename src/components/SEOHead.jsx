import { useEffect } from "react";

/**
 * SEOHead component — injects meta tags, JSON-LD structured data,
 * Open Graph tags, and Twitter Card tags into the document head.
 *
 * @param {{ products: import('../data/productRegistry').Product[] }} props
 *   products — array of Product objects filtered to "live" status
 */
export default function SEOHead({ products = [] }) {
  const siteUrl = "https://adversesolutions.com";
  const logoUrl = `${siteUrl}/logo.png`;
  const ogImageUrl = `${siteUrl}/banner.png`;

  // Title: 30-60 chars, contains "Adverse Solutions"
  const title = "Adverse Solutions — Digital Systems for Local Businesses";

  // Meta description: 120-160 chars, references ≥2 products
  const description =
    "Adverse Solutions builds Website Packages, CS Reference Guide, and digital systems for local businesses. Get found, convert customers, scale.";

  useEffect(() => {
    // --- Page Title ---
    document.title = title;

    // --- Meta Description ---
    setMeta("name", "description", description);

    // --- Open Graph Tags ---
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImageUrl);
    setMeta("property", "og:url", siteUrl);
    setMeta("property", "og:type", "website");

    // --- Twitter Card Tags ---
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImageUrl);

    // --- JSON-LD: ItemList ---
    const itemListId = "seo-jsonld-itemlist";
    const itemListScript = getOrCreateScript(itemListId);
    if (products.length > 0) {
      const itemListData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          description: product.description,
          url: product.url.startsWith("http")
            ? product.url
            : `${siteUrl}${product.url}`,
        })),
      };
      itemListScript.textContent = JSON.stringify(itemListData);
    } else {
      // No live products — remove the script if it exists
      itemListScript.textContent = "";
      itemListScript.remove();
    }

    // --- JSON-LD: Organization ---
    const orgId = "seo-jsonld-organization";
    const orgScript = getOrCreateScript(orgId);
    const orgData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Adverse Solutions",
      logo: logoUrl,
      url: siteUrl,
      sameAs: ["https://github.com/adverse-solutions"],
    };
    orgScript.textContent = JSON.stringify(orgData);

    // Cleanup on unmount
    return () => {
      removeMeta("name", "description");
      removeMeta("property", "og:title");
      removeMeta("property", "og:description");
      removeMeta("property", "og:image");
      removeMeta("property", "og:url");
      removeMeta("property", "og:type");
      removeMeta("name", "twitter:card");
      removeMeta("name", "twitter:title");
      removeMeta("name", "twitter:description");
      removeMeta("name", "twitter:image");

      const itemListEl = document.getElementById(itemListId);
      if (itemListEl) itemListEl.remove();
      const orgEl = document.getElementById(orgId);
      if (orgEl) orgEl.remove();
    };
  }, [products, title, description, ogImageUrl, siteUrl, logoUrl]);

  // This component renders nothing visible
  return null;
}

// --- Helper functions ---

/**
 * Sets or creates a <meta> tag in the document head.
 * @param {"name"|"property"} attrType - The attribute type (name or property)
 * @param {string} key - The attribute value (e.g., "description", "og:title")
 * @param {string} content - The content value
 */
function setMeta(attrType, key, content) {
  let el = document.querySelector(`meta[${attrType}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrType, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Removes a <meta> tag from the document head.
 */
function removeMeta(attrType, key) {
  const el = document.querySelector(`meta[${attrType}="${key}"]`);
  if (el) el.remove();
}

/**
 * Gets or creates a JSON-LD <script> tag by ID.
 */
function getOrCreateScript(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  return el;
}
