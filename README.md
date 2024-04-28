# Stitchy

My wife loves to crochet, and likes to challenge herself by making new rectangular patterns from images she finds online. To support her ~~addiction~~ hobby, I'm building a web-app to help her generate these patterns.

## Goals / To Do

- [x] `Create` a grid of x-width and y-height
- [x] `Upload` an image to overlay the grid
- [x] `Rotate`, `Scale`, `Transform` the image onto the grid
- [x] `Process` the image using either black & white or dominant color per grid block
- [x] `Print` or `Save` the generated image
- [x] Make everything look pretty
- [x] Click on a rendered grid square to cycle its color through palette options
- [x] Allow to rename each color palette color extracted
- [ ] Ctrl-click to cycle backwards
- [x] Generate a written pattern per row txt
  - [x] Account for turns at the end of the row
  - [ ] Wrong side right side option
  - [ ] Row number line option
- [ ] Add and remove colors from the palette
- [ ] Allow to choose color extract lib
- [ ] Progress renderer

## License

Stitchy code is licensed under [GPL-3.0](LICENSE).

The libraries used are managed under their own licenses:

- [Konva](https://konvajs.org/) - MIT
- [nearest-color](https://github.com/dtao/nearest-color) - MIT
- [ColorThief](https://github.com/lokesh/color-thief) - MIT
- [Color.js](https://github.com/luukdv/color.js) - MIT
- [Invert Color](https://github.com/onury/invert-color) - MIT
