# web/public/images

Static imagery for the donor site. Bitmap hero/context photography is served
directly from third-party hosts via `next/image` (see `next.config.mjs`
`images.remotePatterns`) — this folder is for SVGs, icons, and anything we
control the copy of.

## Hero background (placeholder)

The homepage hero background in `components/homepage/Hero.tsx` points to:

```
https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=2400&q=80
```

That URL is a free-license photo sourced from [Unsplash](https://unsplash.com/license).
It's a placeholder — Dorothy is delivering field photography and we'll swap
when it arrives. When you replace it:

1. Save the new file into `web/public/images/hero.jpg` (or similar)
2. Update the `HERO_IMAGE` constant in `components/homepage/Hero.tsx` to
   `"/images/hero.jpg"`
3. Remove `images.unsplash.com` from `next.config.mjs` if no other page uses it

## Do not scrape

Do not copy photographs from `pilgrimafrica.org` or other Pilgrim assets
without explicit written permission. Use Unsplash/Pexels placeholders until
Dorothy's pack arrives.
