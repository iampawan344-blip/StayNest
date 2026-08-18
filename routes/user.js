const express = require("express");
const router = express.Router();

const User = require("../Models/user.js");
const wrapAsync = require("../utils/wrapasync.js");

const passport = require("passport");
const usersm = require("../controller/users");

const { saveRedirectUrl } = require("../middleware.js");

// ================= SIGNUP =================

router.route("/signup")
    .get(usersm.rendersignup)
    .post(
        wrapAsync(usersm.signup)
    );

// ================= LOGIN =================

router.route("/login")
    .get(usersm.renderlogin)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        usersm.login
    );

// ================= LOGOUT =================

router.get(
    "/logout",
    usersm.logout
);

module.exports = router;