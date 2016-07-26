/**
 * Created by abhishek on 17/07/16.
 */

const express = require('express');
const SHA256 = require('crypto-js/sha256');
var router = express.Router();
const fs = require('fs');

var authError = "";

router.get('/' , function (req , res) {
    res.render('login' , {error : authError} );
});

router.post('/auth' , function (req , res) {

    if(typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined')
    {
        authError = "Please Enter a Username or Password" ;
        console.log('err');
        res.redirect('/login');
        return ;
    }

    var user = {
        username: req.body.username,
        password : req.body.password
    };

    fs.readFile('./db/users' , 'utf-8' ,  function (err , data) {

        if(err)
            return err;

        //get all data and search the user
        let users = JSON.parse(data);
        for(var allowed of users)
        {
            if(allowed.username === user.username )
            {
                if(SHA256(user.password) == allowed.password )
                {
                    req.session.username = user.username;
                    req.session.save();
                    res.redirect('/dashboard');
                    return;
                }
            }
        }

        authError = "Incorrect Username/Password";
        res.redirect('/login');
    });

});


module.exports = router;