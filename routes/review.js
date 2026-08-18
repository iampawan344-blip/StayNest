const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/expresseror.js");

const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const { reviewSchema } = require("../schema.js");

const Review = require("../Models/reviews.js");
const Listing = require("../Models/listing.js");
const reviewcon=require("../controller/review.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewcon.create)
);

router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewcon.delete)
);

module.exports = router;