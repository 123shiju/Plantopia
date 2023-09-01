const adminCollection = require("../models/userModel")
const categoryCollection = require("../models/categoryModel")
const orderCollection = require("../models/OrderModel")
const bcrypt = require('bcrypt')
const userCollection = require("../models/userModel")
const productDBCollection = require("../models/productModel")

const securepassword = async (password) => {
    try {

        const passwordHash = bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async (req, res) => {

    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const userData = await adminCollection.findOne({ email: email })
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 1) {
                    req.session.admin = userData

                    res.redirect("/admin/home")
                } else {
                    res.render('login', { message: 'username and password incorrect.please verify your mail!!!' })
                }
            } else {
                res.render('login', { message: 'username and password incorrect.please verify your mail!!!' })
            }
        } else {
            res.render('login', { message: 'username and password incorrect.please verify your mail!!!' })
        }

    } catch (err) {
        console.log(err.message);
    }
}



const loadDashboard = async (req, res) => {
    try {
        const orders = await orderCollection.find()
            .populate({ path: 'user', select: 'name' })
            .populate('items.product', 'name')
            .populate({
                path: 'shipping_address',
                model: 'userdb',
                select: 'address'
            });

            console.log(orders)

          res.render('home', { orders });
    } catch (error) {
        console.log(error.message);
    }
};








const loadproduct_page = async (req, res) => {
    try {
        res.render('products')
    } catch (error) {
        console.log(error.message);
    }
}

const loaduser = async (req, res) => {
    try {
        const usersData = await adminCollection.find({ is_admin: 0 })
        res.render('user', { users: usersData })
    } catch (error) {
        console.log(error.message);
    }
}
const Blockuser = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await adminCollection.updateOne({ _id: id }, { $set: { blocked: true } });
        res.redirect('/admin/user')
    } catch (error) {
        console.log(error.message);
    }
}
const UnBlockuser = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await adminCollection.updateOne({ _id: id }, { $set: { blocked: false } });
        res.redirect('/admin/user')
    } catch (error) {
        console.log(error.message);
    }
}
const loadCategory = async (req, res) => {

    try {
        const categoryData = await categoryCollection.find()
        res.render('category', { category: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}



const addCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        if (!categoryName) {
            res.send("Category name cannot be empty");
            return;
        }

        const existingCategory = await categoryCollection.findOne({
            category_name: { $regex: '^' + categoryName + '$', $options: 'i' }
        });

        if (existingCategory) {
            res.send("Category already exists");
        } else {
            const newCategory = new categoryCollection({
                category_name: categoryName
            });

            await newCategory.save();

            if (newCategory) {
                res.redirect("/admin/category");
            }
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add category' });
    }
};







const delete__category = async (req, res) => {
    try {
        const id = req.query.id
        await categoryCollection.deleteOne({ _id: id })
        res.redirect('/admin/category')
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
}




const loadeditCategory = async (req, res) => {
    try {
        const id = req.query.id
        const updateCategory = await categoryCollection.findById({ _id: id })
        if (updateCategory) {
            res.render('edit_category', { category: updateCategory })
        } else {
            res.redirect('/admin/category')
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
}




const updateCategory = async (req, res) => {
    try {
        const { id, category } = req.body;

        const existingCategory = await categoryCollection.findOne({
            category_name: { $regex: '^' + category + '$', $options: 'i' }
        });

        if (existingCategory) {
            res.send("Category name already exists");
        } else {
            const updatedCategory = await categoryCollection.findByIdAndUpdate(
                { _id: id },
                { $set: { category_name: category } }
            );

            if (updatedCategory) {
                res.redirect('/admin/category');
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};


const loadlogout = async (req, res) => {
    try {
        delete req.session.admin
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
const Cancelorder = async (req, res) => {
    try {
        const id = req.query.id
        const orderData = await orderCollection.findOneAndDelete({ orderId: id })
        res.redirect('/admin/home')
    } catch (error) {
        console.log(error.message)
    }
}

const getorderDetails = async (req, res) => {
    try {
        const id = req.query.id;

        const orderData = await orderCollection.findOne({ orderId: id })
            .populate('user')
            .populate({
                path: 'items.product',
                model: 'productDB'
            })
            .exec();


        for (const item of orderData.items) {
            const productId = item.product;
            const productDetails = await productDBCollection.findById(productId);
            item.product = productDetails;
        }

        if (!orderData) {
            return res.status(404).json({ error: 'Order not found' });
        }


        const userId = orderData.user._id;

        const user = await adminCollection.findById(userId);


        const defaultShippingAddressId = user.address.find(addr => addr.defaultValue === true)._id;

        const defaultShippingAddress = user.address.find(addr => addr._id.toString() === defaultShippingAddressId.toString());

        res.render('orderDeatails_Page', { orderData, defaultShippingAddress })


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching order details' });
    }
}



module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadproduct_page,
    loaduser,
    Blockuser,
    UnBlockuser,
    loadCategory,
    addCategory,
    delete__category,
    loadeditCategory,
    updateCategory,
    loadlogout,
    Cancelorder,
    getorderDetails
}
