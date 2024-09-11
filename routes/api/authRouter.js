const express = require("express");
const User = require("../../models/user.js");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const authMiddleware = require("../../middleware/jwt");
const gravatar = require("gravatar");
const { v4: uuidV4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const storeImageDir = path.join(__dirname, "../../public/images");
const isImageAndTransform = require("../../helpers/helpers.js");
const uploadMiddleware = require("../../middleware/uploadMiddleware.js");

const router = express.Router();

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.patch("/register", async (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();

  if (user) {
    return res.status(409).json({ message: "Email in use" });
  }
  try {
    const newUser = new User({ email, password });
    const gravatarURL = gravatar.url(email, true);
    await newUser.setPassword(password);
    newUser.avatarURL = gravatarURL;
    await newUser.save();
    res.status(201).json({
      user: {
        email: email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "No such user" });
    }

    const isPasswordCorrect = await user.validatePassword(password);
    if (isPasswordCorrect) {
      const payload = {
        id: user._id,
        email: user.email,
        subscription: user.subscription,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      user.token = token;
      await user.save();

      return res.status(200).json({
        token: token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } else {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
  } catch (e) {
    next(e);
  }
});

router.get("/logout", authMiddleware, async (_req, res, next) => {
  try {
    const userId = res.locals.user._id;
    const user = await User.findById(userId);

    user.token = null;
    await user.save();

    return res.status(200).json({ message: "user logged out" });
  } catch (err) {
    next(err);
  }
});

router.get("/current", authMiddleware, async (_req, res, next) => {
  try {
    const currentUser = res.locals.user;
    return res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
      avatarURL: currentUser.avatarURL,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  async (req, res, next) => {
    console.log("File received:", req.file); // Log file data

    if (!req.file) {
      console.log("No file uploaded.");
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { path: temporaryPath } = req.file;
    console.log("Temporary path:", temporaryPath); // Log temporary path

    const extension = path.extname(temporaryPath);
    const fileName = `${uuidV4()}${extension}`;
    const filePath = path.join(storeImageDir, fileName);

    console.log("File path:", filePath); // Log final file path

    const isValidAndTransform = await isImageAndTransform(temporaryPath);
    if (!isValidAndTransform) {
      console.log("File is not a valid photo.");
      await fs.unlink(temporaryPath);
      return res
        .status(400)
        .json({ message: "File is not a photo but is pretending." });
    }

    try {
      await fs.rename(temporaryPath, filePath);
      console.log("File successfully moved.");
    } catch (e) {
      console.error("Error moving file:", e);
      await fs.unlink(temporaryPath);
      return next(e);
    }

    try {
      const currentUser = res.locals.user;
      currentUser.avatarURL = `/avatars/${fileName}`;
      await currentUser.save();
      console.log("Avatar URL saved.");
      return res.status(200).json({ avatarURL: currentUser.avatarURL });
    } catch (e) {
      console.error("Error saving user avatar URL:", e);
      return next(e);
    }
  }
);

module.exports = router;
