# Web: whole first, local detail on demand

Build one explanation that a participant can explore. The overview shows how the main parts connect. Selecting a part makes that part the visual subject.

## Model the content

For each important part, recover its role, supported internal detail, connections to other parts, and evidence. Inspect linked source material when the conversation omits needed detail. Apply the entrypoint's clarification and inference rules to unresolved relationships.

Choose the dimensions that explain the part:

- **Execution:** inputs, steps, conditions, outputs, and meaningful branches or loops.
- **Structure:** contained parts, responsibilities, and their internal relationships.
- **External connections:** who provides or receives what, why it is needed, and relevant constraints.

A part need not have all three dimensions. For a static concept, show its structure rather than inventing execution steps. For an explanatory grouping, keep independent mechanisms separate; label the grouping and any inferred organization. Preserve interfaces versus implementations, optional capabilities versus requirements, and data direction versus call direction when relevant.

Use stable identifiers for parts, relationships, and reading positions. Keep source locators or excerpts for important claims. Validate that excerpts match the saved source; this verifies provenance, not the truth of the original claim.

## Make the reading level visible

**Overview:** show the topic, a short takeaway, the main parts, and labeled connections. Keep supporting detail behind selection. Spatial placement alone must not imply causation or sequence.

**Local view:** replace the overview as the dominant canvas. Show the selected part's own process, structure, or connections at a useful scale. Retain a compact breadcrumb, module navigation, or mini overview for orientation. A large unchanged overview with a narrow detail sidebar does not complete this transition.

Use tabs when the dimensions are distinct. Selecting a step, subpart, or connection reveals its concise explanation and supporting evidence. Use arrows, containment, and branches to show actual relationships; avoid a grid of unrelated descriptions. An external connection can lead to the related part's local view.

Provide back and overview actions. Preserve the local tab and selected item when the reader visits another part and returns. Reopening the file may reset reading state unless persistence was requested. Reading history and recoverable content versions are separate features.

Keep labels short and evidence expandable. Put consequential uncertainty beside the affected claim, not only in a distant disclaimer. Do not force a fixed module count, three tabs, a color palette, or source filenames from a previous sample onto a new topic.

## Build and package

Default stack: **React + TypeScript + Tailwind CSS + Headless UI**. Adapt to an existing project stack or an explicit user choice. Use Headless UI for suitable tabs, disclosures, or dialogs; prefer semantic HTML for simple controls.

Deliver a self-contained `index.html` that opens directly in a browser. Bundle runtime, scripts, styles, and essential assets; use system fonts or embedded fonts. Retain editable source and build configuration beside it. Compilation can need dependencies; reading the delivered file should not need a development server, package install, CDN, or network connection.

Use accessible names, visible keyboard focus, narrow-screen layouts, and reduced-motion support. Keep essential overview content readable with scripts disabled; state that exploration requires JavaScript. Treat source text as data and escape it at HTML/script boundaries. Keep evidence usable in the delivered artifact, rather than depending solely on machine-specific paths. Hosting requires separate authorization.

## Update the same explanation

Locate the existing topic output before creating a directory. Preserve stable `index.html` as the current entry. Before replacing it, save the previous output and corresponding source in a recoverable version directory. Track version, source scope, changes, and acceptance status in a small manifest or equivalent record. Preserve hand edits before a rebuild.

A new invocation reconciles the latest discussion into the explanation; it does not append another transcript. Keep meaningful identifiers so corrections remain traceable. Retain old versions, label any superseded claims, and state whether restoring a version restores only the output or also the working source. Do not carry an earlier version's acceptance forward to changed content.

## Verify and hand over

Open the generated artifact and walk the reading path: overview → local → detail → connected part → back → overview. Confirm that the local content actually becomes the visual subject, details match the selection, reading position returns correctly, and source references remain accessible.

Inspect desktop and narrow layouts, long labels, arrow meanings, keyboard operation, focus after dialogs/navigation, browser errors, and script-disabled overview content. Exercise meaningful branches and controls; inspect representative screenshots. Check that all essential resources are bundled. Verify direct-file opening when claiming it works: a localhost preview alone does not establish `file://` behavior.

On first implementing or changing version mechanics, check a real update and restoration, including whether the prior output is recovered intact. On ordinary content updates, check the current archive and preserved history. Browser or restore checks that could not be performed remain explicitly unverified.

Deliver the stable HTML link with a concise change note. Distinguish generated, technically checked, and user accepted. After explicit acceptance, record the accepted version without rebuilding an unchanged artifact merely to display that status.
