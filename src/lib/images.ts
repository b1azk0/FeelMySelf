const WP_HOST = 'https://www.feelmyself.pl';

/**
 * Resolves an image source to its delivery URL.
 *
 * Phase 1: proxies `wp-content/uploads/*` through the live WP origin.
 * Phase 3: swap to Cloudflare R2 + Cloudflare Images (one-line change).
 *
 * Architectural rule: every image reference goes through this function.
 * No raw <img src> to wp-content URLs in templates.
 */
export function resolveImageUrl(src: string): string {
  if (!src) return src;

  if (/^https?:\/\//.test(src)) {
    return src;
  }

  const normalized = src.replace(/^\//, '');

  if (normalized.startsWith('wp-content/uploads/')) {
    return `${WP_HOST}/${normalized}`;
  }

  return src.startsWith('/') ? src : `/${src}`;
}

/**
 * Remark plugin that rewrites image URLs in Markdown blog post bodies
 * through resolveImageUrl(). Ensures embedded `<img>` and `![]()` images
 * also flow through the abstraction.
 */
export function remarkResolveImages() {
  return (tree: unknown) => {
    visit(tree, (node: { type: string; url?: string; value?: string }) => {
      if (node.type === 'image' && typeof node.url === 'string') {
        node.url = resolveImageUrl(node.url);
      }
      if (node.type === 'html' && typeof node.value === 'string') {
        node.value = node.value.replace(
          /<img([^>]*?)src=["']([^"']+)["']/g,
          (_match, attrs: string, url: string) => `<img${attrs}src="${resolveImageUrl(url)}"`
        );
      }
    });
  };
}

function visit(node: unknown, fn: (n: { type: string; url?: string; value?: string }) => void) {
  if (node && typeof node === 'object') {
    fn(node as { type: string; url?: string; value?: string });
    const children = (node as { children?: unknown[] }).children;
    if (Array.isArray(children)) {
      for (const child of children) visit(child, fn);
    }
  }
}
