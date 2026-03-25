.PHONY: install build test dev clean lint help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Compile TypeScript
	npm run build

test: ## Run tests with coverage
	npm test

dev: ## Run in development mode
	npm run dev

lint: ## Lint source files
	npm run lint

clean: ## Remove build artifacts
	npm run clean

demo: build ## Build and run demo output
	node dist/index.js > demo.html
	@echo "✅ demo.html generated"
