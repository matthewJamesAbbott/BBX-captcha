import * as Blockly from 'blockly/core';

class SnowballConstantProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super();

    this.NOTCH_WIDTH = 4 * this.GRID_UNIT;
    this.CORNER_RADIUS = 1 * this.GRID_UNIT;

    this.FIELD_DROPDOWN_SVG_ARROW_DATAURI =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOSIgaGVpZ2h0PSI1IiB2aWV3Qm94PSIwIDAgOSA1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNC45MTgxMSA0LjMzMDM0QzQuNzYwNzUgNC40OTM4OCA0LjQ5OTAxIDQuNDkzODggNC4zNDE2NSA0LjMzMDM1TDAuOTUxNTM3IDAuODA3MjMzQzAuNzA3MDA5IDAuNTUzMTEyIDAuODg3MTAzIDAuMTI5ODgzIDEuMjM5NzcgMC4xMjk4ODNMOC4wMiAwLjEyOTg4MkM4LjM3MjY2IDAuMTI5ODgyIDguNTUyNzYgMC41NTMxMTEgOC4zMDgyMyAwLjgwNzIzMkw0LjkxODExIDQuMzMwMzRaIiBmaWxsPSIjMDAyRTQyIi8+Cjwvc3ZnPgo=';
  }

  /**
   * Renderer specific CSS
   *
   * @param selector CSS selector to use.
   * @returns Array of CSS strings.
   */
  override getCSS_(selector: string) {
    return [
      // Text.
      `${selector} .blocklyText,`,
      `${selector} .blocklyFlyoutLabelText {`,
      `font: ${this.FIELD_TEXT_FONTWEIGHT} ${this.FIELD_TEXT_FONTSIZE}` +
        `pt ${this.FIELD_TEXT_FONTFAMILY};`,
      `}`,

      // Fields.
      `${selector} .blocklyText {`,
      `fill: #002E42;`,
      `}`,
      `${selector} .blocklyNonEditableText>rect:not(.blocklyDropdownRect),`,
      `${selector} .blocklyEditableText>rect:not(.blocklyDropdownRect) {`,
      `fill: ${this.FIELD_BORDER_RECT_COLOUR};`,
      `}`,
      `${selector} .blocklyNonEditableText>text,`,
      `${selector} .blocklyEditableText>text,`,
      `${selector} .blocklyNonEditableText>g>text,`,
      `${selector} .blocklyEditableText>g>text {`,
      `fill: #575E75;`,
      `}`,

      // Flyout labels.
      `${selector} .blocklyFlyoutLabelText {`,
      `fill: #575E75;`,
      `}`,

      // Bubbles.
      `${selector} .blocklyText.blocklyBubbleText {`,
      `fill: #575E75;`,
      `}`,

      // Editable field hover.
      `${selector} .blocklyDraggable:not(.blocklyDisabled)`,
      ` .blocklyEditableText:not(.editing):hover>rect,`,
      `${selector} .blocklyDraggable:not(.blocklyDisabled)`,
      ` .blocklyEditableText:not(.editing):hover>.blocklyPath {`,
      `stroke: #fff;`,
      `stroke-width: 1;`,
      `}`,

      // Text field input.
      `${selector} .blocklyHtmlInput {`,
      `font-family: ${this.FIELD_TEXT_FONTFAMILY};`,
      `font-weight: ${this.FIELD_TEXT_FONTWEIGHT};`,
      `color: #575E75;`,
      `}`,

      // Dropdown field.
      `${selector} .blocklyDropdownText {`,
      `fill: #002E42 !important;`,
      `}`,

      // Widget and Dropdown Div
      `${selector}.blocklyWidgetDiv .goog-menuitem,`,
      `${selector}.blocklyDropDownDiv .goog-menuitem {`,
      `font-family: ${this.FIELD_TEXT_FONTFAMILY};`,
      `}`,
      `${selector}.blocklyDropDownDiv .goog-menuitem-content {`,
      `color: #002E42;`,
      `}`,

      // Connection highlight.
      `${selector} .blocklyHighlightedConnectionPath {`,
      `stroke: ${this.SELECTED_GLOW_COLOUR};`,
      `}`,

      // Disabled outline paths.
      `${selector} .blocklyDisabled > .blocklyOutlinePath {`,
      `fill: url(#blocklyDisabledPattern${this.randomIdentifier})`,
      `}`,

      // Insertion marker.
      `${selector} .blocklyInsertionMarker>.blocklyPath {`,
      `fill-opacity: ${this.INSERTION_MARKER_OPACITY};`,
      `stroke: none;`,
      `}`,

      // Selection highlight.
      `${selector} .blocklySelected>.blocklyPath {`,
      `stroke: #C1C1C1;`,
      `stroke-width: 1px;`,
      `filter: none;`,
      `}`,

      // Connection highlight.
      `${selector} .blocklyHighlightedConnectionPath {`,
      `stroke: #C1C1C1;`,
      `}`,
    ];
  }
}

export class SnowballRenderer extends Blockly.zelos.Renderer {
  constructor(name: string) {
    super(name);
  }

  /**
   * @override
   */
  makeConstants_() {
    return new SnowballConstantProvider();
  }
}
