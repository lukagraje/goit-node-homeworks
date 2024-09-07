const passport = require("passport");

async function authMiddleware(req, res, next) {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (!user || err) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      res.locals.user = user;
      next();
    })(req, res, next);
  } catch (e) {
    next(e);
  }
}

module.exports = authMiddleware;
