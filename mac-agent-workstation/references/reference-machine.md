# Reference machine

These values were read from the Mac that runs firstmate on 2026-10-02, using `--version`, `brew leaves`, `npm ls -g`, and file listings. No credentials were read. Treat each version as a floor. If a newer release breaks a step, record the last version that worked here.

This machine predates the flake: it was still set up with Homebrew and Stow. The "Installed by" column records how each tool got there, not how to install it now. On a new machine, the Nix flake in the private `yujieteo/dotfiles` repository installs what it declares; the tables show only versions and the tools the flake does not cover yet.

Platform: macOS 26.6, Apple silicon (arm64), zsh.

## Tools

| Tool | Version seen | Installed by | Location |
|---|---|---|---|
| Homebrew | current | brew.sh installer | `/opt/homebrew` |
| git | system | Xcode command-line tools, plus the `git` formula | `/usr/bin/git` first on `PATH` |
| gh | 2.101.0 | `brew install gh` | `/opt/homebrew/bin` |
| jq | system | macOS, plus the `jq` formula | `/usr/bin/jq` first on `PATH` |
| node | 26.10.0 | `brew install node` | `/opt/homebrew/bin` |
| mise | 2026.9.15 | `brew install mise` | `/opt/homebrew/bin` |
| python | 3.14.7 | `mise use -g python@3.14` | `~/.local/share/mise/installs/python/` |
| uv | 0.12.19 | `brew install uv` | `/opt/homebrew/bin` |
| tmux | current | `brew install tmux` | `/opt/homebrew/bin` |
| stow | current | `brew install stow` | `/opt/homebrew/bin` |
| bun | 1.4.2 | bun.sh installer (only `poteto-mode/scripts` needs it) | `~/.bun/bin` |
| Claude Code | 2.1.287 | native installer | `~/.local/bin/claude` |
| Codex | 0.159.0 | `brew install --cask codex` | `/opt/homebrew/bin/codex` |
| herdr | 0.9.3 | herdr.dev installer, self-updates with `herdr update` | `~/.local/bin/herdr` |
| treehouse | 3.1.0 | treehouse install script | `~/.local/bin/treehouse` |
| no-mistakes | 1.84.0 | no-mistakes install script | `~/.local/bin`, linked to `~/.no-mistakes/bin` |
| gh-axi | 0.1.35 | `npm install -g` | Homebrew node prefix |
| chrome-devtools-axi | 0.1.35 | `npm install -g` | Homebrew node prefix |
| lavish-axi | 0.1.79 | `npm install -g` | Homebrew node prefix |
| tasks-axi | 0.2.6 | `npm install -g` | Homebrew node prefix |
| quota-axi | 0.1.55 | `npm install -g` | Homebrew node prefix |

Firstmate's bootstrap sets these floors: no-mistakes 1.46.0, gh-axi 0.1.29, and lavish-axi 0.1.80. The reference machine's lavish-axi 0.1.79 is below that floor, so a fresh install should take the latest release. Herdr needs protocol 14 or newer.

Other casks on the machine that are not part of the agent setup: `google-chrome` (used by chrome-devtools-axi), `mactex` (only `generate-beamer-talk` needs it), and `visual-studio-code`.

## Configuration as found

- `gh`: logged in through the keyring, with `ssh` as the Git protocol.
- Codex: `~/.codex/skills` is an old second clone of `yujieteo/skills`. Codex now reads user skills from `~/.agents/skills`, so a new machine does not need that clone. `~/.codex/hooks.json` runs the herdr agent-state hook and the three axi SessionStart hooks.
- Claude Code: `~/.claude/settings.json` has SessionStart hooks for `lavish-axi`, `gh-axi`, and `chrome-devtools-axi`. `~/.claude/skills` holds only the no-mistakes skill and the synced skills. The repository is not linked there.
- herdr integrations: `codex` and `pi` are current. `claude` is not installed.
- Firstmate: cloned from `https://github.com/kunchenguid/firstmate` into `~/src/firstmate` and started as `claude` from that directory inside herdr. No `config/backend` file, because herdr is detected from `HERDR_ENV=1`.
- Dotfiles: an old Stow checkout of `yujieteo/dotfiles`. The repository is private and now holds a Nix flake that must be cloned to `~/dotfiles`; a new machine does not need Stow.
