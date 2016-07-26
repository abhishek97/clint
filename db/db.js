/**
 * Created by abhishek on 20/07/16.
 */

const mysql = require('mysql');
const moment = require('moment');

var connection = null;

function createConnection() {

    connection = mysql.createConnection({
        host : 'localhost',
        user : 'clint_server',
       // password : '',
        database : 'clint',
    });
    connection.connect();
};



module.exports.getCustomers = function (callback) {

    createConnection();

    connection.query('SELECT * FROM customers_internet' , function (err , rows , fields) {
        if(err)
            return console.error(err);

        callback(rows , fields);

    });


};

module.exports.addCustomer = function ( customer , callback) {
    
    createConnection();

    let ins = [];
    for(val in customer)
        if(customer.hasOwnProperty(val))
        ins.push(customer[val]);

    let myTime = moment().add(30 , 'day').format('YYYY-MM-DD HH:mm:ss');
    ins.push(myTime);

    connection.query('INSERT INTO customers_internet VALUES(null , ? , ? ,? , ? , ?  , ? , ?); '  , ins , function (err , result) {
     if(err)
         return console.error(err);

        callback(result);
    });

    //TODO add a log

};

module.exports.getCustomerById = function(id , callback)
{
  createConnection();

    connection.query('SELECT * FROM customers_internet WHERE id = ? ;' , id , function (err , rows , fields) {
        if(err)
            return console.error(err);

        callback(rows[0]);
    });
};

module.exports.makePayment = function ( madeByUser , customer , amount , type , plan , applyNow ,callback) {

    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    //TODO : Put these inside a connection.beginTransaction({ () => }

    if(type == 'plan')
    {
        const expiry = moment(time , 'YYYY-MM-DD HH:mm:ss').add(30 , 'day').format('YYYY-MM-DD HH:mm:ss');

        // UPDATE customer PLan & expiry
        if( ( moment().isAfter( moment(customer.expiry , 'YYYY-MM-DD HH:mm:ss' )  , 'day') ) || applyNow=='true' )
        {

            createConnection();
            connection.query('UPDATE customers_internet SET `expiry`=? , `plan`= ? WHERE `id` = ? ', [ expiry , plan , customer.id ] , function (err , result) {
                if(err)
                    throw  err;
                console.log(result);
            });

        }
        else
        {
            // Generate Auto Renewal , advance_renewal
            createConnection();
            connection.query('INSERT INTO advance_renewal VALUES(null , ? , ?, ? ); ' , [customer.id , plan , expiry] , function (err , result) {
                if(err)
                    throw err;
                console.log(result);
            });

        }

    }
    
    createConnection();
    connection.query('INSERT INTO payment VALUES( null , ? , ? , ? , ?  ); ' , [customer.id , amount , type , time ] , function (err , result) {
        if(err)
            throw err;

        createConnection();
        const log = 'User ' + madeByUser + ' made payment of ' + amount + ' on' +  moment().format('MMMM Do YYYY');
        connection.query('INSERT INTO logs VALUES(null , ? , ? ,? ,?); ' , [customer.id , 'PAYMENT' , log , time ] , function (err , result ) {
            if(err)
                throw err;
            callback(result);
        });
    } );
};

module.exports.getLogs = function (id , callback) {
    createConnection();
    connection.query('SELECT * from logs WHERE `customer_id`=? ORDER BY `time` DESC ;' , id , function (err , rows) {
        if(err)
            throw err;

        callback(rows);
    });
};