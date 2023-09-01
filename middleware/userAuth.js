const collection = require("../models/userModel")
const isLogout = async (req, res, next) => {

    try {
        if (req.session && req.session.user) {
            res.redirect('/')

        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}


const isLogin = async (req, res, next) => {

    try {
        if (req.session.user) {
            next();
        } else {

            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}


const userblock = async (req, res, next) => {
    try {
        const user = req.session.user;
        if (user) {
            const userData = await collection.findById(user._id);
            if (userData.blocked === true) {
                console.log('User is blocked. Redirecting to login page.');
                delete req.session.user;
                return res.redirect('/login');
            }
        }
        next();
    } catch (error) {
        console.error('Error in userblock middleware:', error);
        res.status(500).send('Error user logout');
    }
}




module.exports = {
    isLogin,
    isLogout,
    userblock
}