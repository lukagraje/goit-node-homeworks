const express = require("express");
const User = require("../../models/user.js");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const authMiddleware = require("../../middleware/jwt");
const gravatar = require("gravatar");
const { v4: uuidV4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const storeAvatarDir = path.join(__dirname, "../../public/images");
const isImageAndTransform = require("../../helpers/helpers.js");
const uploadMiddleware = require("../../middleware/uploadMiddleware.js");
const { sendVerificationEmail } = require("../../controllers/email.js");
const router = express.Router();

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }, { _id: 1 }).lean();
  if (user) {
    return res.status(409).json({ message: "Email in use" });
  }
  try {
    const verificationToken = uuidV4().replace(/-/g, "").substring(0, 20);
    const newUser = new User({ email, password, verificationToken });
    const gravatarURL = gravatar.url(email);

    await newUser.setPassword(password);
    newUser.avatarURL = gravatarURL;
    await newUser.save();

    await sendVerificationEmail(email, verificationToken, req);

    return res.status(201).json({
      message: `${email} - User Created. Verification email sent.`,
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

router.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "File isn't a photo." });
    }
    const { path: temporaryPath } = req.file;
    const extension = path.extname(temporaryPath);
    const fileName = `${uuidV4()}${extension}`;
    const filePath = path.join(storeAvatarDir, fileName);

    try {
      await fs.rename(temporaryPath, filePath);
    } catch (error) {
      await fs.unlink(temporaryPath);
      return next(error);
    }

    const isValidAndTransform = await isImageAndTransform(filePath);
    if (!isValidAndTransform) {
      await fs
        .unlink(filePath)
        .catch((err) => console.error("Failed to remove invalid file", err));
      return res
        .status(400)
        .json({ message: "File isn't a photo or couldn't be processed." });
    }

    try {
      const userId = res.locals.user._id;
      const currentUser = await User.findById(userId);
      currentUser.avatarURL = `/avatars/${fileName}`;

      await currentUser.save();

      return res.status(200).json({ avatarURL: currentUser.avatarURL });
    } catch (err) {
      await fs.unlink(filePath).catch((err) => {
        console.error("Failed to remove file after user update error:", err);
      });
      next(err);
    }
  }
);

router.get("/verify/:verificationToken", async (req, res) => {
  const { verificationToken } = req.params;

  console.log(`Verification Token: ${verificationToken}`);

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "Not Found" });
    }

    user.verify = true;

    await user.save();

    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/verify", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Missing required field email" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await sendVerificationEmail(email, user.verificationToken, req);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
