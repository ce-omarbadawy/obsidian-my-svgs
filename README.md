# My SVGs Plugin for Obsidian
I made this because I couldn't find any alternatives whatsoever. It triggered a brain-itch that I couldn't get rid of. So, I hope this helps someone that needs it.

This is a straightforward plugin that allows you to use custom SVG icons in your Obsidian vault. Load your own SVG icons and use them anywhere Obsidian accepts icon references. The code is of course not the best. I used lots of AI making this so I don't expect it to be flawless... But it works and I tried what I can to get it to be safe and user-friendly.

## Features

- Load custom SVG icons from a dedicated folder
- Searchable Visual grid with live preview in settings
- Live reload support via ribbon button or settings
- One-click copy of icon references
- Automatic conversion of black colors to `currentColor`
- Preserves SVG styling while ensuring theme adaptability
- Error messages, console logging, and instructions
- Continues loading remaining icons if one fails


## Installation

1. If it doesn't already exist, Create an `icons` folder in your plugin directory: `"YourVaultName"/.obsidian/plugins/my-svgs/icons/`
2. Add your SVG files to the icons folder
3. Use the reload button to load your icons
4. Icons become available as `my-filename` (customizable prefix)

## Technical Details:
### SVG Processing

The plugin processes SVGs to ensure compatibility with Obsidian's icon system:

- Removes XML declarations and DOCTYPE
- Normalizes viewBox attributes
- Converts style-based fills/strokes to attributes
- Replaces black colors with `currentColor` for theme support

### Areas for Improvement

   - No built-in way to delete or rename icons
   - No automatic reload when files change (manual reload required)
   - No support for nested folders in the icons directory
   - Could be optimized for large icon collections
   - Basic SVG sanitization could be more comprehensive
   - No validation of SVG content beyond basic processing
   - No size limits on SVG files

## Contributing

This is a basic but functional plugin. Contributions are welcome since I probably won't update much because I don't think it needs much. I'm happy with it as it is.

##   Sponsor this project
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/omarbadawy)

## Disclaimer

This plugin is provided as-is. Users should be cautious when adding SVG files from untrusted sources, They are scriptable and dangerous. The plugin performs basic SVG processing but does not guarantee your vault won't explode. Please don't blame me if anything goes wrong. I'm actively using this myself and I don't have any issues.
