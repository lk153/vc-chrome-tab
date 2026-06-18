# Store assets — Chrome Web Store submission

Drop raw screenshots here. Final assets must meet these specs before upload.

## Checklist

| Asset | Requirement | Status |
|---|---|---|
| Package | `apps/extension/vc-tabs-extension.zip` (`pnpm --filter @vctabs/extension package`) | ✅ ready |
| Icon 128×128 | PNG, in the package at `icons/icon128.png` | ✅ ready |
| Screenshots | **1280×800** or **640×400** PNG/JPEG, 1–5 images | ✅ `vc-tabs*-1280x800.png` (3, alpha-flattened) |
| Privacy policy URL | public URL hosting [`../PRIVACY.md`](../PRIVACY.md) | ⏳ host it (Gist/Pages) |
| Promo tile (optional) | 440×280 PNG | optional |

## Resize captures to 1280×800

macOS `sips` (built-in), run from this folder:

```bash
for f in *.png; do sips -z 800 1280 "$f" --out "${f%.png}-1280x800.png"; done
```

`sips -z` takes **height then width**. 2560×1600 → 1280×800 is an exact 2× downscale
(no cropping needed). Crop any white margin first if a capture was larger than the
browser viewport.

> This folder is for source captures; the resized `*-1280x800.png` files are what
> you upload under **Store listing → Screenshots**.
