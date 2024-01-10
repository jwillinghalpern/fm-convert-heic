# fm-convert-heic

Convert a HEIC to a PNG or JPG in a FileMaker Web Viewer

## Usage

Check out the fmp12 file for example usage

## Development

### To install

```bash
npm install
```

### To Build for production (creates an html file you can put in a FileMaker field or text object)

```bash
npm run build
```

Then copy the html file in `dist`

## Example

![fmp file](./readme-image.png)

## Notes

- This uses <https://github.com/alexcorvi/heic2any> to convert images. Please note that image metadata will not survive the conversion.

## Credits

- Thanks to Andrew Mallinson for his help refining this example to include JPG conversion and his notes in the fmp12 file about detecting HEIC from Windows.
