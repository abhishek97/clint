/**
 * Created by abhishek on 17/07/16.
 */

const express = require('express');
const db = require('../db/db.js');
const moment = require('moment');
var router = express.Router();

let customers = [];

router.use('/' , function (req , res , next) {
    if(!req.session.username)
        res.send("User not authenticated , <a href='/login' > login again </a>");
    else
        next();
});

router.get('/', function (req , res) {
    //read all the users


        customers = [];

        db.getCustomers(function (rows , fields) {
            for(row of rows)
            {
                customers.push({
                    id : row.id,
                    name : row.name,
                    mobile : row.mobile,
                    address : row.address,
                    location : row.location,
                    vc : row.vc,
                    plan : row.plan,
                });
            }
            res.render( 'dashboard' , {username : req.session.username , customers : customers });
        });




});

router.post('/addCustomer' , function (req , res) {


    // TODO : Add validation logic
    let newCustomer = {
        name : req.body.name,
        mobile : Number(req.body.mobile),
        address : req.body.address,
        location : req.body.location,
        vc : req.body.vc,
        plan : req.body.plan
        //FUTURE: log : "Created @  " + Date.now().toLocaleString() + " by " + req.session.username ,
    };

    db.addCustomer( newCustomer , function () {
        res.redirect('/dashboard');
    } );


});

router.get('/customer/:id' , function (req , res) {
    db.getCustomerById(req.params.id  , function (customer) {
        customer.expiry = moment(customer.expiry , 'YYYY-MM-DD HH:mm:ss' ).format('MMMM Do YYYY');
        db.getLogs(customer.id , function (logs) {
            logs.forEach(function (log) {
                log.time = moment( log.time , 'YYYY-MM-DD HH:mm:ss' ).format('MMMM Do YYYY');
            });
            res.render('customer' , {customer : customer , logs : logs } );
        });

        
    });


});

router.post('/customer/:id/pay' , function (req , res) {
    db.getCustomerById(req.params.id , function (customer) {

        db.makePayment(req.session.username , customer , req.body.amount , req.body.type , req.body.plan , req.body.applyNow ,function (result) {
            
            res.redirect('/dashboard/customer/' + customer.id );
        });

    });
});
// Update Details ->


/*

add log to each user

 */


/* customer/pay



/*


 */

module.exports = router;