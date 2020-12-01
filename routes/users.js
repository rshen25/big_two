const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');

/**
 * Database
 */
let db = new sqlite3.Database('./db/bigtwo.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log(`Connected to the database.`);
});

// Create Table if it does not exist 
db.serialize(() => {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, salt TEXT)`)
        .run().finalize();

    db.close();
});

// User model
// const User = require('../models/User'); // -----

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, password, password2 } = req.body;

    let errors = [];

    // Check required fields
    if (!name || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check if passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check if password meets length requirement
    if (password.length < 6) {
        errors.push({msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            password,
            password2
        });
    }
    else {
        // Validation passed

        // Check if user exists

        // If does not exist

            // Create new user

            // Hash password
            // bcrypt.genSalt(10, (err, salt) => 
                // bcrypt.hash(password, salt, (error, hash) => { 
                    // if (err) throw err;
                    // set the password to the hashed password
                // });)

            // Save to the database

        // req.flash('success_msg', 'You are now registered and can log in');
        // res.redirect('/users/login');
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',      // Change this to the lobby screen
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login');
});

module.exports = router;