const orderCollection = require("../models/OrderModel")
const collection = require("../models/userModel")
const cartcollection = require("../models/cartModel")
const shortid = require('shortid');


const loadCheckout = async (req, res) => {
    try {
        const user = req.session.user;
        const cart = await cartcollection.find();

        if (cart.length === 0) {
            return res.status(500).json({ message: "Empty cart!!! add some items" });
        }

        const userCart = cart.find(cartItem => cartItem.user.toString() === user._id);

        const userGrandTotal = userCart.Grand_total;



        const userData = await collection.find({ _id: user._id });
        if (userData.length === 1) {
            const userdocument = userData[0];
            const addresses = userdocument.address;
            const defaultAddresses = addresses.filter(address => address.defaultValue === true);

            if (defaultAddresses.length > 0) {
                const defaultAddress = defaultAddresses[0];
                res.render('checkout', { cart, user, shipping_charge: cart[0].shipping_charge, address: defaultAddress , userGrandTotal});
            } else {
                res.render('newDetails', { user });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};




const addDetails = async (req, res) => {
    try {
        let user = req.session.user
        const { first_name, last_name, email_address, phone_number, House, Street, city, state, country, postcode, } = req.body

        const updatedUser = await collection.findOneAndUpdate(
            { _id: user._id },
            {
                $push: {
                    address: {
                        First_name: first_name,
                        Last_name: last_name,
                        Email_address: email_address,
                        Mobile: phone_number,
                        House_name: House,
                        Street_number: Street,
                        city: city,
                        state: state,
                        country: country,
                        Pincode: postcode
                    }
                }
            },
            { new: true }
        );
        await updatedUser.save()

        res.redirect('/order/checkout')

    } catch (error) {
        console.log(error.message)
    }
}

const loadPayment = async (req, res) => {
    try {
        const user = req.session.user
        res.render('payment', { user })
    } catch (error) {
        console.log(error.message)
    }
}

const addNewAddress = async (req, res) => {
    try {
        const user = req.session.user
        res.render('newDetails', { user })
    } catch (error) {
        console.log(error.message)
    }
}



const orderSuccess = async (req, res) => {
    try {

        const user = req.session.user;

        const cart = await cartcollection.findOne({ user: user._id }).populate('products.productId');
        if (!cart) {
            return res.status(400).json('Cart is empty');
        }

        const min = 100000;
        const max = 999999;

        const orderId = Math.floor(Math.random() * (max - min + 1)) + min;



        let orderTotal = 0;
        cart.products.forEach(item => {
            orderTotal += item.total_price;
        })


        const coupenDiscount = cart.coupen
        const defaultShippingAddressIndex = user.address.findIndex(address => address.defaultValue === true);

        if (defaultShippingAddressIndex !== -1) {
            const defaultShippingAddress = user.address[defaultShippingAddressIndex];

            const order = new orderCollection({
                user: user._id,
                orderId: orderId,
                items: cart.products.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    price: item.total_price,
                })),
                orderTotal:cart.Grand_total,
                orderStatus: 'Placed',
                shipping_address: defaultShippingAddress._id
            });

            await order.save();

        } else {
            console.error(error);
            return res.status(500).json('default address can not find');
        }

        const deletecart = await cartcollection.findOneAndDelete({ user: user._id });
        if (deletecart) {
            res.render('orderSuccessFull', { user });
        } else {
            res.redirect('/order/payment')
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json('Internal Server Error');
    }
};





const loadStatus = async (req, res) => {
    try {
        const user = req.session.user;
        const orders = await orderCollection.find({ user: user._id }).populate('items.product');
        res.render('order_Status', { orders, user })
    } catch (error) {
        console.log(error.message)
    }
}

const showStatus = async (req, res) => {
    try {
        res.redirect('/cart/status')
    } catch (error) {
        console.log(error.message)
    }
}
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id
        const updatedOrder = await orderCollection.findByIdAndUpdate({ _id: orderId }, { $set: { orderStatus: 'cancelled' } }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.redirect('/order/status');
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}



const load_editAddress = async (req, res) => {
    try {
        const userId = req.query.id;
        const addressId = req.query.addressId;

        const userData = await collection.findById(userId);
        if (!userData) {
            return res.status(500).send('User is not found');
        }

        const targetAddress = userData.address.find(address => address._id.toString() === addressId);
        if (!targetAddress) {
            return res.status(404).send('Address not found for this user');
        }


        res.render('edit_Address', { user: userData, address: targetAddress });
    } catch (error) {
        res.status(500).send("Can't edit address");
    }
};



const updateAddress = async (req, res) => {
    try {
        const userId = req.query.id;
        const addressIdToUpdate = req.query.addressId;

        const updatedAddressData = {
            First_name: req.body.first_name,
            Last_name: req.body.last_name,
            Email_address: req.body.email_address,
            Mobile: req.body.phone_number,
            House_name: req.body.House,
            Street_number: req.body.Street,
            city: req.body.city,
            state: req.body.state,
            Pincode: req.body.postcode,
        };

        collection.findOneAndUpdate(
            { _id: userId, 'address._id': addressIdToUpdate },
            { $set: { 'address.$': updatedAddressData } },
            { new: true }
        )
            .then(updatedUser => {
                res.redirect('/order/checkOut');
            })
            .catch(error => {
                console.error('Error updating user address:', error);
                res.status(500).send("An error occurred while updating the address");
            });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).send("An error occurred while updating the address");
    }
};



const loadDefaultAddress = async (req, res) => {
    try {
        const userId = req.session.user._id
        const user = await collection.findById(userId)
        res.render('defaultAddress', { user })
    } catch (error) {
        res.status(500).send("Adress Not availble");
    }
}


const loadDelete_address = async (req, res) => {
    try {

        const id = req.query.addressId

        const user = req.session.user

        const useraddress = await collection.updateOne({ _id: user._id }, { $pull: { address: { _id: id } } })

        res.json({ message: "Default address set successfully" });
    } catch (error) {
        res.status(500).send("can't delete address");
    }
}

const loadorderDetails = async (req, res) => {
    try {
        const user = req.session.user
        const orderData = await orderCollection.find().populate('items.product')


        res.render('orderDetails', { user, orderData })
    } catch (error) {
        res.status(500).send("No order details in your account");
    }
}


const makeDefaultAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addressIdToSetDefault = req.query.addressId;


        await collection.updateOne(
            { _id: userId, 'address.defaultValue': true },
            { $set: { 'address.$.defaultValue': false } }
        );


        await collection.updateOne(
            { _id: userId, 'address._id': addressIdToSetDefault },
            { $set: { 'address.$.defaultValue': true } }
        );

        res.json({ message: "Default address set successfully" });
    } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).send("An error occurred while setting the default address");
    }
}

module.exports = {
    loadCheckout,
    addDetails,
    loadPayment,
    addNewAddress,
    orderSuccess,
    loadStatus,
    showStatus,
    cancelOrder,
    load_editAddress,
    updateAddress,
    loadDefaultAddress,
    loadDelete_address,
    loadorderDetails,
    makeDefaultAddress

}