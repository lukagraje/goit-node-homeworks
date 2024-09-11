const { Jimp } = require("jimp"); // Użyj 'require' dla CommonJS
const path = require("path");

// Użyj podwójnych ukośników lub zamień na ukośniki
const imagePath = path.join(
  "C:",
  "Users",
  "lukag",
  "OneDrive",
  "Pulpit",
  "pobrane.png"
);
const outputPath = path.join(
  "C:",
  "Users",
  "lukag",
  "OneDrive",
  "Pulpit",
  "test-small.jpg"
);

const MAX_AVATAR_WIDTH = 256;
const MAX_AVATAR_HEIGHT = 256;

const isImageAndTransform = async (imagePath) => {
  try {
    // Odczytaj obraz
    const image = await Jimp.read(imagePath);

    // Zmień rozmiar obrazu
    image.resize(MAX_AVATAR_WIDTH, MAX_AVATAR_HEIGHT);

    await image.write(outputPath);
    console.log("Image processed and saved successfully.");
    return true;
  } catch (error) {
    console.error("Error processing image:", error);
    return false;
  }
};

// Uruchom test
isImageAndTransform(imagePath)
  .then((result) => {
    if (result) {
      console.log("Test passed.");
    } else {
      console.log("Test failed.");
    }
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
  });
