const Campground = require('../models/campgrounds');
const Review = require('../models/review');
module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash('success', 'Successfully posted the review.');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview = async (req, res) =>{
    const {id, rid} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: rid}})
    await Review.findByIdAndDelete(rid);
    req.flash('success', 'Successfully deleted the review.');
    res.redirect(`/campgrounds/${id}`)
}