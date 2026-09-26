#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ASSUME_YES=0
CHECK_ONLY=0

usage() {
	printf '%s\n' \
		'Usage: setup.sh [--yes] [--check]' \
		'' \
		'Install and verify the Poteto Mode Bun and TypeScript tools.' \
		'' \
		'  --yes    Install Bun without an interactive confirmation.' \
		'  --check  Verify the existing installation without changing it.'
}

while (($#)); do
	case "$1" in
		--yes) ASSUME_YES=1 ;;
		--check) CHECK_ONLY=1 ;;
		--help|-h) usage; exit 0 ;;
		*) printf 'error: unknown option %s\nhelp[1]: Run `%s --help`\n' "$1" "$0"; exit 2 ;;
	esac
	shift
done

case "$(uname -s)" in
	Darwin|Linux) ;;
	*)
		printf '%s\n' \
			'error: this script supports macOS, Linux, and WSL' \
			'help[1]: On native Windows, run `powershell -ExecutionPolicy Bypass -File .\setup.ps1`'
		exit 1
		;;
esac

if ! command -v bun >/dev/null 2>&1 && [[ -x "$HOME/.bun/bin/bun" ]]; then
	export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
	export PATH="$BUN_INSTALL/bin:$PATH"
fi

if ! command -v bun >/dev/null 2>&1; then
	if ((CHECK_ONLY)); then
		printf '%s\n' 'status: not-ready' 'missing[1]: bun' "help[1]: Run \`$0\`"
		exit 1
	fi
	if ((ASSUME_YES == 0)); then
		printf '%s' 'Bun is absent. Install the stable release for this user? [y/N] '
		read -r reply
		case "$reply" in [Yy]|[Yy][Ee][Ss]) ;; *) printf 'status: cancelled\n'; exit 1 ;; esac
	fi
	command -v curl >/dev/null 2>&1 || {
		printf '%s\n' 'error: curl is required to install Bun' 'help[1]: Install curl, then rerun this script'
		exit 1
	}
	curl -fsSL https://bun.com/install | bash
	export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
	export PATH="$BUN_INSTALL/bin:$PATH"
fi

command -v bun >/dev/null 2>&1 || {
	printf '%s\n' 'error: Bun was installed but is not on PATH' 'help[1]: Add `~/.bun/bin` to PATH, then rerun with `--check`'
	exit 1
}

if ((CHECK_ONLY == 0)); then
	(cd "$SCRIPT_DIR" && bun install --frozen-lockfile)
else
	for required in \
		"$SCRIPT_DIR/node_modules/commander/package.json" \
		"$SCRIPT_DIR/node_modules/.bin/tsc" \
		"$SCRIPT_DIR/node_modules/.poteto-mode-tools-install-key"; do
		[[ -e "$required" ]] || {
			printf '%s\n' 'status: not-ready' 'error: locked dependencies are not installed' "help[1]: Run \`$0\`"
			exit 1
		}
	done
	expected_key=$(cd "$SCRIPT_DIR" && bun --no-install -e 'import { createHash } from "node:crypto"; import { readFileSync } from "node:fs"; process.stdout.write(createHash("sha256").update(readFileSync("package.json")).update("\0").update(readFileSync("bun.lock")).digest("hex"))')
	actual_key=$(tr -d '\r\n' < "$SCRIPT_DIR/node_modules/.poteto-mode-tools-install-key")
	[[ "$actual_key" == "$expected_key" ]] || {
		printf '%s\n' 'status: not-ready' 'error: installed dependencies do not match package.json and bun.lock' "help[1]: Run \`$0\`"
		exit 1
	}
fi

(cd "$SCRIPT_DIR" && bun --no-install test orch watch-pr)
(cd "$SCRIPT_DIR" && bun --no-install run typecheck)
if ((CHECK_ONLY)); then
	(cd "$SCRIPT_DIR" && bun --no-install -e 'await import("./orch/store.ts"); await import("./watch-pr/cli.ts")')
else
	(cd "$SCRIPT_DIR" && bun --no-install orch/orch.ts --help >/dev/null)
	(cd "$SCRIPT_DIR" && bun --no-install watch-pr/watch-pr --help >/dev/null)
fi

printf 'status: ready\n'
printf 'runtime: bun %s\n' "$(bun --version)"
printf 'checks: tests=passed typecheck=passed modules=passed\n'
printf 'help[2]:\n  Run `%s --check` after upgrading Bun\n  Read `../references/runtime-setup.md` for host integration\n' "$0"
