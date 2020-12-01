const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' },
            (username, password, done) => {

                // Match User
                    // Find the user in the db
                // If found
                // catch err if no user
                    // return done(null, false, {message: 'That username is not registered'})
                // Match Password
                // bcrypt.compare(password, user.password, (err, isMatch) => {
                    // if (err) throw err;
                    // if (isMatch) {
                        // return done(null, user);
                       // }
                // else {
                    //return done(null, false, { message: 'Password incorrect' });
                // }
                //});
            })
    );

    /**
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
    */
}