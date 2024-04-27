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
- [ ] CTRL-Click to go backwards through the palette 
- [ ] Generate a written pattern per row
  - [ ] Account for turns at the end of the row
- [ ] Allow to rename each color palette color extracted

## License

Stitchy code is licensed under [GPL-3.0](LICENSE).

The libraries used are managed under their own licenses:

- [Konva](https://konvajs.org/) - MIT
- [nearest-color](https://github.com/dtao/nearest-color) - MIT
- [ColorThief](https://github.com/lokesh/color-thief) - MIT
