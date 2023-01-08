const express = require('express');
const router = express.Router({mergeParams: true});

const Review = require('../models/review');
const Campground = require('../models/campgrounds');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const {createReview, deleteReview} = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(createReview))

router.delete('/:rid', isLoggedIn, isReviewAuthor, catchAsync(deleteReview))

module.exports = router;
