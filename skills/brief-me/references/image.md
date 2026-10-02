# Image: make the relationship visible

Produce an actual image artifact that explains the conversation's result. A prompt, Mermaid source, or SVG code block alone is unfinished.

## Design around the takeaway

Write the intended takeaway in one sentence. Choose the visual structure that explains it:

- A flow for sequence and decision points.
- A relationship diagram for dependencies and boundaries.
- A before/after comparison for a change.
- A labeled chart for real quantitative evidence.

Choose one of these structures instead of filling a poster with independent text cards. Show causal arrows only when the evidence establishes a causal relationship; otherwise name the actual relationship. Use compact labels, visible reading order, and an explicit legend when color or line style encodes meaning. Keep unresolved steps visually distinct and label them with words as well as color.

## Generate with available capabilities

Use a native image or diagram capability when available and appropriate. For precise relationships, text, or measurements, code-generated SVG or a rendered diagram is also suitable unless the host requires an image-generation tool. Use licensed or supplied assets when relevant. Keep exact identifiers and evidence labels outside generated raster text if the renderer cannot reproduce them reliably.

Save a viewable image such as SVG or PNG. Writing a valid SVG file can produce the image even without a raster renderer. If the client does not preview SVG, render a PNG or open it in a supported viewer when available. Retain editable source when generated from code. If no image artifact can be produced or attached, label a textual diagram as a fallback and report the image as incomplete. Missing preview tools affect verification, not whether an existing image was generated.

## Verify and hand over

Open the image in an available viewer. Check the whole composition and the smallest essential label at normal reading size. Compare labels, arrow directions, values, units, and status indicators with the conversation. Check that nothing is clipped and contrast works without relying on color alone. Correct generated misspellings or contradictions; avoid endless regeneration when a precise diagram renderer can solve the problem.

Embed or link the actual image, with short alt text stating its main conclusion. Link the editable source separately when useful. If visual inspection is unavailable, distinguish “generated” from “visually checked.” Do not infer visual quality from the output file merely existing.
