# Site integration (workflow steps 9 and 10)

Loaded from [SKILL.md](../SKILL.md) once the visualization HTML and data exist.

9. **In `yujieteo/site`, write or update `data/visuals/<slug>.yaml`:**
   ```yaml
   slug: <slug>
   title: ...
   summary: ...
   source_url: ...
   fetched: <ISO 8601 date>
   html_path: viz/<slug>/index.html   # relative to the visuals repo checkout
   data_path: data/<slug>/raw.csv     # relative to the visuals repo checkout
   webmcp_tools: [get_data, get_metadata, query]   # add any viz-specific tool
   ```
   Validate it against `schema/visualization.schema.json`. If the schema file
   doesn't exist yet, create it (JSON Schema for the fields above) before
   proceeding.

10. **Extend `scripts/build.py`** (one time, if not already done) to, on every
   run:
   - Read and validate every `data/visuals/*.yaml`.
   - Copy the referenced `html_path` (from the sibling `visuals` checkout)
     verbatim into `site/visuals/<slug>/index.html` — relocate only, never
     re-render.
   - Copy or convert the referenced `data_path` into
     `site/visuals/<slug>/data.json` (the always-working, headless-LLM-facing
     copy of the data, independent of WebMCP).
   - Regenerate `site/visuals/index.html` (human-facing gallery, in the site's
     existing template/header/footer style).
   - Regenerate `site/visuals.md` — one entry per visualization:
     ```
     ## <title>
     <one-line summary>
     - HTML: https://teoyujie.org/visuals/<slug>/index.html
     - Data: https://teoyujie.org/visuals/<slug>/data.json
     - Fetched: <date>
     - WebMCP tools: get_data, get_metadata, query[, <viz-specific tool>]
     ```
   - Append/refresh a `kind: "visualization"` record per stub into
     `site/corpus.json`:
     ```json
     {
       "id": "visualization:<slug>",
       "kind": "visualization",
       "title": "...",
       "summary": "...",
       "content": "...",
       "contentHtml": "<p>...</p>",
       "url": "visuals/<slug>/index.html",
       "tags": ["..."],
       "category": "...",
       "revision": "<content hash, same convention as other records>",
       "dataUrl": "visuals/<slug>/data.json",
       "fetched": "<ISO date>",
       "webmcpTools": ["get_data", "get_metadata", "query"]
     }
     ```
   - Ensure `site/llms.txt` has one line under "Main pages" pointing at
     `https://teoyujie.org/visuals.html` (add it once; do not duplicate on
     subsequent runs).
