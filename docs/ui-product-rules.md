# UI Product Rules

## Text Alignment

- Explanatory text is left aligned. This includes home copy, report descriptions, card copy, guide text, modal copy, and review instructions.
- Page titles are left aligned by default. Report result titles may be centered because they behave like a report heading.
- Navigation center labels are centered between the left and right actions.
- Button labels are centered.
- Buttons inside the same home mode card should share the same width. Different cards do not need to force the same button width.
- On mobile, primary action buttons should fill their container width for easier tapping.
- Footer text may be centered because it is low-priority support information and should stay short.
- Page footers should not repeat the producer name if the top brand area already shows it. Keep feedback and data/local-storage notes there.
- Report pages use this pattern: title centered, description left aligned in a centered narrow column, report card centered.
- List and guide pages use a constrained left-aligned content column so headings, explanatory text, actions, and grids share a stable visual rhythm on wide screens.

## Button And Label Meaning

- Thick border plus shadow means the element is interactive.
- Non-interactive labels must not use the same visual treatment as buttons.
- Decorative status labels should be muted, light, and without strong shadows.

## Color Semantics

- The home mode cards use very pale color blocks, close to white, so the page stays light and the cards do not merge into heavy areas.
- Home mode card backgrounds are: gentle baseline `#fff7dd`, full estimate `#f3fbff`, word-by-word challenge `#fff3f8`.
- Home mode badges carry the mode identity more strongly than the card backgrounds: `摸` uses yellow, `估` uses blue, and `闯` uses pink.
- Blue is for full estimate and primary testing actions.
- Pink is for word-by-word challenge, unknown/not-recognized judgment, and reviewing unrecognized characters.
- Orange is reserved for undo, reset, caution actions, and warm report accents. Avoid placing multiple strong orange buttons together.
- Soft peach/orange is used for final report-image actions such as downloading the report image; ordinary report navigation stays neutral white.
- Green should not be introduced as a main mode or report identity color. Keep it out of large content blocks unless a future feature explicitly defines a success-only use.
- Disabled buttons should have muted text, muted border, pale background, and reduced shadow. Disabled undo buttons may keep a pale orange background so they transition gently into the active orange undo state.
- Yellow is for gentle baseline, completed groups, and warm progress surfaces.
- White buttons are secondary navigation or neutral choices.

## Report Rules

- Report cards share the same visual structure: main result, result label, metric cards, advice, and QR area.
- Report identity colors are: gentle baseline yellow-orange `#c97a00`, full estimate blue, and word-by-word challenge pink/rose.
- Metric cards stay white with dark borders. Do not tint metric cards by report type.
- Gentle baseline reports use the rough range as the main result, such as `400-700`, with the label `粗略识字范围`.
- Gentle baseline reports keep `识字阶段` as a metric card. It may span the full width when the stage text needs more breathing room.
- Report metric wording uses `本次认识`, `本次不认识`, and `待复习字`. User-facing feature and page names still use `不认识的字`.
