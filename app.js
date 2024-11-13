const express = require('express')
const app = express()
const port = 8080
const axios = require('axios');
const fs                = require('fs');

const promise           = require('bluebird');

var pg_options = {
    promiseLib: promise,
    pgNative:   false
};


var pg                = require('pg'), //.native,
    pgp               = require('pg-promise')(pg_options),
    monitor           = require('pg-monitor');

// Configuration
var configuration = JSON.parse(fs.readFileSync('configuration_heroku_db.json'));

// PostgreSQL connectivity string
var PGMainString = configuration.pg_main_host;
var pdbM = pgp(PGMainString);
var main_parse                = require('pg-connection-string').parse;
var main_config               = main_parse(PGMainString);
main_config.max               = 10;
main_config.idleTimeoutMillis = 30000;
var main_pool                 = new pg.Pool(main_config);

var indexRouter = require('./routes/index');


// PostgreSQL handle
var pgMainHandle = function (callback) {

    main_pool.connect(function (err, client, done) {

        var handleError = function (err) {

            // no error occurred, continue with the request
            if (!err) {
                return false;
            }

            // An error occurred, remove the client from the connection pool.
            // A truthy value passed to done will remove the connection from the pool
            // instead of simply returning it to be reused.
            // In this case, if we have successfully received a client (truthy)
            // then it will be removed from the pool.
            if (client) {
                done(client);
            }

            //res.writeHead(500, {'content-type': 'text/plain'});

            console.error('PG error [' + err.code + '] occurred :' + err.message);

            return true;

        };

        // handle an error from the connection
        if (handleError(err)) {
            return;
        }

        callback(client, handleError, done);

    });

}


app.use(function (req, res, next) {

    req.pgp = pgp;

    req.pdbM = pdbM;

   // req.pgMainHandle = pgMainHandle;

    next();

});




app.use('/', indexRouter);
app.use('/sensor', indexRouter);

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())






app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))
