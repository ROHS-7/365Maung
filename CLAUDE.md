@AGENTS.md

# Interaction Rules

- **Always read official API documentation before writing any code that uses a library, framework, or external service with available docs.** The tokens spent reading docs will always be fewer than the tokens spent debugging incorrect usage. Look for docs in `node_modules/<package>/dist/docs/`, the package README, or fetch from the official docs URL. This is non-negotiable — no exceptions for "familiar" APIs.
- **3-step tasks involving an API or external tool: outline the plan in 3–5 bullets and wait for explicit approval before executing.** No assumptions about "obvious" next steps.
- **Only change what was asked.** No unsolicited refactors, renames, formatting fixes, structural improvements, or composite changes bundled into the same response.
- **When iterating on creative work (designs, copy, thumbnails), preserve everything except the specific element asked to change.** Treat everything else as locked.
- **For widespread file changes, prefer a single `Write` call over sequential `Edit` calls.** Speed and token efficiency matter more than granular diffs when many files are touched.
