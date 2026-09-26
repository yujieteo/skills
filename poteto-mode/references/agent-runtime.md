# Run pstack on any agent host

Apply this mapping when imported pstack text names a product-specific action.

- Use the host's collaboration capability for `Task`, subagents, or cloud workers. Delegate only when the host exposes it.
- Use only models and reasoning settings that the current host lists.
- Store configuration in the active host's supported location. Do not write another product's private configuration directory.
- Resolve repository paths from the active skills directory.
- Treat unavailable commands, plugins, and control skills as intent. Use an equivalent host capability. If no equivalent exists, report the limitation.
- Read [runtime setup](runtime-setup.md) before Orchestrate or the GitHub paths in Babysit and Shipping. Those paths require the bundled helpers.

The method is portable across Claude, Codex, and Cursor. Host permissions and user authorization still apply.
