const collection = require("../models/productModel")
const categorycollection = require('../models/categoryModel')

const loadHome = async (req, res) => {
    try {
        const productData = await collection.find({ list: false })
      
        const productIds = productData.map(product => product.product_category);
    
        const category = await categorycollection.find({ _id: { $in: productIds } }); 
    

        res.render('product_page', { products: productData,category })
    } catch (error) {
        console.log(error.message);
    }
}
const addProduct = async (req, res) => {
    try {
        const catagories = await categorycollection.find()
        res.render('add_product', { catagories })
    } catch (error) {
        console.log(error.message);
    }
}

const addProductDetails = async (req, res) => {
    try {
        const images = req.files.map((file) => file.filename);
        const {
            name, prdt_price, description, sale_price, stock, discount,
            special_characters, categoryId, isCroppedImage, croppedImageData} = req.body;

        const categorydata = await categorycollection.findById(categoryId);
        if (!categorydata) {
            return res.status(404).json({ error: 'Category not found' });
        }

        let croppedImage = null;
        if (isCroppedImage === '1' && croppedImageData) {
            croppedImage = croppedImageData;
        }

        const allImages = images.concat(croppedImage ? [croppedImage] : []);
    
        const originalPrice=req.body.prdt_price
        discountPercentage=req.body.discount
        const pdtsale_price=originalPrice - (originalPrice * (discountPercentage / 100))
    

        const product = new collection({
            product_name: name,
            image: allImages,
            product_category: categoryId,
            product_price: prdt_price,
            sale_price: pdtsale_price,
            stock: stock,
            description: description,
            discount: discount,
            special_characters: special_characters
        });

        const productdata = await product.save();
        if (productdata) {
            res.redirect("/product/");
        } else {
            res.status(500).send('Error add product');
        }

    } catch (error) {
        console.log(error.message);
    }
};


const editProductLoad = async (req, res) => {
    try {
        const id = req.query.id
        const productData = await collection.findById({ _id: id })
        if (productData) {
            res.render('edit_product', { product: productData })
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}



const updateproduct = async (req, res) => {
    try {
        const productId = req.body.id;

        let updateData = {
            product_name: req.body.name,
            product_category: req.body.category,
            product_price: req.body.prdt_price,
            sale_price: req.body.sale_price,
            stock: req.body.stock,
            discount: req.body.discount,
            special_characters: req.body.special_characters,
            description: req.body.description
        };

        if (req.files) {
            const newImages = req.files.map((file) => file.filename);

            const product = await collection.findById(productId);
            if (product) {
                
                updateData.image = [...product.image, ...newImages];
            }
        }

        const userData = await collection.findByIdAndUpdate(
            { _id: productId },
            { $set: updateData }
        );

        const productData = await collection.find({ list: false });
        if (productData) {
            res.render('product_page', { products: productData });
        } else {
            res.status(500).send('Error adding product');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error updating product');
    }
};


const deleteproduct = async (req, res) => {
    try {
        const id = req.query.id
        const deleteProduct = await collection.findByIdAndUpdate({ _id: id }, { $set: { list: true } })
        res.redirect('/product')
    } catch (error) {
        console.log(error.message);
    }
}

const ZoomImage = async (req, res) => {
    try {
        const { x, y } = req.query;
        const zoomedImageBuffer = await processImageZoom(req.params.id, x, y);
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(zoomedImageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing image zoom.');
    }
}

const loadproductsFilter = async (req, res) => {
    try {
        const filters = req.query;
        const products = await collection.find(filters).populate('product_category');
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deleteimage = async (req, res) => {
    try {
        const productId = req.query.id;
        const productData = await collection.findById(productId);
        const imageIndex = req.query.imageIndex;

        if (productId && imageIndex !== undefined) {
            if (imageIndex >= 0 && imageIndex < productData.image.length) {
                productData.image.splice(imageIndex, 1);
                await productData.save();

                res.redirect("/product/");
            } else {
                res.status(400).send("Invalid image index.");
            }
        } else {
            res.status(400).send("Missing parameters.");
        }
    } catch (error) {
        res.status(500).json({ message: 'Unable to delete product image.' });
    }
};


module.exports = {
    loadHome,
    addProduct,
    addProductDetails,
    editProductLoad,
    updateproduct,
    deleteproduct,
    ZoomImage,
    loadproductsFilter,
    deleteimage
}