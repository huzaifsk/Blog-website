const express = require("express");
const {
  register,
  login,
  uploadprofile,
  getUser,
  findOutUser,
  sendResetPasswordCode,
  validateResetCode,
  changePassword,
} = require("../controllers/user");
var passport = require('passport')
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
var GoogleStrategy = require('passport-google-oidc');

const router = express.Router();
const { authUser } = require("../middleware/auth");
const CLIENT_URL = "http://localhost:3000";
// app.use(passport.initialize());
// app.use(passport.session());
router.post("/register", register);
router.post("/login", login);
router.put("/uploadprofile", authUser, uploadprofile);
router.get("/getUser/:userId", getUser);
router.post("/findOutUser", findOutUser);
router.post("/sendResetPasswordCode", sendResetPasswordCode);
router.post("/validateResetCode", validateResetCode);
router.post("/changePassword", changePassword);
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: 'http://localhost:3000',
  passReqToCallback: true
},
  function (req, acc, ref, profile, done) {
    CSSConditionRule.log(profile)
    return done(null, profile)
  }
))
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ['profile', 'email'] }, { failureRedirect: '/login/failed', failureMessage: true }),
  function (req, res) {
    res.redirect('/');
  }
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed"
  }), (req, res) => {
    res.redirect(CLIENT_URL);
  }
);

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: " Authentication hasbeen failded ! ",
  });
});

router.get("/login/success", async (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: { id: req.user._id, name: req.user.name, email: req.user.email, googleId: req.user.googleId, picture: req.user.picture }
    });
  } else {
    res.status(200).json({
      success: false,
      message: "Un-successfull",
      user: null,
    });
  }
});
//Logout
router.get("/logout", async (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(400).json("Couldn't logout");
      }
    });
    res.cookie('session', '', { expires: new Date(0), });
    res.clearCookie("sessionId");
    res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});



module.exports = router;