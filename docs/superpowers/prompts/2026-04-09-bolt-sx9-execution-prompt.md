# Bolt execution prompt — SX9 (paste into Bolt)

Use this as the **system or task prompt** when Bolt scaffolds, edits, or deploys SX9 frontends (e.g. Azure Static Web Apps). After Bolt finishes, **you commit and push** from your machine; Bolt does not need your PAT if the repo is public.

---

## Copy block (start here)

```
You are working in the SX9 ecosystem (canonical repo: cp5337/sx9). Obey the UI Constitution and design tokens exactly.

GROUND TRUTH (read-only; do not invent parallel palettes):
- Binding spec: 01-rfc/9200-component-system/SX9-UI-CONSTITUTION_2.md
- Portable rules mirror: .cursorrules (SX9 UI CONSTITUTION v1.2+)
- DTCG tokens: apps/sx9-design-system/tokens/design-tokens.json
- Compliance check (run before merge): node tools/sx9-ui-compliance/sx9-ui-compliance.mjs evaluate --root <app>

NON-NEGOTIABLE UI
- Stack: React + Vite SPA only for greenfield SX9 UIs unless a legacy repo explicitly differs. No Next.js, no SSR, no CSS-in-JS for new work.
- Dark only. No light theme. No theme toggle.
- Border radius: 0px everywhere except avatars/status dots (rounded-full allowed for those only).
- Border width: 0.5px. Default border COLOR is #2a3447 — never use bright white or light gray as the default panel/card border. Forbidden: border-white, border-gray-100, border-gray-200, zinc-* border utilities, or bare `border` without mapping to the constitutional border color. Token `white` / #ffffff is not for routine chrome outlines.
- Typography: system font stack; font weights 400 and 500 only (no font-semibold/bold).
- Colors: use only hex values allowed in .cursorrules and/or design-tokens.json — no arbitrary hex, no gradients, no glass morphism.
- No Math.random() in production paths — seeded PRNG if randomness is required.

AZURE / BOLT DEPLOYMENT
- If deploying a static SPA: build output is typically `dist/`. Configure API/SSE proxies in the host (e.g. SWA routes) so `/api` and `/sse` match the app's dev proxy story; document ports in README (avoid 18082 vs 3001 confusion).
- CORS `*` is dev-only; tighten for production.

GIT / LINEAGE (operator commits after you)
- Conventional Commits: feat:, fix:, docs:, chore:
- PR title/body should cite lineage: e.g. "docs: align README ports — Lineage: gap AC1–AC2" or "fix: border tokens — Lineage: UI Constitution v1.2 § Borders"
- Do not commit .env, secrets, or vault files.

YOUR TASK (fill in before sending)
1) [Repo/path, e.g. apps/some-app or external sx9-agent-console-one]
2) [Goal: e.g. README refresh + env template + fix fetch healthCheck]
3) [Acceptance: e.g. npm run build passes; compliance evaluate zero errors]

Deliver: minimal diffs, updated README if behavior or ports change, and a short CHANGELOG or PR description bullet listing files touched.
```

---

## Optional second paste — `sx9-agent-console-one` follow-through

If Bolt is targeting **https://github.com/cp5337/sx9-agent-console-one**, add:

```
SCOPE: sx9-agent-console-one (Vite React TS). Forge: .forge/azure-forge.json lists this repo under dev_surfaces.bolt.

Priority batch A — documentation lineage
- Rewrite README: correct repo name; remove any ctas7 / deprecated StackBlitz links; document `npm run dev` vs `npm run dev:server` and which port the Vite proxy uses for `/api`.
- Add ARCHITECTURE.md: one page — mock command-center vs Forge/Talon panels vs optional backend.

Priority batch B — correctness
- Fix services/api.ts healthCheck: `fetch` does not take `timeout` in RequestInit; use AbortSignal.timeout(...) or AbortController.
- Unify API base URL via import.meta.env (VITE_*) and document for Azure SWA.

Priority batch C — demo honesty
- Gate synthetic metrics in App.tsx (Math.random) behind VITE_DEMO_MODE or label the UI as synthetic.

Lineage in commit messages: ref gap analysis 2026-04-09 + task IDs AC1–AC6 as applicable.
```

---

## File location

This prompt file lives at:

`docs/superpowers/prompts/2026-04-09-bolt-sx9-execution-prompt.md`

Commit it with something like: `docs: add Bolt execution prompt for SX9 constitution + optional agent-console batch`.
