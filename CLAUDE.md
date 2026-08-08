ParentSync - AI Developer Rules (CLAUDE.md)
This document defines the strict constraints, development commands, and coding guidelines for AI agents (such as Claude Code) working on the ParentSync repository.

1. Development & Quality Commands
   Run/Preview: Open /index.html directly in a browser. There is no build pipeline or bundler (YAGNI principle).
   QA & Security Audit: Execute the custom agent configuration via agents/qa_reviewer.md.
   Review History: All architectural decisions and human/AI reviews must be appended to /review_history.md.
2. Core Architectural & Code Style Guidelines
   🛡️ Security-First Constraints (Secure by Design)
   Zero Leakage: Under no circumstances should FIGJAM_URL, API keys, or raw hearing memos be hardcoded into source code or markdown specifications. If present in local_env.json, they must be completely masked in generated assets.
   Key Storage: API keys must be kept in sessionStorage only. Tabs/browsers closing must automatically purge the keys.
   Fail-safe Fallback: If the API key is not set, or if an API connection error/timeout occurs, the system must immediately and gracefully fall back to the browser-side local regular-expression matching classifier without throwing unhandled exceptions.
   🔒 OWASP-Compliant Front-end Robustness
   DOM XSS Defense: Strict prohibition of innerHTML or raw string template literal rendering for any user inputs or AI classification labels.
   Safe Rendering: You must dynamically create elements using document.createElement() and bind variable values strictly via .textContent.
   🎨 Ergonomic & Physiological UX Standards
   Anti-Glare (Slate-950): Background luminance must be strictly under 15% (use ultra-dark themes like Tailwind's Slate-950/900) to protect dark-adapted eyes in a midnight room.
   Fitts's Law (One-Handed Usability): The main input form and interactive control nodes must be anchored to the bottom of the viewport to minimize target-selection cost under single-handed thumb operability.
3. Directory Layout Compliance
   AI agents must align with and preserve the following modular structure:

/local_env.json (Ignored by Git - Dynamic Parameters)
/briefing.md (SSoT - Why & Who)
/review_history.md (Living Sign-off Audit Trail)
/agents/ (Modular Prompt-as-Code Directory)
/index.html (The single-file lightweight prototype)
