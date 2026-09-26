# Publishing contract

## Repository boundary

The repository root is `~/.codex/skills`. Everything tracked there is managed. Exclude:

- `.system/` and `.codex-system-skills.marker`
- plugin caches and generated installation snapshots
- `.DS_Store`, editor state, temporary files, and build caches
- credentials, private URLs, unpublished personal material, and machine-specific secrets

Do not infer ownership merely from a file being installed locally. Track a skill only when its authorship or redistribution terms are established.

## Taste evidence

Rank evidence in this order:

1. A user's correction, revert, or deliberate rewrite.
2. Repeated choices across independently authored skills.
3. Repository decisions and commit explanations.
4. Current inherited text.
5. General stylistic preference.

Prefer coherent principles supported by several observations. Do not crystallize a one-off workaround into a universal rule.

## Matt Pocock derivatives

The upstream is `https://github.com/mattpocock/skills`, licensed under MIT. Preserve its license notice. The public README must prominently credit Matt Pocock for the majority lineage of the initial collection, while explaining that this repository is an independently maintained, opinionated derivative.

For each adapted skill, retain enough provenance to identify the upstream repository and original skill name. If a skill is renamed, keep the old name in the provenance record. Pull upstream changes for comparison; adopt them selectively.

## Git contract

- Branch: `main`.
- Remote: `git@github.com:yujieteo/skills.git`.
- Public repository: `https://github.com/yujieteo/skills`.
- Schedule: daily at 04:00 Asia/Singapore.
- Direct push is authorized after all hard gates pass.
- Destructive edits are authorized after a recoverable pre-run checkpoint exists.

Use Git history as the recovery mechanism and audit trail. Never rewrite published history during an ordinary daily run.
