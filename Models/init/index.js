const mongoose = require("mongoose");

const data = require("./data.js");

const Listing = require("../listing.js");
const User = require("../user.js");

const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(Mongo_Url);
}

const initdb = async () => {

    await Listing.deleteMany({});

    const user = await User.findOne({});

    if (!user) {
        console.log("No user found. Please signup first.");
        return;
    }

    const listings = data.data.map((obj) => ({
        ...obj,
        owner: user._id
    }));

    await Listing.insertMany(listings);

    console.log("data was initialised");
};

initdb();