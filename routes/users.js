const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, password, password2 } = req.body;

    let errors = [];

    /**
     * Database
     */
    let db = new sqlite3.Database('./db/bigtwo.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log(`Connected to the database.`);
    });

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
        db.get(`SELECT username FROM users WHERE username = ?`,
            [name], (err, row) => {
                if (err) {
                    console.error(err);
                }
                if (row) {
                    errors.push({ msg: 'User already exists' });
                    res.render('register', {
                        errors,
                        name,
                        password,
                        password2
                    });
                }
                // If does not exist, then we will create a new user
                else {
                    // Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(password, salt, (err, hash) => {
                            if (err) {
                                throw err;
                            }
                            let user = { name: name, password: hash };
                            // Save to the database
                            db.run(`INSERT INTO users(username, password) VALUES (?, ?)`,
                                [user.name, user.hash], (err) => {
                                    if (err) {
                                        console.error(err);
                                        throw err;
                                    }
                                });
                            console.log(`Inserted : ${user.name}, ${user.hash}`);
                            db.close();
                            // Redirect back to login page
                            user => req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');
                        });
                    });
                }
        });
    }
   
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',      // Change this to the lobby screen
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;