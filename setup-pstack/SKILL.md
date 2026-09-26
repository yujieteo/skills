---
name: setup-pstack
description: Configure the pstack workflow for the current agent host. Use when a user asks to set up pstack models, a pstack budget, or host-specific execution settings.
---

> Read [the pstack Codex runtime](../poteto-mode/references/codex-runtime.md) before acting on host-specific instructions.


# Setup pstack

Adapt pstack to the current host. Do not write Cursor configuration from Codex.

## Steps

### 1. Inspect the host

Read the current tool and model choices. Use only capabilities the host exposes. In Codex, collaboration tools and the current thread settings decide delegation and reasoning.

### 2. Choose the smallest useful policy

Keep the host defaults unless the user asks for a different tradeoff. Record a project-local preference only when the host has a supported configuration surface. Do not invent model names or configuration paths.

### 3. Verify the effect

Confirm that the chosen setting is readable by a new session or subagent. If this host lacks persistent per-role routing, say so and use the current session's supported model choices instead.
