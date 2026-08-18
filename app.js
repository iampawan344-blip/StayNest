if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const Listing = require("./Models/listing.js");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");


const ExpressError = require("./utils/expresseror.js");
const wrapAsync = require("./utils/wrapasync.js");

const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./Models/user.js");
const dbUrl=process.env.ATLASDB_URL;

// ================= CONFIG =================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARE =================

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));
const store=MongoStore.create({
      mongoUrl:dbUrl,
      crypto:{
        secret:process.env.SECRET,
      },
      touchAfter:24*3600,
});
store.on("error",()=>{
  console.log("ERROR IN MONGO. SESSION STORE",err)
})
// ================= SESSION =================

const sessionOptions = {
  store,
  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: true,

  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

    maxAge: 7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};


app.use(session(sessionOptions));

app.use(flash());

// ================= PASSPORT =================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// ================= DATABASE =================


main()
  .then(() => {
    console.log("server is connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// ================= GLOBAL LOCALS =================

app.use((req, res, next) => {
  res.locals.success = req.flash("success");

  res.locals.error = req.flash("error");

  res.locals.currUser = req.user;

  next();
});

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingsRouter);

app.use("/listings/:id/reviews", reviewsRouter);

app.use("/", userRouter);

// ================= PRIVACY + TERMS =================
// These must stay ABOVE the 404 route.

app.get("/privacy", (req, res) => {
  res.render("privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("terms.ejs");
});

// ================= TEST =================

app.get(
  "/testlist",

  wrapAsync(async (req, res) => {
    const samplelist = new Listing({
      title: "my new villa",

      description: "this is very beautiful",

      price: 1200,

      location: "uttar pradesh",

      country: "india",
    });

    await samplelist.save();

    res.send("successful testing");
  })
);

// ================= 404 =================

app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  const {
    statusCode = 500,
    message = "Something Went Wrong!",
  } = err;

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).render("error.ejs", {
    err,
  });
});

// ================= SERVER =================

app.listen(8080, () => {
  console.log("server is working");
});