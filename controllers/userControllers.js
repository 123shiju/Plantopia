const collection = require("../models/userModel")
const productcollection = require("../models/productModel")
const categorycollection = require("../models/categoryModel")
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
const randomstring = require('randomstring');

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

        let productData;

        if (Object.keys(filterQuery).length === 0 && !sortOrder) {
            productData = await productcollection.find();
        } else {
            
            productData = await productcollection
                .find(filterQuery)
                .sort(sortOption)
                .exec();
           
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

            const newUser = new collection({
                name: name,
                email: email,
                mobileNO: req.body.number,
                password: spassword,
                is_admin: 0,
                otpExpiration: otpExpiration,
                otp: otp
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
    otpResend


}