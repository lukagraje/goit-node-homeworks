const Jimp = require("jimp");
const fs = require("fs").promises;

const MAX_AVATAR_WIDTH = 250;
const MAX_AVATAR_HEIGHT = 250;
const isImageAndTransform = async (path) =>
  new Promise((resolve) => {
    Jimp.read(path, async (err, image) => {
      if (err) resolve(false);

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

  const isAccessible = (path) =>
    fs
      .access(path)
      .then(() => true)
      .catch(() => false);

const setupFolder = async (path) => {
  const folderExist = await isAccessible(path);
  if (!folderExist) {
    try {
      await fs.mkdir(path);
    } catch (e) {
      console.log("no permissions!");
      process.exit(1);
    }
  }
};

module.exports = { isImageAndTransform, setupFolder };
