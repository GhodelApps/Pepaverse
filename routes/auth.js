const router = require("express").Router();
const User = require("../models/user");
const passport = require("passport");
const { validateEmail, validatePassword } = require("../utils/validation.js");

router.post("/register", (req, res) => {
  const { username, password, confirm } = req.body;
  const name = username.split("@")[0];
  const profileUrl = "/default-profile.jpg";

  if (!validateEmail(username)) {
    res.render("register", { error: { emailError: "Invalid email format" } });
    return;
  }
  if (!validatePassword(password, confirm)) {
    res.render("register", {
      error: {
        passwordError:
          "Password should contain atleast one digit, one lower and upper case letter and the length should be atleast 8 characters",
      },
    });
    return;
  }
  User.register({ username, name, profileUrl }, password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/register");
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect("/");
    });
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = new User({
    username,
    password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    passport.authenticate("local", {
      failureRedirect: "/login",
    })(req, res, () => {
      res.redirect("/");
    });
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get(
  "/google/home",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

module.exports = router;
