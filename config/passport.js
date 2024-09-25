const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'mssv',
        passwordField: 'password'
    }, async (mssv, password, done) => {
        try {
            const user = await User.findOne({ mssv });
            if (!user) return done(null, false, { message: 'Tài khoản không tồn tại' });

            const isMatch = await user.isValidPassword(password);
            if (isMatch) return done(null, user);
            return done(null, false, { message: 'Mật khẩu không đúng' });
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};
