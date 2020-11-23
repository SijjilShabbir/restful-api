const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productRoutes = require('./api/routes/product');
const orderRoutes = require('./api/routes/order');
const userRoutes = require('./api/routes/user')

mongoose.connect('mongodb+srv://Sijjil:'
+ process.env.Mongo_ATLAS_PW +
 '@rest-node.gw7cm.mongodb.net/rest-node?retryWrites=true&w=majority',
{
    useMongoClient: true
});

mongoose.Promise = global.Promise

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Header" ,
    "Origin, X-Requested-With, Control-Type, Accept, Authorization");
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Method' , 'PUT, POST, GET, DELETE, PATCH');
        return res.status(200).json({});
    }
    next();
});

app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/user', userRoutes);


app.use((req,res,next) =>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next) =>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});
module.exports = app;