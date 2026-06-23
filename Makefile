# VC Tabs — common dev / build / release commands.
#
# Homebrew node@22 is broken on this machine (missing libsimdjson dylib) and is
# first on PATH, so every recipe forces the working Node 26 onto PATH.
export PATH := /opt/homebrew/bin:$(PATH)

# Production API origin baked into the store build (override: make package API_URL=...).
API_URL ?= https://vc-chrome-tab-extension.vercel.app
EXT     := @vctabs/extension
WEB     := @vctabs/web
SHOTS   := store-assets/vc-tab-1.png store-assets/vc-tab-2.png store-assets/vc-tab-3.png store-assets/vc-tab-4.png
# Invoke Node by absolute path — the node@22 on PATH is broken; this symlink is v26.
NODE    := /opt/homebrew/bin/node

.DEFAULT_GOAL := help
.PHONY: help install dev ext-dev build build-ext build-web typecheck \
        package release e2e e2e-step2 db-test health health-local \
        screenshots clean

help: ## List available commands
	@echo "VC Tabs — make targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install all workspace dependencies
	pnpm install

# ── Dev servers ──────────────────────────────────────────────────────────────
dev: ## Run the Next.js sync API at http://localhost:3000 (TLS-capped for Atlas)
	pnpm --filter $(WEB) dev

ext-dev: ## Run the extension in Vite dev mode (browser fallback, no Chrome needed)
	pnpm --filter $(EXT) dev

# ── Build ────────────────────────────────────────────────────────────────────
build: build-ext ## Build the extension into apps/extension/dist
build-ext: ## Build the extension (tsc + vite → apps/extension/dist)
	pnpm --filter $(EXT) build

build-web: ## Production build of the web / API
	pnpm --filter $(WEB) build

# ── Package for the Chrome Web Store ─────────────────────────────────────────
package: ## Build + zip the extension for upload → apps/extension/vc-tabs-extension.zip
	VITE_API_BASE_URL="$(API_URL)" pnpm --filter $(EXT) package

release: typecheck package ## Typecheck everything, then build the upload zip

# ── Quality ──────────────────────────────────────────────────────────────────
typecheck: ## Typecheck every package
	pnpm -r typecheck

# ── Backend tests (need a running server; override BASE=<url> for prod) ───────
e2e: ## Auth + sync end-to-end test
	$(if $(BASE),BASE="$(BASE)" )pnpm --filter $(WEB) e2e
e2e-step2: ## Step-2 e2e: email verify / reset / rate-limit
	$(if $(BASE),BASE="$(BASE)" )pnpm --filter $(WEB) e2e:step2
db-test: ## Test the MongoDB Atlas connection
	pnpm --filter $(WEB) db:test

# ── Health checks ────────────────────────────────────────────────────────────
health: ## Curl production /api/health
	curl -s $(API_URL)/api/health; echo
health-local: ## Curl local /api/health
	curl -s http://localhost:3000/api/health; echo

# ── Store assets ─────────────────────────────────────────────────────────────
screenshots: ## Normalize raw 2560x1600 captures to 1280x800
	$(NODE) store-assets/process-screenshots.mjs store-assets $(SHOTS)

# ── Cleanup ──────────────────────────────────────────────────────────────────
clean: ## Remove build outputs + the store zip
	rm -rf apps/extension/dist apps/web/.next apps/extension/vc-tabs-extension.zip
