const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Orders = require('../models/orders');
const Products = require('../models/products');
router.get('/', (req,res,next)=>{
    Orders.find()
    .select('product quantity _id')
    .populate('product')
    .exec()
    
    .then(docs => {
        res.status(200).json({
            count : docs.length,
            orders: docs.map(doc =>{
               return {
                 _id: doc._id,
                 product: doc.product,
                 quantity: doc.quantity,
                 request:{
                     type: 'GET',
                     url: 'http://localhost:3000/order/' + doc._id
                 }
               } 
            })
            
        });
        

    })
    .catch(err => {
       res.status(500).json({
           error: err
       }); 
    });
});

router.post('/', (req,res,next)=>{
Products.findById(req.body.productId)
.then(product =>{
    if(!product){
     return res.status(404).json({
         message: 'Product not found',
     });
    }
    const order = new Orders ({
        _id: mongoose.Types.ObjectId(),
         quantity: req.body.quantity,
         product: req.body.productId
      });
      return order
      .save()
      .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Ordered Stored' ,
            CreatedOrder:{
                  _id: result._id,
                  product: result.product,
                  quantity: result.quantity 
            },
            request :{
                type: 'GET',
                url: 'http://localhost:3000/order' + result._id
            }
        }); 
     })
     
})
.catch(err => {
    res.status(500).json({
        message: 'Product not found',
        error: err
    });
});
   
    
    
});

router.get('/:orderId', (req,res,next)=>{
   Orders.findById(req.params.orderId)
   .populate('product')
   .exec()
   .then(order => {

       if(!order) {
          return res.status(404).json({
              message: "Order not found"
          });
       }
       res.status(200).json({
           order: order,
           request:{
               type: 'GET',
               url: 'http://localhost:3000/order'
           }
       });
   })
   .catch(err =>{
       res.status(500).json({
           error:err
       });
   });
});

router.delete('/:orderId', (req,res,next)=>{
    Orders.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/order',
                body: { productId: "ID" , quantity: "Number" }
            }
        });
    })
    .catch(err =>
        {
            res.status(500).json({
                error:err
            }); 
        })
});
module.exports = router;