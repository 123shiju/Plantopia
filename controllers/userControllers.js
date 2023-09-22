const collection = require("../models/userModel")
const productcollection = require("../models/productModel")
const categorycollection = require("../models/categoryModel")
const wishListCollection = require('../models/wishlistModel')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const randomstring = require('randomstring');
const offerCollection = require('../models/offerModel')
const { body, validationResult } = require('express-validator');

const twilio = require('twilio')
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

const twilioClient = new twilio('AC6e06aefcf99507e1be189311adc66bb8', '95b56a6b1e7cb7dce002efb7ad859289');

const sendverifymail = async (email, otp, req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'shijukk1997@gmail.com',
                pass: 'vfmyifaglcmzipxe'
            }
        });

        const mailOptions = {
            from: 'shijukk1997@gmail.com',
            to: email,
            subject: 'OTP for Login',
            text: `Your OTP for login is: ${otp}`,
        }
        try {
            await transporter.sendMail(mailOptions);

        } catch (err) {
            console.error('Error sending OTP email:', err);
        }
    } catch (error) {
        console.log(error.message);
    }
}

const securepassword = async (password) => {
    try {

        const passwordHash = bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async (req, res) => {
    try {
        let user = req.session.user
        res.render('home', { user })
    } catch (error) {
        console.log(error.message);
    }
}


const loadshop = async (req, res) => {
    try {
        let user = req.session.user;
        const { query, categoryFilter, minPrice, maxPrice, sortOrder } = req.query;

        const filterQuery = {};

        if (query) {
            const numericQuery = parseFloat(query);
            if (!isNaN(numericQuery)) {
                filterQuery.sale_price = numericQuery;
            } else {
                filterQuery.product_name = { $regex: query, $options: 'i' };
            }
        }

        if (categoryFilter) {

            const category = await categorycollection.findOne({ category_name: categoryFilter });
            if (category) {
                filterQuery.product_category = category._id;
            }
        }





        if (minPrice && !isNaN(minPrice)) {
            filterQuery.sale_price = { ...filterQuery.sale_price, $gte: parseFloat(minPrice) };
        }

        if (maxPrice && !isNaN(maxPrice)) {
            if (!filterQuery.sale_price) {
                filterQuery.sale_price = {};
            }
            filterQuery.sale_price.$lte = parseFloat(maxPrice);
        }

        const sortOption = {};
        if (sortOrder === 'asc' || sortOrder === 'desc') {
            sortOption.sale_price = sortOrder === 'asc' ? 1 : -1;
        }


        const currentDate = new Date();


        


        let productData;

        if (Object.keys(filterQuery).length === 0 && !sortOrder) {
            productData = await productcollection.find().populate('product_category', 'category_name');;


        } else {


            let productDataQuery = productcollection.find(filterQuery).sort(sortOption);

            productDataQuery.populate('product_category', 'category_name');


            productData = await productDataQuery.exec();



        }
        const categoryOffer = await offerCollection.findOne({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        if (categoryOffer) {
            updatedProductData = productData.map((product) => {
                if (
                    product.product_category &&
                    product.product_category.category_name === categoryOffer.category
                ) {
                    if (categoryOffer.discountType === 'percentage') {
                        product.sale_price *= (100 - categoryOffer.discountValue) / 100;
                    } else if (categoryOffer.discountType === 'fixed') {
                        product.sale_price -= categoryOffer.discountValue;
                    }
                }
                return product;
            });
        }
       

        const categoryData = await categorycollection.find();

        res.render('shop', { product: productData, user, categoryData: categoryData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};






const loadRegister = async (req, res) => {
    try {
        res.render("registration")

    } catch (error) {
        console.log(error.message);
    }
}

const insertuser = async (req, res) => {
    try {


        [
            body('name').notEmpty().withMessage('name is required'),
            body('email')
                .isEmail().withMessage('Invalid email')
                .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
                .withMessage('Invalid email format')
            ,
            body('phoneNumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number'),
            body('password')
                .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/)
                .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=)')

        ]

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        const phoneNumber = '+91' + req.body.number;


        const existingUser = await collection.findOne({ email: email });
        if (existingUser) {
            return res.render('registration', { message: 'Email already exists. Please use a different email.' });
        } else {
            function generateOTP() {
                const digits = '0123456789';
                let OTP = '';

                for (let i = 0; i < 4; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }

                return OTP;
            }
            const otp = generateOTP();
            const otpExpiration = new Date(Date.now() + 60000);


            const spassword = await securepassword(req.body.password);

            function generateReferralCode() {
                return Math.random().toString(36).substring(2, 10).toUpperCase();
            }

            const referral_code = generateReferralCode()
            const newUser = new collection({
                name: name,
                email: email,
                mobileNO: req.body.number,
                password: spassword,
                is_admin: 0,
                otpExpiration: otpExpiration,
                otp: otp,
                referral_code: referral_code
            });

            req.session.email = email
            await newUser.save();


            sendverifymail(email, otp)


            twilioClient.messages
                .create({
                    body: `your OTP is :${otp}`,
                    from: '+15076195888',
                    to: phoneNumber
                })
                .then(message => {
                    console.log('Message sent:', message.sid);
                    cache.set(phoneNumber, true);


                    res.redirect('/OTP');
                })
                .catch(error => {
                    console.error('Error sending Twilio message:', error);
                    res.status(500).send('Error sending SMS');
                });

        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error registering user')
    }
}


const loginLoad = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }

}

const verifyLogin = async (req, res) => {
    try {
        [
            body('email')
                .isEmail()
                .withMessage('Invalid email'),
            body('password')
                .notEmpty()
                .withMessage('Password is required')
        ]

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await collection.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                res.render('login', { message: 'Email and password incorrect' })
            } else {
                if (userData.blocked === true) {
                    res.render('login', { message: 'your account blocked.please contact customer care!!!' })
                } else {
                    if (userData.is_Verified === true) {
                        req.session.user = userData
                        res.redirect('/')
                    } else {
                        res.redirect('/OTP')
                    }
                }
            }
        } else {
            res.render('login', { message: 'Email and password incorrect' })
        }

    } catch (err) {
        return res.status(500).send('Internal Server Error');
    }
};


const loadOTP = async (req, res) => {
    try {
        res.render('OTP_verification')
    } catch (error) {
        console.log(error.message);
    }

}
const verifyOTP = async (req, res) => {
    try {
        const otp = req.body.otp;
        const user = await collection.findOne({ otp: otp });

        if (user) {
            if (user.otp == req.body.otp && req.body !== null) {
                await collection.updateOne(
                    { _id: user._id },
                    { $set: { is_Verified: true } }
                );
                res.redirect('/login');

            } else {
                res.render('OTP_verification', { message: 'Invalid OTP' });
            }
        } else {
            res.render('OTP_verification', { message: 'User is not available' });
        }
    } catch (error) {
        console.log(error.message);
    }
};


const productdetails = async (req, res) => {
    try {
        let user = req.session.user
        const id = req.query.id
        const prdtdetails = await productcollection.find({ _id: id }).populate('product_category')
        const category = prdtdetails.product_category
        res.render('shop-details', { prdtdetails, category, user })
    } catch (error) {
        res.status(500).json({ error: 'products details not found!!!' });
    }
}

const userLogout = async (req, res) => {
    try {
        delete req.session.user
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}



const otpResend = async (req, res) => {
    try {
        const email = req.session.email
        const userdata = await collection.find({ email: email })
        if (userdata.length > 0) {
            for (const user of userdata) {
                let phoneNumber = '+91' + user.mobileNO
                function generateOTP() {
                    const digits = '0123456789';
                    let OTP = '';

                    for (let i = 0; i < 4; i++) {
                        OTP += digits[Math.floor(Math.random() * 10)];
                    }

                    return OTP;
                }
                const otp = generateOTP();
                const otpExpiration = new Date(Date.now() + 60000);

                await collection.updateOne(
                    { email: email },
                    { $set: { otp: otp, otpExpiration: otpExpiration } }
                );

                sendverifymail(email, otp);

                twilioClient.messages
                    .create({
                        body: `your OTP is :${otp}`,
                        from: '+15076195888',
                        to: phoneNumber
                    })
                    .then(message => {
                        console.log('Message sent:', message.sid);
                        cache.set(phoneNumber, true);


                        res.redirect('/OTP');
                    })
                    .catch(error => {
                        console.error('Error sending Twilio message:', error);
                        res.status(500).send('Error sending SMS');
                    });
            }


        } else {
            res.status(500).json({ error: 'user is not available' });
        }


    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Cannot resend OTP' });
    }
}

const getAbout = async (req, res) => {
    try {

        res.render('about')
    } catch (error) {
        res.status(500).json({ error: "can't get this page" })
    }
}

const getBlog = async (req, res) => {
    try {
        res.render('blog_list')
    } catch (error) {
        res.status(500).json({ error: "can't get this page" })
    }
}

const getProfille = async (req, res) => {
    try {
        const user=req.session.user
        const address=user.address[0]
    
        if(user){
            res.render('profile',{user,address})
        }
    } catch (error) {
        res.status(404).json({ error: "Can't Load this Page" })
    }
}

const addwishList = async (req, res) => {
    try {
        const id = req.query.id;


        const existingProduct = await wishListCollection.findOne({ product: id });



        if (existingProduct) {

            return res.status(200).json({ message: "Product already added to wishlist" });
        } else {

            const prdtData = await productcollection.findOne({ _id: id });

            if (prdtData) {
                const wishList = new wishListCollection({
                    product: prdtData._id,
                });
                await wishList.save();



                return res.status(200).json({ message: "Product added to wishlist" });
            } else {
                return res.status(404).json({ error: "Product not found" });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: "Can't get this page" });
    }
};

const wishList = async (req, res) => {
    try {
        const user = req.session.user
        if (user) {
            const wishListData = await wishListCollection.find().populate('product')
            res.render('wishlist', { wishListData, user })
        } else {
            res.status(500).json({ error: "can't fetch wishlist data" })
        }
    } catch (error) {
        res.status(500).json({ error: "can't load wishlist details" })
    }
}



const RemoveWishList = async (req, res) => {
    try {

        const removedProduct = await wishListCollection.deleteOne({ _id: req.query.id });
        if (removedProduct) {
            res.redirect('/getwishList')
        } else {
            res.status(500).json({ error: "can't remove wishlist product" })
        }
    } catch (error) {
        res.status(500).json({ error: "can't remove wishlist product" })
    }
}

const GeteditProfile=async(req,res)=>{
    try {
        const user=req.session.user
        const address=user.address[0]
    
        if(user){
            res.render('Edit_profile',{user,address})
        }
    } catch (error) {
        res.status(500).json({error:"can't get edit profile"})
    }
}


const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { username, email, address1, address2, address3, address4, address5, mobno } = req.body;

        const user = await collection.findById(userId);
        console.log("user before update:", user);

        if (user) {
            user.name = username;
            user.email = email;
            user.mobileNO = mobno;

            if (user.address && user.address.length > 0) {
                user.address[0].House_name = address1;
                user.address[0].Street_number = address2;
                user.address[0].city = address3;
                user.address[0].state = address4;
                user.address[0].Pincode = address5;
            }

            await user.save();
            console.log("updated user:", user);

            req.flash('success', 'Profile updated successfully');
            res.redirect("/profile");
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Can't update user profile" });
    }
};


module.exports = {
    loadHome,
    loadRegister,
    insertuser,
    loginLoad,
    verifyLogin,
    loadOTP,
    verifyOTP,
    loadshop,
    productdetails,
    userLogout,
    otpResend,
    getAbout,
    getBlog,
    getProfille,
    addwishList,
    wishList,
    RemoveWishList,
    GeteditProfile,
    updateProfile


}