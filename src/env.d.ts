/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GITHUB_OWNER?: string;
  readonly PUBLIC_GITHUB_REPO?: string;
  readonly PUBLIC_GITHUB_BRANCH?: string;
  /** Set to `true` or `1` to enable local on-site editing during `npm run dev`. Off by default. */
  readonly PUBLIC_ADMIN_LOCAL_EDITING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
