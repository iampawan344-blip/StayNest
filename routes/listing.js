const express = require("express");
const router = express.Router();

const multer = require("multer");
const { storage } = require("../cloudconfig.js");

const upload = multer({
  storage,
});


const wrapAsync = require("../utils/wrapasync.js");

const listingcontroller = require("../controller/listings.js");


const {
  isLoggedIn,
  isOwner,
  validateListing,
} = require("../middleware.js");



// ===============================
// INDEX + CREATE
// ===============================

router
  .route("/")

  .get(
    wrapAsync(listingcontroller.index)
  )

  .post(
    isLoggedIn,

    upload.single("listing[image]"),

    validateListing,

    wrapAsync(
      listingcontroller.createListing
    )
  );



// ===============================
// NEW
// ===============================

router
  .route("/new")

  .get(
    isLoggedIn,

    listingcontroller.renderNewForm
  );



// ===============================
// SHOW + UPDATE + DELETE
// ===============================

router
  .route("/:id")

  .get(
    wrapAsync(
      listingcontroller.showListing
    )
  )

  .put(
    isLoggedIn,

    isOwner,

    upload.single("listing[image]"),

    validateListing,

    wrapAsync(
      listingcontroller.updateListing
    )
  )

  .delete(
    isLoggedIn,

    isOwner,

    wrapAsync(
      listingcontroller.destroyListing
    )
  );



// ===============================
// EDIT
// ===============================

router
  .route("/:id/edit")

  .get(
    isLoggedIn,

    isOwner,

    wrapAsync(
      listingcontroller.renderEditForm
    )
  );



module.exports = router;