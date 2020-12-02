const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

let db = new sqlite3.Database('./db/bigtwo.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log(`Connected to the database.`);
});

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username', passwordField: 'password' },
            (username, password, done) => {

                // Match User
                // Find user in the database
                db.get(`SELECT id id,
                        username username, 
                        password password
                        FROM users WHERE username = (?)`,
                    [username],
                    (err, row) => {
                        if (err) {
                            console.error(err);
                            throw err;
                        }
                        // If not found, return error message
                        if (!row) {
                            return done(null,
                                false,
                                { message: 'That username is not registered' });
                        }
                        // If found, we compare username and password
                        bcrypt.compare(password, row.password, (err, isMatch) => {
                            if (err) throw err;
                            if (isMatch) {
                                return done(null, row);
                            }
                            else {
                                return done(null, false, { message: 'Password incorrect' });
                            }
                        })

                    });

            })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        db.get('SELECT id, username FROM users WHERE id = (?)', id, function(err, user) {
            if (!user) {
                return done(null, false);
            }
            return done(err, user);
        });
    });
}