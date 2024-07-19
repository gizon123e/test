const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');

dotenv.config()

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID_LOGIN_OAUTH,
    clientSecret: process.env.CLIENT_SECRET_LOGIN_OAUTH,
    callbackURL: "https://gull-assuring-pigeon.ngrok-free.app/api/login/google-oauth/success"
  },
  function(accessToken, refreshToken, profile, cb) {
    
    const user = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value
    }

    return cb(null, user);
  }
));

passport.serializeUser((user, done) => {
    done(null, user);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;