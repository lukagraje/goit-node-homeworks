const passport = require("passport");
const User = require("../models/user");

async function authMiddleware(req, res, next) {
  try {
    passport.authenticate("jwt", { session: false }, async (err, user) => {
      if (!user || err) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      if (!user.token) {
        return res
          .status(401)
          .json({ message: "Token expired or invalidated" });
      }
      if (!user._id) {
        return res.status(401).json({ message: "User not found." });
      }

      const token = req.headers.authorization.split(" ")[1];
      try {
        const dbUser = await User.findById(user._id);
        if (dbUser.token !== token) {
          return res.status(401).json({ message: "Token is no longer valid." });
        }
      } catch (e) {
        return next(e);
      }

      res.locals.user = user;
      next();
    })(req, res, next);
  } catch (e) {
    next(e);
  }
}

module.exports = authMiddleware;
