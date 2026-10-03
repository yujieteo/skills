---
name: mac-agent-workstation
description: Set up a fresh Mac as the owner's agent workstation from the Nix flake in the private dotfiles repository, with gh, Claude Code, Codex, herdr, the firstmate toolchain, and this skills repository. Use when provisioning or rebuilding a Mac for agent work, or when checking that a machine still matches that setup.
---

# Mac agent workstation

Bring a fresh Apple-silicon Mac to the setup that runs firstmate. Work top to bottom and run each step's **Verify** command before moving on. Do not skip a failing check; fix it or stop and report it.

The versions and paths seen on the reference machine are in [references/reference-machine.md](references/reference-machine.md). Use them as floors, not pins.

Rules for the whole run:

- Never print, copy, or commit a token, key, or `hosts.yml`. Sign-ins are interactive and done by the owner.
- Ask before you replace an existing file in `$HOME`. Back it up first.
- The shell is zsh. Write `${VAR}` and `$(basename "$P")`, never `$P:t`.

## 1. Command-line tools

```sh
xcode-select --install
```

**Verify:** `xcode-select -p` prints a path, and `git --version` works.

## 2. Clone the dotfiles flake

The machine is declared by a Nix flake (nix-darwin and Home Manager) in the private `yujieteo/dotfiles` repository. The flake, not this skill, is the source of truth for packages, settings, and the casks that nix-darwin installs through Homebrew. Its `docs/setup.md` names the owner of each layer.

The repository is private, so anonymous HTTPS clones fail. Restore or create an SSH key first, add it to GitHub, and confirm `ssh -T git@github.com` names the owner's account. Then clone over SSH to `~/dotfiles`, the path the flake requires:

```sh
git clone git@github.com:yujieteo/dotfiles.git ~/dotfiles
```

**Verify:** `git -C ~/dotfiles remote get-url origin` prints the SSH URL, and `~/dotfiles/flake.nix` exists.

## 3. Bootstrap and activate the flake

```sh
bash ~/dotfiles/setup/mac.sh
```

The script installs Determinate Nix and Homebrew, runs the first `darwin-rebuild switch` against the flake, installs herdr, and clones this skills repository. Each step skips work that is already done, so rerun it after you fix a failure. Then open a new terminal.

Do not run `brew install` by hand: activation uninstalls any formula or cask that the flake does not list. Add packages to the flake and run `rebuild` instead. Generated files such as `~/.zshrc` and `~/.config/git/config` are read-only links into the Nix store; change the Nix source, not the file.

**Verify:** `command -v nix darwin-rebuild` resolves both, `darwin-version` prints the dotfiles commit, `~/dotfiles/scripts/check.sh` passes, and a new zsh starts without errors.

## 4. Tools from the flake

The flake installs the CLI tools, the coding agents it pins (`claude-code`, `codex`, `opencode`), and the mise configuration with Python 3.14.

**Verify:** each of `gh jq mise uv claude codex` resolves with `command -v` to a Nix path, and in a new shell `mise ls` lists python 3.14.

## 5. Tools the flake does not install yet

Check the flake first. For each tool below that it does not declare yet, install it with its own installer: `node` for the npm tools in step 8, and `tmux` if `~/.tmux.conf` is linked but the package is absent. Prefer adding the tool to the flake over a manual install.

**Verify:** `node --version` is 22 or newer.

## 6. GitHub authentication (provisional)

> Provisional until the owner's GitHub token audit is recorded. Update this step from that audit.

```sh
gh auth login
```

Choose github.com and SSH as the Git protocol. Use the SSH key from step 2; do not let `gh` upload another key. Store the credential in the system keyring, not a plain-text file.

For any token you create by hand, such as a CI secret or an agent's token: use a fine-grained personal access token scoped to the repositories the task needs. Do not grant Administration or delete rights unless the task creates repositories.

**Verify:** `gh auth status` reports a keyring login and the `ssh` Git protocol, and `ssh -T git@github.com` greets you. Do not paste either output anywhere it is stored.

## 7. Agent harnesses

Install Claude Code with Anthropic's native installer, which puts `claude` in `~/.local/bin`:

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

The flake also pins `claude-code`; the native installer gives a newer release. Codex comes from the flake. Start each once and sign in interactively: `claude`, then `codex login`.

**Verify:** `claude --version` and `command -v codex` both succeed.

## 8. Firstmate toolchain

These are the install commands firstmate's own bootstrap prints:

```sh
curl -fsSL https://kunchenguid.github.io/treehouse/install.sh | sh
curl -fsSL https://raw.githubusercontent.com/kunchenguid/no-mistakes/main/docs/install.sh | sh
npm install -g gh-axi && gh-axi setup hooks
npm install -g chrome-devtools-axi && chrome-devtools-axi setup hooks
npm install -g lavish-axi && lavish-axi setup hooks
npm install -g tasks-axi quota-axi
```

`setup hooks` adds a SessionStart hook for that tool to Claude Code and Codex.

**Verify:**

- `treehouse --version`, `no-mistakes --version`, and `--version` for each of `gh-axi chrome-devtools-axi lavish-axi tasks-axi quota-axi` print at least the floors in the reference file.
- `no-mistakes doctor` passes.
- `jq '.hooks.SessionStart' ~/.claude/settings.json` lists `gh-axi`, `chrome-devtools-axi`, and `lavish-axi`.

## 9. Herdr

Install herdr from [herdr.dev](https://herdr.dev). Firstmate needs protocol 14 or newer. Then install the agent-state integration for each harness you run inside herdr:

```sh
herdr integration install claude
herdr integration install codex
```

`setup/mac.sh` in step 3 already does this when herdr is missing.

**Verify:** `herdr --version` prints a version and `herdr integration status` shows `claude: current` and `codex: current`.

## 10. Skills repository

`setup/mac.sh` clones this repository to `~/src/skills`. If the flake pins it as an input and links the skills during activation, use those links and skip the manual links below. Edits then go to `~/src/skills`, followed by `nix flake update skills` and `rebuild`.

Codex and Pi read user skills from `~/.agents/skills`. Claude Code reads `~/.claude/skills`. Neither reads `~/.codex/skills`; do not clone a second copy there. Link the skills you want, and never overwrite an entry that is already there:

```sh
mkdir -p ~/.agents/skills ~/.claude/skills
for f in ~/src/skills/*/SKILL.md; do
  d=$(dirname "$f"); n=$(basename "$d")
  for t in ~/.agents/skills ~/.claude/skills; do
    [ -e "$t/$n" ] || ln -s "$d" "$t/$n"
  done
done
```

Ask the owner before linking all of them.

**Verify:** `node ~/src/skills/skill-sharpening/scripts/verify-collection.mjs` exits 0. A new `codex` session lists `skills-router`. `ls -l ~/.agents/skills ~/.claude/skills` shows the links.

## 11. Firstmate

```sh
git clone https://github.com/kunchenguid/firstmate ~/src/firstmate
```

Start herdr, open a pane, and launch the primary session from the checkout:

```sh
herdr
cd ~/src/firstmate && claude
```

Under herdr, firstmate detects the backend from `HERDR_ENV=1`, so no `config/backend` file is needed. On first start it lists missing tools and installs them only after you approve.

**Verify:** `cd ~/src/firstmate && bin/fm-bootstrap.sh` prints nothing, or prints only `BOOTSTRAP_INFO` lines. Any `MISSING` or `NEEDS_GH_AUTH` line means an earlier step is incomplete.

## 12. Final verification

Run this in a new terminal and keep the output as the record of the run. It prints versions and the auth mode only, with no credentials.

```sh
for c in nix darwin-rebuild brew git gh jq node npm mise uv tmux python3 claude codex \
         herdr treehouse no-mistakes gh-axi chrome-devtools-axi lavish-axi tasks-axi quota-axi; do
  printf '%-20s %s\n' "$c" "$(command -v "$c" || echo MISSING)"
done
gh auth status 2>&1 | grep -E 'Logged in|protocol' | sed -E 's/account [^ ]+/account <owner>/'
herdr integration status | grep -E '^(codex|claude):'
node ~/src/skills/skill-sharpening/scripts/verify-collection.mjs >/dev/null && echo "skills: ok"
(cd ~/src/firstmate && bin/fm-bootstrap.sh) | grep -v '^BOOTSTRAP_INFO' || echo "firstmate bootstrap: clean"
```

The run is done when no line says `MISSING`, gh shows a keyring login over `ssh`, claude and codex are `current`, `skills: ok` prints, and the bootstrap is clean. Report any line that fails, by name.
