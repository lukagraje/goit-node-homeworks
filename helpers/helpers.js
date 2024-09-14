const Jimp = require("jimp");

const MAX_AVATAR_WIDTH = 250;
const MAX_AVATAR_HEIGHT = 250;
const isImageAndTransform = async (path) =>
  new Promise((resolve, reject) => {
    Jimp.read(path, async (err, image) => {
      if (err) return reject(err);

      try {
        await image
          .rotate(360)
          .resize(MAX_AVATAR_WIDTH, MAX_AVATAR_HEIGHT)
          .write(path);
        resolve(true);
      } catch (e) {
        console.log(e);
        resolve(false);
      }
    });
  });

module.exports = isImageAndTransform;
