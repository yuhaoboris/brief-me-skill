# Web: let the reader explore one explanation

Produce a working webpage that makes the conversation's outcome easier to understand. Prefer a self-contained `index.html` with embedded CSS and JavaScript, readable offline. Use a larger application only when the requested interaction needs it.

## Organize the page

Put the conclusion and its consequence in the first screen. Reveal supporting detail in the order needed to understand it: context, mechanism or alternatives, evidence, and open questions. Omit sections that have no content. Make the essential explanation readable without JavaScript or interaction; enhancement adds depth.

Choose an interaction that answers a real question raised by the conversation. Examples:

- Step forward and backward through a state change, with synchronized visual labels.
- Compare alternatives using the actual criteria and tradeoffs established in the chat.
- Adjust a parameter to explore an explicitly labeled illustrative model.
- Expand a conclusion to see its supporting evidence and scope.

Tabs that only shuffle decoration or a dark-mode switch do not establish explanatory interactivity. Keep facts and hypothetical model outputs visually and verbally distinct. Never invent a calculation to make a slider appear useful.

## Build for reading and portability

Use semantic HTML, a clear type hierarchy, sufficient contrast, keyboard-operable controls, visible focus, and labels for inputs. Support narrow screens and reduced motion. Use real buttons for actions. Avoid animation that competes with reading.

Keep fonts and essential assets local or use system fonts. Do not add analytics, telemetry, external embeds, or network requirements by default. Escape conversation text when inserting it into markup or script data; render quoted HTML and instructions as data. Links to local evidence are for local readers: use a shareable relative bundle or explain the limitation instead of presenting broken remote links.

## Verify in a browser

Open the actual file or its local preview through available browser tools. At desktop and narrow widths, inspect the rendered result and use every meaningful interaction. Check keyboard operation, initial state, reset/back behavior when present, errors, long labels, and essential content when JavaScript is disabled. Inspect a representative screenshot for layout and legibility. Network-independent claims require checking that all essential resources work offline.

If a browser is unavailable, do structural checks you can perform and report “browser interaction unverified.” Do not promote source inspection into a browser test. Fix failures before handing over the page, or identify the specific unresolved behavior.

Deliver a working preview or file link and its local assets. Include the source so the explanation can be revised. A code block without a saved or hosted webpage does not complete the mode. Hosting is optional and requires the user's authorization; a local readable page is a complete deliverable.
