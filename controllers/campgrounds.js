const Campground = require('../models/campgrounds');
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})
// const express = require('express');
// const multer = require('multer')
// const upload = multer({dest: '/multerUploads'})

module.exports.index = async (req,res)=>{
    const camps = await Campground.find();
    res.render('campgrounds/index', {camps});
}

module.exports.renderNewForm = (req, res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const camp = new Campground(req.body.campground);
    camp.geometry = geoData.body.features[0].geometry
    camp.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    camp.author = req.user._id   
    await camp.save();
    req.flash('success', 'Successfully made a new campground.')
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.showCampground = async (req,res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id).populate({
        path: 'reviews', 
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!camp){
        req.flash('error', "Campground doesn't exist.");
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {camp});
}

module.exports.renderEditForm = async (req, res)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', 'Cannot find requested campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {camp});
}

module.exports.updateCampground = async(req, res, next)=>{
    const {id} = req.params;
    console.log(req.body)
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const addedImg = req.files.map(f => ({url: f.path, filename: f.filename}))
    camp.images.push(...addedImg)
    await camp.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({$pull: { images: {filename: {$in: req.body.deleteImages}}}})
        console.log(camp)
    }
    
    req.flash('success', 'Successfully updated the campground.')
    res.redirect(`/campgrounds/${id}`); 
}

module.exports.deleteCampground = async (req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground.')
    res.redirect('/campgrounds');
}
