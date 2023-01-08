if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const methodOverride = require('method-override');

const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('express-flash')
const path = require('path');
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const passport = require('passport')
const LocalStrategy = require('passport-local')
// const helmet = require('helmet');

const reviewRoutes = require('./routes/reviews')
const campgroundRoutes = require('./routes/campgrounds')
const userRoutes = require('./routes/users')

const User = require('./models/user');
const { register } = require('./models/user');
const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('public'))

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret: process.env.SECRET_CONNECT_MONGO,
    touchAfter: 24 * 60 * 60
})

store.on("error", function(e) {
    console.log("Session store error", e)
})

const sessionConfig = {
    store,
    secret: process.env.SECRET_SESSION_CONFIG,
    resave: 'false',
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query

// To remove data using these defaults:
app.use(mongoSanitize());;

// app.use(helmet());


// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dsnndxxgj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

app.use((req, res, next) => {
    console.log(req.query)
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
})

app.get('/', (req, res)=>{
    res.render('home')
})

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/review', reviewRoutes)
app.use('/', userRoutes)

app.get('/',(req,res)=>{
    res.redirect('/campgrounds');
})


app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next)=>{
    const {message = 'something went wrong', status = 500} = err;
    if(!err.message) err.message = 'Something went wrong!'
    res.status(status).render('error', {err})
})

app.listen(3000, ()=>{
    console.log("Serving on Port 3000")
})