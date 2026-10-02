---
name: mac-agent-workstation
description: Set up a fresh Mac as the owner's agent workstation, with Homebrew, gh, Claude Code, Codex, herdr, the firstmate toolchain, and this skills repository. Use when provisioning or rebuilding a Mac for agent work, or when checking that a machine still matches that setup.
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

## 2. Homebrew

Install from [brew.sh](https://brew.sh) with its official one-line installer, then add `eval "$(/opt/homebrew/bin/brew shellenv)"` to `~/.zprofile` if the installer asks you to.

**Verify:** `brew --version` and `command -v brew` returns `/opt/homebrew/bin/brew`.

## 3. Base formulae and casks

```sh
brew install git gh jq node mise uv tmux stow
brew install --cask codex google-chrome
```

**Verify:** each of `gh jq node mise uv tmux stow codex` resolves with `command -v`, and `node --version` is 22 or newer.

## 4. Dotfiles

Clone the public dotfiles repository to its own directory and apply it with Stow, following its README section "Applying the configuration": back up, dry run, then apply.

```sh
git clone https://github.com/yujieteo/dotfiles.git ~/src/dotfiles
cd ~/src/dotfiles && stow -n -v -t ~ home vscode
```

Resolve every conflict the dry run reports, then rerun without `-n`. Leave `home/.config/gh/hosts.yml` out of the links if it holds anything but a keyring reference.

**Verify:** `~/src/dotfiles/scripts/check.sh` passes, and a new zsh starts without errors.

## 5. Python through mise

```sh
mise use -g python@3.14
```

Make sure `~/.zshrc` activates mise (`eval "$(mise activate zsh)"`); the dotfiles may already do this.

**Verify:** in a new shell, `mise ls` lists python 3.14 and `command -v python3` points under `~/.local/share/mise/installs/`.

## 6. GitHub authentication (provisional)

> Provisional until the owner's GitHub token audit is recorded. Update this step from that audit.

```sh
gh auth login
```

Choose github.com, SSH as the Git protocol, and let `gh` upload a new SSH key. Store the credential in the system keyring, not a plain-text file.

For any token you create by hand, such as a CI secret or an agent's token: use a fine-grained personal access token scoped to the repositories the task needs. Do not grant Administration or delete rights unless the task creates repositories.

**Verify:** `gh auth status` reports a keyring login and the `ssh` Git protocol, and `ssh -T git@github.com` greets you. Do not paste either output anywhere it is stored.

## 7. Agent harnesses

Install Claude Code with Anthropic's native installer, which puts `claude` in `~/.local/bin`:

```sh
curl -fsSL https://claude.ai/install.sh | bash
```

Codex came from the cask in step 3. Start each once and sign in interactively: `claude`, then `codex`.

**Verify:** `claude --version` and `command -v codex` both succeed. `codex --version` can hang on first run; `ls /opt/homebrew/Caskroom/codex` shows the installed version instead.

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
herdr integration install codex
```

**Verify:** `herdr --version` prints a version and `herdr integration status` shows `codex: current`.

## 10. Skills repository

Codex reads the clone directly:

```sh
git clone git@github.com:yujieteo/skills.git ~/.codex/skills
```

Claude Code does not read `~/.codex/skills`. Link the skills you want into `~/.claude/skills`, and never overwrite a directory that is already there:

```sh
mkdir -p ~/.claude/skills
for f in ~/.codex/skills/*/SKILL.md; do
  d=$(dirname "$f"); n=$(basename "$d")
  [ -e ~/.claude/skills/"$n" ] || ln -s "$d" ~/.claude/skills/"$n"
done
```

The reference machine does not link these yet; Claude Code there gets its skills from synced and project sources. Ask the owner before linking all of them.

**Verify:** `node ~/.codex/skills/skill-sharpening/scripts/verify-collection.mjs` exits 0. A new `codex` session lists `skills-router`. If you linked them, `ls -l ~/.claude/skills` shows them as links.

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
for c in brew git gh jq node npm mise uv tmux stow python3 claude codex \
         herdr treehouse no-mistakes gh-axi chrome-devtools-axi lavish-axi tasks-axi quota-axi; do
  printf '%-20s %s\n' "$c" "$(command -v "$c" || echo MISSING)"
done
gh auth status 2>&1 | grep -E 'Logged in|protocol' | sed -E 's/account [^ ]+/account <owner>/'
herdr integration status | grep -E '^(codex|claude):'
node ~/.codex/skills/skill-sharpening/scripts/verify-collection.mjs >/dev/null && echo "skills: ok"
(cd ~/src/firstmate && bin/fm-bootstrap.sh) | grep -v '^BOOTSTRAP_INFO' || echo "firstmate bootstrap: clean"
```

The run is done when no line says `MISSING`, gh shows a keyring login over `ssh`, codex is `current`, `skills: ok` prints, and the bootstrap is clean. Report any line that fails, by name.
