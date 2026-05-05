# Region Locator Map Credits

Generated locator maps in this directory are recoloured derivatives of source
files listed in `manifest.json`.

For every configured manifest entry, keep the following fields current before
committing generated PNGs:

- `commons`: Wikimedia Commons source filename.
- `sourceUrl`: the Commons file page or canonical source page.
- `credit`: author or attribution text from the Commons file page.
- `license`: source licence, such as `CC-BY-SA-3.0`, `CC-BY-SA-4.0`, or
  `Public domain`.

CC-BY-SA source files require the recoloured derivative to be shared under the
same licence. Public-domain files do not require attribution, but retaining the
source and credit fields keeps the build auditable.
