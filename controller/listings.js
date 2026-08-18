const Listing = require("../Models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
  accessToken: mapToken,
});



module.exports.index = async (req, res) => {

  const validCategories = [
    "rooms",
    "mountains",
    "iconic-city",
    "castles",
    "amazing-pool",
    "camping",
    "farms",
    "arctic",
  ];

  const category = req.query.category;
  const search = req.query.search;

  let filter = {};




  if (validCategories.includes(category)) {
    filter.category = category;
  }



  if (search && search.trim() !== "") {

    filter.$or = [
      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },

      {
        location: {
          $regex: search.trim(),
          $options: "i",
        },
      },

      {
        country: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];

  }


  const allListings = await Listing.find(filter);


  res.render("listings/index.ejs", {
    allListings,
    selectedCategory: category || "trending",
  });

};



// ===============================
// NEW LISTING FORM
// ===============================

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};



// ===============================
// CREATE NEW LISTING
// ===============================

module.exports.createListing = async (req, res) => {

  const listing = new Listing(req.body.listing);


  // Image
  if (req.file) {

    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

  }


  // Location
  const locationQuery = [listing.location, listing.country]
    .filter(Boolean)
    .join(", ");


  // Geocoding
  const geoData = await geocodingClient
    .forwardGeocode({
      query: locationQuery,
      limit: 1,
    })
    .send();


  const feature = geoData.body.features[0];


  if (!feature) {

    req.flash(
      "error",
      "Location not found. Please enter a valid city or address."
    );

    return res.redirect("/listings/new");

  }


  listing.geometry = feature.geometry;

  listing.owner = req.user._id;


  await listing.save();


  req.flash(
    "success",
    "New listing created!"
  );


  res.redirect(`/listings/${listing._id}`);

};



// ===============================
// SHOW LISTING
// ===============================

module.exports.showListing = async (req, res) => {

  const { id } = req.params;


  const listing = await Listing.findById(id)

    .populate({
      path: "reviews",

      populate: {
        path: "author",
      },
    })

    .populate("owner");


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested does not exist!"
    );

    return res.redirect("/listings");

  }


  // Check geometry
  const hasValidGeometry =
    listing.geometry &&
    listing.geometry.type === "Point" &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2;


  // Add coordinates automatically to old listings
  if (!hasValidGeometry) {

    const locationQuery = [
      listing.location,
      listing.country
    ]
      .filter(Boolean)
      .join(", ");


    try {

      const geoData = await geocodingClient
        .forwardGeocode({
          query: locationQuery,
          limit: 1,
        })
        .send();


      const feature = geoData.body.features[0];


      if (feature) {

        listing.geometry = feature.geometry;

        await listing.save();

      }

    } catch (error) {

      console.log(
        "Map location could not be found:",
        locationQuery
      );

    }

  }


  res.render("listings/show.ejs", {
    listing,
    mapToken,
  });

};



// ===============================
// EDIT FORM
// ===============================

module.exports.renderEditForm = async (req, res) => {

  const { id } = req.params;


  const listing = await Listing.findById(id);


  if (!listing) {

    req.flash(
      "error",
      "Listing you requested does not exist!"
    );

    return res.redirect("/listings");

  }


  let originalImageUrl = listing.image.url;

  originalImageUrl =
    originalImageUrl.replace(
      "/upload",
      "/upload/w_250"
    );


  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
  });

};



// ===============================
// UPDATE LISTING
// ===============================

module.exports.updateListing = async (req, res) => {

  const { id } = req.params;


  const listing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body.listing,
    },
    {
      new: true,
      runValidators: true,
    }
  );


  // New image
  if (req.file) {

    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

  }


  // Update location
  const locationQuery = [
    listing.location,
    listing.country
  ]
    .filter(Boolean)
    .join(", ");


  const geoData = await geocodingClient
    .forwardGeocode({
      query: locationQuery,
      limit: 1,
    })
    .send();


  const feature = geoData.body.features[0];


  if (feature) {

    listing.geometry = feature.geometry;

  }


  await listing.save();


  req.flash(
    "success",
    "Listing updated!"
  );


  res.redirect(`/listings/${listing._id}`);

};



// ===============================
// DELETE LISTING
// ===============================

module.exports.destroyListing = async (req, res) => {

  const { id } = req.params;


  await Listing.findByIdAndDelete(id);


  req.flash(
    "success",
    "Listing deleted!"
  );


  res.redirect("/listings");

};