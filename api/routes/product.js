const express = require('express');
const mongoose  = require('mongoose');
const router = express.Router();
const Products = require('../models/products');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const storage = multer.diskStorage({
    destination:  function(req, file, cb){
       cb(null, './uploads/');
    },
    filename: function(req, file, cb){
    cb(null, new Date().toISOString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) =>{
//reject a file
if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
}
else{
    cb(null, false);
}


};

const upload = multer({
    storage: storage,
     limits:{
    fileSize: 1024 *1024 *5
},
fileFilter: fileFilter
 });

router.get('/' , (req, res, next)=> {
    Products.find()
    .select('name  price  _id productImage')
    .exec()
    .then(docs => {
       const response = {
           count: docs.length,
           products: docs.map(doc => {
               return{
                  name: doc.name,
                   price: doc.price,
                   productImage: doc.product.Image,
                   _id: doc._id,
                   request:
                   {
                       type: 'GET' ,
                       url: 'http://localhost:3000/product/' + doc._id
                   }
               }
           })
       }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
    
});

router.post('/' , upload.single('productImage'), checkAuth, (req, res, next) => {
    console.log(req.file);
    const product = new Products ({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,  
      price: req.body.price, 
      productImage: req.file.path

    });
    product
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /product' ,
            CreatedProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                     type: 'GET' ,
                     url: 'http://localhost:3000/product/' + result._id 
                }
            }
        });
    })

    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
   
    
});

router.get('/:productId', (req, res, next)=> {
    const id = req.params.productId;
    Products.findById(id)
    .select( 'name price _id productImage' )
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/product'
                }
            });
            
        }
        else{
            res.status(404).json({message: 'No such entry found'});
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });

});

router.patch('/:productId', (req, res, next)=> {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Products.update({_id: id}, {$set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product updated' ,
            request:
            {
                type: 'GET',
                url: 'http://localhost:3000/product/' +id
            }
        })
     
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    })

});

router.delete('/:productId', (req, res, next)=> {
    const id = req.params.productId;
    Products.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Object Deleted',
            request:{
              type: 'POST',
              body: {name: 'String' , price: 'Number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })

    });
module.exports = router;