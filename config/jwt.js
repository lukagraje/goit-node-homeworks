const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user");

require("dotenv").config();

function setJWTStrategy() {
  const secret = process.env.JWT_SECRET;
  const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  passport.use(
    new JwtStrategy(params, async (payload, done) => {
      try {
        const user = await User.findById({ _id: payload.id }).lean();

        if (!user) {
          return done(new Error("User not found."), false);
        }

        return done(null, user);
      } catch (e) {
        return done(e, false);
      }
    })
  );
}

module.exports = setJWTStrategy;
