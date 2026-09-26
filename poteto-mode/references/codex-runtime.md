# pstack on Codex

This collection adapts pstack's workflow to Codex. Apply this mapping whenever imported text names a Cursor-specific action.

- Use Codex collaboration tools when pstack says `Task`, `subagent_type`, or cloud worker. Delegate only when the current host exposes a suitable agent capability.
- Use a model or reasoning setting only when the current host lists it. Do not invent a model slug from a pstack example.
- Do not write `~/.cursor`, Cursor plugin files, or Cursor-only configuration from Codex. Use a supported Codex setting, automation, or project file when one exists.
- Use the current task's relative paths when pstack names `pstack/skills/...` paths.
- Treat Cursor commands such as `/loop`, Cursor control skills, and unavailable plugins as intent. Use a supported Codex automation, goal, terminal, or browser capability to meet that intent. If no equivalent exists, state the limitation and do not pretend the operation ran.

The pstack methods remain useful. The host-specific mechanism does not override Codex permissions, tools, or user authorization.
