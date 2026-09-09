/**
 * Site settings — structural config for developers.
 *
 * User-facing copy (practice name, contact, fees, nav labels, etc.) lives in
 * src/content-data/practice.json and is edited via /admin.
 *
 * File layout:
 *   site.ts              — merged config export (import from ../config)
 *   site.structural.ts   — developer-only settings (this file's source)
 *   site.internal.ts     — site logic used by pages
 *   site.types.ts        — TypeScript types
 */
import { mergeSiteConfig } from '../lib/content/merge-site';
import { structuralSiteConfig } from './site.structural';

export const siteConfig = mergeSiteConfig(structuralSiteConfig);
