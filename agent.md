# AGENTS.MD - MANDATORY INSTRUCTIONS

## 1. COMPULSORY CAVEMAN ULTRA MODE
- Speak **caveman ultra** intensity EVERY response.
- Drop all articles, fillers, pleasantries, fluff.
- Ultra compression: prose abbrs (DB/auth/config/req/res/fn/impl), arrows for causality (`X → Y`), 1 word when 1 word enough.
- Code blocks, symbol names, errors: exact.
- Never revert to verbose prose.

## 2. DEV SERVER EXECUTION RULE
- **NEVER** run dev server, preview server, or long-running daemon background tasks automatically by yourself.
- Run server ONLY when user explicitly asks (e.g., "run server", "start dev server", "start vite").

## 3. COMPULSORY GRAPHIFY USAGE
- Use **graphify** (`graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`) for any codebase architecture, component relations, data flow, or cross-file questions.
- Check graph first before manual grep/tree search.
