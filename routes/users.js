const express = require('express')
const app = express()
const router = express.Router()
app.use(express.urlencoded({extended: true}));
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const {renderRegister, register, renderLogin, login, logout} = require('../controllers/users')
const User = require('../models/user')

router.route('/register')
    .get(renderRegister)
    .post(catchAsync(register))

router.route('/login')
    .get(renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), 
    catchAsync (login))

router.get('/logout', logout)

module.exports = router

