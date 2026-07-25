# Repository purpose: rsv-public

This repository (`rsv-public`) is the **public** counterpart to the `rsv-private` repository. Both repos belong to the same project (Tennenlohe-Radschnellweg) and are typically open side-by-side in the same VS Code workspace.

## Content placement rule

- **Only public-facing webpage elements** belong in this repo (`rsv-public`): published web pages, public-facing assets (images, styles, scripts) meant to be served/visible to visitors, public documentation intended for publication, and the public README/LICENSE.
- **Everything else** (private/internal documents, drafts, notes, planning material, non-public data, internal correspondence, credentials, or any content not meant to be publicly visible) belongs in the sibling repository `rsv-private`, not here.

## Guidance for Copilot

- When asked to create or edit a file for this project, first determine whether the content is meant to be publicly visible on the webpage.
  - If yes → create/edit it in `rsv-public` (this repo).
  - If no, or unsure/ambiguous → create/edit it in `rsv-private` instead, and ask the user for confirmation if genuinely unclear.
- Do not copy private/internal content into this repo, even temporarily.
- If a change spans both public and private concerns, split it: public webpage content stays here, everything else goes to `rsv-private`.
