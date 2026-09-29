# Deploy and verify (workflow steps 13 and 14)

Loaded from [SKILL.md](../SKILL.md) after the site build passes and the commits are pushed.

13. **Deploy** `yujieteo/site`'s generated output over SCP, following the exact
    pattern used by `publish-site-notes`:
    ```
    scp site/corpus.json <ssh-target>:<document-root>/<unique-corpus-temp-name>
    scp site/visuals/<slug>/index.html <ssh-target>:<document-root>/<unique-viz-temp-name>
    scp site/visuals/<slug>/data.json <ssh-target>:<document-root>/<unique-data-temp-name>
    scp site/visuals/index.html <ssh-target>:<document-root>/<unique-gallery-temp-name>
    scp site/visuals.md <ssh-target>:<document-root>/<unique-visualsmd-temp-name>
    scp site/llms.txt <ssh-target>:<document-root>/<unique-llmstxt-temp-name>   # only if changed
    ssh <ssh-target> '<verify all checksums; preserve current files; rename corpus.json first, then the rest>'
    ```
    Replace the placeholders at runtime. Do not commit their resolved values.
    Deploy `corpus.json` first, as in the existing skill.

14. **Verify**: compare local and remote checksums, then fetch the public HTTPS
    pages (`visuals/<slug>/`, `visuals/`, `visuals.md`, `corpus.json`, and
    `llms.txt` if changed) and confirm the new or refreshed visualization is
    served correctly. Restore the preserved prior files if any deployed
    artifact is corrupt or incomplete.
