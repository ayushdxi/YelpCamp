const express = require('express')
const router = express.Router()
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
// const {campgroundSchema} = require('../schemas.js')
// const Campground = require('../models/campgrounds');
// const { exist } = require('joi')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const {index, renderNewForm, createCampground, showCampground, renderEditForm, updateCampground, deleteCampground} = require('../controllers/campgrounds');

router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(createCampground))

    
router.get('/new', isLoggedIn, renderNewForm)

router.route('/:id')
    .get(catchAsync(showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(renderEditForm))

module.exports = router;