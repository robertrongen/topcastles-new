# VS Code + GitHub Copilot + Figma MCP
Setup Guide for UX Team
Shareable plain-text handoff
Prepared: 2026-04-17

============================================================
## PURPOSE
============================================================

This document explains:

- The recommended beginner-friendly setup for using VS Code with GitHub Copilot and the Figma MCP server
- How to configure it so day-to-day work is mostly command-driven
- Whether Markdown (.md) instruction files are required
- What Markdown instruction files are for
- What should go inside those Markdown files for future use

This guide is written for people who are new to MCP, Copilot instructions, and Figma-based AI workflows.

============================================================
## SIMPLE RECOMMENDATION
============================================================

Recommended default setup:

1. Use VS Code
2. Enable GitHub Copilot
3. Connect the Figma REMOTE MCP server
4. Store the MCP config at USER level first
5. Add one project instruction file:
   .github/copilot-instructions.md
6. Keep all other instruction files optional for later

Why this is the best beginner setup:

- Lowest setup complexity
- Works across projects
- Gives Copilot Figma context and canvas-writing ability
- Avoids too many overlapping rule files
- Easy to explain and support internally

============================================================
## WHAT MCP IS, IN PLAIN ENGLISH
============================================================

MCP (Model Context Protocol) is how tools like Copilot connect to external systems
such as Figma.

In this setup, the Figma MCP server lets Copilot do things like:

- read design context from Figma
- inspect frames and selections
- help implement designs in code
- write native content back into a Figma file
- support workflows like code-to-canvas

Think of it like a bridge between VS Code and Figma.

============================================================
## WHICH FIGMA MCP SERVER TO USE
============================================================

Use the Figma REMOTE MCP server unless there is a very specific reason not to.

Why:

- Figma recommends the remote server
- It provides the broadest feature set
- It does not require the Figma desktop app
- It supports write-to-canvas workflows

Only consider the desktop server if your organization has a specific need for it
or your workflow depends on desktop-app-based local selection behavior.

============================================================
## USER-LEVEL VS WORKSPACE-LEVEL MCP CONFIG
============================================================

MCP servers in VS Code are configured in a file called:

mcp.json

This can live in either:

A) your VS Code user/profile configuration
B) a project workspace under .vscode/mcp.json

Recommended for beginners:
- Start with USER-LEVEL configuration

Why:
- Easier to manage
- Works across multiple repos
- Reduces repo clutter
- Better for personal setup and early rollout

Use WORKSPACE-LEVEL only if:
- the project needs shared team configuration
- the repo depends on a specific server setup
- the team wants MCP config checked into source control

============================================================
## MINIMUM SETUP STEPS
============================================================

Step 1: Install VS Code
Step 2: Sign in and enable GitHub Copilot
Step 3: Open the VS Code command palette
Step 4: Open MCP user configuration
Step 5: Add the Figma remote MCP server
Step 6: Authenticate with Figma
Step 7: Confirm Copilot can use the Figma tools
Step 8: In the repo, create .github/copilot-instructions.md

After that, the basic workflow is ready.

============================================================
## BASIC DAILY WORKFLOW
============================================================

Typical design-to-code workflow:

1. Open the target Figma file
2. Copy the file link or selection link
3. Paste that link into Copilot chat in VS Code
4. Give a clear command
5. Let Copilot use Figma context before coding

Example commands:

- "Use this Figma link as the source of truth and implement the selected frame in our existing component system."
- "Inspect this Figma selection first, then build the UI in React and TypeScript."
- "Reuse existing tokens and components. Do not hardcode colors or spacing."

Typical write-to-canvas workflow:

1. Open the target Figma file
2. Copy the file link
3. Paste it into Copilot chat
4. Tell Copilot to write directly to the Figma canvas

Example commands:

- "Use this Figma file and write directly to the canvas. Create a new Settings page using existing components, variables, and auto layout."
- "Add a Billing screen to this file using our design system."
- "Clean up this section and replace one-off styles with existing variables and components."

============================================================
## DO WE NEED MARKDOWN FILES?
============================================================

Short answer:
- Not required for basic use
- Strongly recommended for reliable repeatable output
- Very helpful for team consistency

Without Markdown instruction files:
- The setup still works
- But users must repeat rules more often in prompts

With Markdown instruction files:
- Copilot gets repeatable guidance automatically
- The team gets more consistent output
- Fewer reminders are needed in chat

So for future-proofing:
YES, maintain at least one instruction file.

============================================================
## THE ONE FILE EVERY PROJECT SHOULD HAVE
============================================================

Recommended file:

.github/copilot-instructions.md

This should be the first and main instruction file for a project.

Purpose:
- Holds project-wide rules and preferences
- Automatically influences Copilot chat behavior in the workspace
- Reduces repeated prompting

Start with this single file before introducing any others.

============================================================
## WHAT SHOULD GO INSIDE copilot-instructions.md
============================================================

Keep it short, concrete, and practical.

It should answer questions like:

- What language(s) should Copilot prefer?
- Should it reuse existing components before making new ones?
- Should it avoid hardcoded styles?
- How should it work with design tokens?
- How should it behave when implementing from Figma?
- What should it optimize for: simplicity, consistency, accessibility, maintainability?

Good things to include:

- preferred languages and frameworks
- coding conventions
- component reuse rules
- token/design-system rules
- accessibility expectations
- response style expectations
- how to use Figma as source of truth

============================================================
## EXAMPLE STARTER CONTENT FOR copilot-instructions.md
============================================================

Example:

# Project-wide Copilot instructions

- Use TypeScript for frontend work unless the repo already uses something else.
- Prefer existing components before creating new ones.
- Do not hardcode colors, spacing, radius, or typography if tokens exist.
- When implementing from Figma, inspect Figma context before writing code.
- Preserve layout structure and component hierarchy from the design.
- Reuse the existing design system whenever possible.
- Keep components small and composable.
- Prefer accessible markup and keyboard-friendly interactions.
- Briefly explain the files changed and why.
- When unsure, choose the simplest solution that matches the existing codebase.

============================================================
## OPTIONAL FUTURE FILES
============================================================

Later, if needed, the team can add more specific Markdown instruction files.

Examples:

.github/instructions/frontend.instructions.md
.github/instructions/design-system.instructions.md
.github/instructions/tests.instructions.md

Use these only when different parts of the repo need different rules.

Examples:

frontend.instructions.md
- React patterns
- state management conventions
- routing conventions
- styling conventions

design-system.instructions.md
- button/card/form patterns
- token usage rules
- naming conventions
- component API expectations

tests.instructions.md
- preferred test framework
- naming conventions
- mocking style
- test structure

Do NOT add many instruction files too early.
Too many files can create overlap and confusion.

============================================================
## WHAT ABOUT AGENTS.md?
============================================================

AGENTS.md can also be used in some agent-based workflows, but for a new team rollout:

Recommendation:
- Start with .github/copilot-instructions.md only

Only add AGENTS.md later if:
- the team uses multiple agent tools
- the team standardizes around AGENTS.md across environments
- there is a clear reason to support more than one instruction convention

If both exist, keep them aligned and avoid duplicated or conflicting rules.

============================================================
## HOW LONG SHOULD THE MD FILES BE?
============================================================

Best practice:
- Short
- Specific
- Actionable
- Easy to review

Avoid:
- long essays
- vague principles with no examples
- duplicated rules across multiple files
- contradictions between files

Good instruction files usually contain:
- rules
- preferences
- constraints
- examples

============================================================
## WHAT NOT TO PUT IN THE MD FILES
============================================================

Avoid putting these in instruction files:

- sensitive credentials
- secrets, tokens, passwords
- temporary one-off task notes
- outdated project history
- long product documentation
- vague statements like "write clean code"
- rules that conflict with the actual codebase

Instruction files should guide decisions, not replace documentation.

============================================================
## WHAT THE UX TEAM SHOULD PREPARE IN FIGMA
============================================================

To help Copilot and MCP perform well, the Figma side should be as clean as possible.

Recommended Figma hygiene:

- use clear frame names
- use reusable components
- use variables/styles/tokens where possible
- avoid one-off random spacing and color values
- keep component variants organized
- keep design system pieces consistent
- use meaningful layer names when practical

This makes both design-to-code and write-to-canvas workflows much better.

============================================================
## BEST PROMPTING PATTERN
============================================================

Use prompts with 3 parts:

A) Context
- "Use this Figma file/selection"

B) Goal
- "Implement this screen"
- "Write a new page to canvas"

C) Constraints
- "Reuse existing components"
- "Use tokens"
- "Do not hardcode styles"
- "Keep accessibility in mind"

Example:

"Use this Figma selection as the source of truth.
Inspect it first.
Implement it in our existing React/TypeScript component system.
Reuse existing tokens and components.
Do not hardcode colors or spacing."

============================================================
## COMMAND EXAMPLES TO SAVE FOR DAILY USE
============================================================

Design to code:
- "Use this Figma selection as the source of truth and implement it in our frontend."
- "Inspect this frame and list the structure before coding it."
- "Compare this code to the Figma design and fix the mismatches."

Write to canvas:
- "Use this Figma file and write directly to the canvas. Create a new Settings page."
- "Add empty, loading, and error states to this flow."
- "Refactor this Figma section to reuse existing components and variables."

System cleanup:
- "Replace one-off styles with existing tokens."
- "Find places where the implementation diverges from the design system."
- "Convert this primitive layout into reusable components."

============================================================
## WHAT TO IMPLEMENT NOW VS LATER
============================================================

Implement now:
- user-level Figma remote MCP server
- one project file: .github/copilot-instructions.md
- a few reusable command prompts

Implement later:
- extra *.instructions.md files
- AGENTS.md
- more advanced design-system-specific instructions
- more formal team prompt libraries
- custom skills or advanced workflow packaging if needed

============================================================
## RECOMMENDED TEAM POLICY
============================================================

Suggested team default:

- One main instruction file per repo
- Keep instructions under version control
- Review instruction changes like code changes
- Keep prompts concrete and short
- Prefer reuse over creation
- Use Figma links when asking for design-driven work
- Update instructions when the design system changes

============================================================
## TROUBLESHOOTING CHECKLIST
============================================================

If Copilot is not using Figma well:

Check:
- Is the Figma MCP server connected?
- Is the user authenticated to Figma?
- Did the prompt include a Figma file or selection link?
- Is the instruction file present in the repo?
- Are the instructions too vague or too long?
- Are there conflicting instruction files?
- Is the Figma file itself structured clearly?

If write-to-canvas results are weak:
- make the prompt more explicit
- ask it to reuse existing components and variables
- ask it to use auto layout
- point it at a specific file, page, or selection
- keep the target scope small at first

============================================================
## FINAL RECOMMENDATION
============================================================

Best setup for a new team member:

- Use the Figma remote MCP server
- Put MCP config at user level first
- Add one file: .github/copilot-instructions.md
- Keep that file short and practical
- Use Figma links in prompts
- Add more instruction files only when there is a clear need

This gives the easiest onboarding path and the best balance between simplicity and automation.

============================================================
## FUTURE REFERENCE: TEMPLATE CHECKLIST FOR MD FILE CREATION
============================================================

When creating a new instruction Markdown file, confirm it answers:

1. Who is this file for?
2. Which folders/files does it apply to?
3. What tools/frameworks should Copilot prefer?
4. What must never be hardcoded?
5. What components or patterns should be reused?
6. How should Figma context be treated?
7. What coding or design-system constraints matter most?
8. What should the output optimize for?
9. Is there any example Copilot should follow?
10. Is there anything outdated that should be removed?

============================================================
## REFERENCE SOURCES (OFFICIAL DOCS)
============================================================

Visual Studio Code
- MCP configuration reference:
  https://code.visualstudio.com/docs/copilot/reference/mcp-configuration

- Use MCP servers in VS Code:
  https://code.visualstudio.com/docs/copilot/customization/mcp-servers

- Use custom instructions in VS Code:
  https://code.visualstudio.com/docs/copilot/customization/custom-instructions

- Customize AI for your project:
  https://code.visualstudio.com/docs/copilot/guides/customize-copilot-guide

- Get started with GitHub Copilot in VS Code:
  https://code.visualstudio.com/docs/copilot/getting-started

Figma
- Figma MCP server overview:
  https://developers.figma.com/docs/figma-mcp-server/

- Remote server installation:
  https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

- Write to canvas:
  https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/

- Code to canvas:
  https://developers.figma.com/docs/figma-mcp-server/code-to-canvas/

- Tools and prompts:
  https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/

- Add custom rules:
  https://developers.figma.com/docs/figma-mcp-server/add-custom-rules/

- Figma Help Center guide:
  https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
