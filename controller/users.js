const User=require("../Models/user");


module.exports.signup=async (req, res, next) => {

        try {

            const {
                username,
                email,
                password
            } = req.body;

            const newUser = new User({
                username,
                email
            });

            const registeredUser =
                await User.register(
                    newUser,
                    password
                );

            req.login(
                registeredUser,
                (err) => {

                    if (err) {
                        return next(err);
                    }

                    req.flash(
                        "success",
                        "Welcome to StayNest!"
                    );

                    return res.redirect(
                        "/listings"
                    );
                }
            );

        } catch (e) {

            req.flash(
                "error",
                e.message
            );

            return res.redirect(
                "/signup"
            );
        }
    }

    module.exports.rendersignup= (req, res) => {

        res.render("users/signup.ejs");
    }
    module.exports.renderlogin=(req, res) => {

        res.render("users/login.ejs");
    }
    module.exports.login=(req, res) => {

        req.flash(
            "success",
            "Welcome to  StayNest! You are logged in!"
        );

        const redirectUrl =
            res.locals.redirectUrl ||
            "/listings";

        return res.redirect(
            redirectUrl
        );
    }
    module.exports.logout=(req, res, next) => {

        req.logout(
            (err) => {

                if (err) {
                    return next(err);
                }

                req.flash(
                    "success",
                    "You are logged out!"
                );

                return res.redirect(
                    "/listings"
                );
            }
        );
    }