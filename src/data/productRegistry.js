// src/data/productRegistry.js
/**
 * @typedef {Object} Product
 * @property {string} id - Unique identifier (kebab-case)
 * @property {string} name - Display name (max 50 chars)
 * @property {string} description - Short description (max 160 chars)
 * @property {"tools"|"services"} category - Product category
 * @property {string} url - Relative or absolute URL
 * @property {string} icon - FontAwesome icon class
 * @property {"live"|"coming-soon"|"beta"} status - Product availability
 * @property {boolean} requiresSubscription - Whether gated behind paywall
 * @property {boolean} isExternal - Opens in new tab if true
 */

/** @type {Product[]} */
export const products = [
  {
    id: "website-packages",
    name: "Website Packages",
    description: "Industry-specific systems that get you found on Google, convert visitors to customers, and launch in days — not months.",
    category: "services",
    url: "/packages",
    icon: "fas fa-layer-group",
    status: "live",
    requiresSubscription: false,
    isExternal: false,
  },
  {
    id: "cs-reference-guide",
    name: "CS Reference Guide",
    description: "Interactive computer science reference with algorithms, data structures, and system design patterns.",
    category: "tools",
    url: "/tools/cs-reference",
    icon: "fas fa-book-open",
    status: "live",
    requiresSubscription: false,
    isExternal: false,
  },
  {
    id: "pdf-editor",
    name: "PDF Editor",
    description: "Browser-based PDF editing — merge, split, annotate, and convert documents without leaving your browser.",
    category: "tools",
    url: "/tools/pdf-editor",
    icon: "fas fa-file-pdf",
    status: "beta",
    requiresSubscription: false,
    isExternal: false,
  },
  {
    id: "basecamp-atlas",
    name: "Basecamp Atlas",
    description: "Intelligent apartment and retreat discovery with map views, filters, and neighborhood insights.",
    category: "tools",
    url: "/tools/basecamp",
    icon: "fas fa-map-marked-alt",
    status: "live",
    requiresSubscription: false,
    isExternal: false,
  },
];
