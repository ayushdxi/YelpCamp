const mongoose = require('mongoose');
const Campground = require('../models/campgrounds');
const cities = require('./cities');
const images = require('./images')

const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {});

// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
// const mapBoxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({accessToken: mapBoxToken})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})

const sample = (array)=>array[Math.floor(Math.random()*array.length)];

const seedDb = async ()=>{
    await Campground.deleteMany();
    for(let i = 0; i < 250; i++){
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random() * 150) + 10;

        const camp = new Campground({
            author: '63ad4784e4c83b64bd97302d',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title:  `${sample(descriptors)} ${sample(places)}`,
            images: [
              {
                url: `${images[i%images.length].url}`,
                filename: `${images[i%images.length].filename}`
              },
              {
                url: `${images[(i+1)%images.length].url}`,
                filename: `${images[(i+1)%images.length].filename}`
              },
              {
                url: `${images[(i+2)%images.length].url}`,
                filename: `${images[(i+2)%images.length].filename}`
              }
            ],
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ]
            },
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam quaerat unde impedit nisi nulla facere velit doloremque. Excepturi, sint soluta nemo quasi quis autem ducimus delectus quod quam porro amet.Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quibusdam quod numquam, error placeat assumenda doloremque vel accusantium molestiae dignissimos fugiat tenetur enim minima. Deserunt voluptates fuga sint, consequuntur dolore sed?",
            price: price
        })
        // camp.geometry = geoData.body.features[0].geometry
        // console.log(camp.geometry)
        camp.save();
    }
}
seedDb();

// const camp = new Campground(req.body.campground);

// geometry: {
//   type: {
//     type: String,
//     enum: ['Point'],
//     required: true
//   },
//   coordinates: {
//     type: [Number],
//     required: true
//   }
// },