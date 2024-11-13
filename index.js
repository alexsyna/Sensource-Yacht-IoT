var express = require('express');
var router = express.Router();
//var moment = require('moment');
const axios = require('axios');
var moment = require('moment-timezone');

var nodemailer = require('nodemailer');

var app_email = 'synadino@gmail.com';
var app_email_pass = '***';

var transporter = nodemailer.createTransport({
    service: 'gmail',//smtp.gmail.com  //in place of service use host...
    secure: false,//true
    port: 25,//465
    auth: {
        user: app_email,
        pass: app_email_pass
    },
    rejectUnauthorized: false
});


/* GET home page. */


router.post('/sensor', function (req, res){
    console.log('/sensor POST call - OK');
    var body='';
    req.on('data', function (chunk) {
        body += chunk;
        console.log(body);
        console.log("reading body...");

    });
    req.on('end', function () {
        console.log(body);
        /*body= body.replace(/'/g, '"');
        console.log(body);*/

        console.log(body);
        body = JSON.parse(body);




        /*    axios.post('http://192.168.4.12:80/relay' , params , {headers:{'content-type':'application/json'}})
                .then(response => {
                  console.log('Changed state');
                  res.send('OK3');
                })
                .catch(error => {
                  console.log(error);
                  res.send(error);
                });*/


        console.log(body.sensor_name);
        console.log(body.sensor_value);

        var sensor_name = body.sensor_name;
        var sensor_user_id = body.user_id;
        var sensor_chipid = body.chipid;
        var sensor_ip = body.ip;



        req.pdbM.any("SELECT * FROM iot.sensor WHERE user_id = $2 AND chipid=$3", [sensor_name, sensor_user_id, sensor_chipid])
            .then(function (resulted_sensor) {

                //resulted_sensor has T_VAL and S_ID
                console.log('Found sensor ');
                console.log(resulted_sensor);




                //Step1: Insert new sensor record
                //Step2: Get owner of this sensor(user)
                //Step3: Get user's alerts
                //Step4: if alert enabled then send emai AND insert the record in notifications table






                        var now = moment().utc().format('YYYY-MM-DD HH:mm:ss');
                        req.pdbM.query("INSERT INTO iot.usage_sensor (sensor_id, record_ts, record_value) VALUES ($1,$2,$3) " , [resulted_sensor[0].id.toString(), now, body.sensor_value])
                        //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                            .then(function (result) {




                                req.pdbM.query("SELECT * FROM iot.user WHERE id=$1 " , [sensor_user_id])
                                    .then(function (user) {


                                        console.log("found the user of this sensor");

                                        console.log("will check preference for user "+ sensor_user_id+ " and sensor "+ resulted_sensor[0].id.toString());
                                        req.pdbM.query("SELECT * FROM iot.preferences WHERE user_id=$1 AND sensor_id=$2 " , [sensor_user_id ,resulted_sensor[0].id.toString() ])
                                            .then(function (user_preference) {


                                                console.log("found the preference of this sensor");
                                                console.log(user_preference);

                                                console.log(user[0].email);
                                                console.log(user_preference[0].isenabled);



                                                req.pdbM.query("INSERT INTO iot.notifications (user_id,sensor_id, record_ts, record_value) VALUES ($1,$2,$3, $4) " , [sensor_user_id,resulted_sensor[0].id, now, body.sensor_value])
                                                    .then(function (inserted_value) {


                                                        console.log("inserted notifications");


                                                        req.pdbM.any("SELECT * FROM iot.notifications WHERE sensor_id=$1 ORDER BY record_ts DESC LIMIT 1 OFFSET 1", [resulted_sensor[0].id])
                                                            .then(function (previous_notification) {

                                                                var now_notify = moment();

                                                                console.log(now_notify.format('YYYY-MM-DD HH:mm:ss')+"  -   "+ moment(previous_notification[0].record_ts).format('YYYY-MM-DD HH:mm:ss'));
                                                                var time_passed =  now_notify.diff( moment(previous_notification[0].record_ts), 'seconds');
                                                                console.log("TIME PASSED : " + time_passed);
                                                                console.log("elapsed notification time: "+ user[0].notify_seconds);

                                                                if(user_preference[0].isenabled==1 && time_passed>= user[0].notify_seconds){
                                                                    var mailOptions = {
                                                                        from: app_email,
                                                                        to: app_email,
                                                                        subject: 'Sending Email from sensource',
                                                                        text:'You might want to check your boat! ' + body.sensor_name + ' activated!',
                                                                        html: 'You might want to check your boat! <br><b>' + body.sensor_name + '</b> activated!'
                                                                    };

                                                                    transporter.sendMail(mailOptions, function(error, info) {
                                                                        if (error) {
                                                                            console.log(error);
                                                                            res.json({ message: "Error in sending email" , status :200});

                                                                        }else{
                                                                            console.log('Email sent: ' + info.response);
                                                                            res.json({ message: "EMAIl SENT!" , status :200});

                                                                        }

                                                                    });



                                                                }else{
                                                                    res.json({ message: "Usage Record inserted" , status :200});
                                                                }



                                                            })
                                                            .catch(function (error) {
                                                                res.status(401).json({message: error.message});
                                                                console.error(error);
                                                            });







                                                    })
                                                    .catch(function (error) {
                                                        res.status(401).json({message: error.message});
                                                        console.error(error);
                                                    });



                                            })
                                            .catch(function (error) {
                                                res.status(401).json({message: error.message});
                                                console.error(error);
                                            });



                                    })
                                    .catch(function (error) {
                                        res.status(401).json({message: error.message});
                                        console.error(error);
                                    });





                            })
                            .catch(function (error) {
                                res.status(401).json({message: error.message});
                                console.error(error);
                            });







            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });







    });


})

router.get('/', function(req, res, next) {
    res.send( "EIMASTE OK GAMW !!!");
});

router.post('/', function(req, res, next) {
    res.send( { title: 'Express' });
});

router.post('/togglestate', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.actionable_id);

        const params = {};


        var actionable_id= body.actionable_id;

        req.pdbM.any("SELECT * FROM iot.actionable WHERE id=$1", [actionable_id])
            .then(function (resulted_actionable) {

                console.log('Found actionable');
                console.log(resulted_actionable)
                //resulted_pref has s_id, a_id, operator, when
                var actionable = resulted_actionable[0].name;
                var actionableip = resulted_actionable[0].ip;
                console.log("Trying to toggle state to " + actionableip);
                if(resulted_actionable.length > 0  )
                {
                    axios.post('http://'+actionableip+':80/'+actionable , params , {headers:{'content-type':'application/json'}})
                        .then(response => {

                            if ( typeof response !== 'undefined')
                            {
                                //do stuff if query is defined and not null
                                response=response.data.actionable_state;

                            }
                            else
                            {
                                response= '';
                                console.log('Response from actionable not received');
                                console.log(response);
                            }


                            if (response==1){
                                var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                    .then(function (result) {

                                        console.log('Usage Record inserted - state:1');
                                        res.json({ message: "Usage Record inserted" , status :200});



                                    })
                                    .catch(function (error) {
                                        res.status(401).json({message: error.message});
                                        console.error(error);
                                    });

                            }else if (response==0){
                                var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                    .then(function (result) {

                                        console.log('Usage Record inserted - state:0');
                                        res.json({ message: "Usage Record inserted" , status :200});


                                    })
                                    .catch(function (error) {
                                        res.status(401).json({message: error.message});
                                        console.error(error);
                                    });
                            }else{
                                var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, ts_off, state) VALUES ($1,$2,$3) " , [1, now,'unknown'])
                                //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                    .then(function (result) {

                                        console.log('Usage Record inserted - state:unknown');
                                        res.json({ message: "Usage Record inserted" , status :200});


                                    })
                                    .catch(function (error) {
                                        res.status(401).json({message: error.message});
                                        console.error(error);
                                    });
                            }





                        })
                        .catch(error => {
                            console.log(error);
                            res.send(error);
                        });
                }else{
                    res.json({ message: "Did not found actionable" , status :200});
                }







            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });




    });


})

router.post('/readactionables', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);



        var query = "SELECT * "+
            "     FROM iot.actionable as a1"+
            "     LEFT JOIN ("+
            "        SELECT iot.usage_actionable.actionable_id , iot.usage_actionable.event_ts, iot.usage_actionable.state"+
            "       FROM"+
            "           (SELECT actionable_id, MAX(event_ts) AS event_ts"+
            "               FROM"+
            "               iot.usage_actionable"+
            "               GROUP BY"+
            "              actionable_id) AS latest_usage"+
            "      INNER JOIN iot.usage_actionable"+
            "      ON"+
            "     iot.usage_actionable.actionable_id = latest_usage.actionable_id AND"+
            "     iot.usage_actionable.event_ts = latest_usage.event_ts"+
            "  ) as u1"+
            "  ON a1.id=u1.actionable_id"+
            "   WHERE user_id = $1"+
            " ORDER BY event_ts DESC";


        req.pdbM.any(query, [body.user_id])
            .then(function (resulted_actionables) {

                console.log('Found actionable');
                console.log(resulted_actionables)

                res.json(resulted_actionables);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/readsensors', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);



        var query = "SELECT * "+
            "     FROM iot.sensor"+
            "   WHERE user_id = $1";


        req.pdbM.any(query, [body.user_id])
            .then(function (resulted_sensors) {

                console.log('Found sensor');
                console.log(resulted_sensors)

                res.json(resulted_sensors);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/devicedailyreport', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);
        console.log(body.actionable_id);


        var query = "WITH AgentActions AS\n" +
            "(\n" +
            "\tselect ROW_NUMBER() OVER (ORDER BY event_ts) -- Create an index number ordered by time.\n" +
            "\t\t AS Sequence,\n" +
            "\t* from iot.usage_actionable\n" +
            "),\n" +
            "part1 as (SELECT event_ts as \"time\",\n" +
            "\t\t\t\t\t   DATE_PART('minute', AgentActions.event_ts::timestamp -(SELECT other.event_ts::timestamp \n" +
            "\t                          FROM AgentActions Other \n" +
            "\t\t\t\t\t          WHERE other.Sequence = AgentActions.Sequence - 1 ))\n" +
            "\t\t\t\t\t    \n" +
            "\tAS MinutesFromLastPoint\n" +
            "FROM AgentActions\n" +
            "WHERE state='1' AND actionable_id = $1\n" +
            ")\n" +
            "SELECT date_trunc('day', time)::DATE as day , sum(minutesfromlastpoint) as sum_of_minutes_on\n" +
            "FROM part1\n" +
            "GROUP BY day\n" +
            "ORDER BY day ASC";


        req.pdbM.any(query, [body.actionable_id])
            .then(function (resulted_data) {

                console.log('Found actionable');
                console.log(resulted_data)

                res.json(resulted_data);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/devicemonthreport', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);
        console.log(body.actionable_id);
        var month = body.month ;


        // console.log(moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss'))

        console.log(month);

        var query = "WITH AgentActions AS\n" +
            "            (\n" +
            "            select ROW_NUMBER() OVER (ORDER BY event_ts) -- Create an index number ordered by time.\n" +
            "            AS Sequence,*\n" +
            "            from iot.usage_actionable\n" +
            "            ),\n" +
            "            part1 as (SELECT event_ts as \"time\",\n" +
            "            DATE_PART('minute', AgentActions.event_ts::timestamp -(SELECT other.event_ts::timestamp\n" +
            "            FROM AgentActions Other\n" +
            "            WHERE other.Sequence = AgentActions.Sequence - 1 ))\n" +
            "            \n" +
            "            AS MinutesFromLastPoint\n" +
            "            FROM AgentActions\n" +
            "            WHERE state='1' AND actionable_id = $1 --1\n" +
            "            ),\n" +
            "            dailyrep as (SELECT date_trunc('day', time)::DATE as day , sum(minutesfromlastpoint) as sum_of_minutes_on\n" +
            "            FROM part1\n" +
            "            GROUP BY day\n" +
            "            ORDER BY day ASC)\n" +
            "\t\t\tSELECT SUM(sum_of_minutes_on) as minutes, date_trunc('month', day)::DATE as month\n" +
            "\t\t\tFROM dailyrep\n" +
            "\t\t\tWHERE extract(month from(date_trunc('month', day))) = $2 --'2020-03-01'\n" +
            "\t\t\tGROUP BY month";


        req.pdbM.any(query, [body.actionable_id , month])
            .then(function (resulted_data) {

                console.log('Found actionable');
                console.log(resulted_data)

                res.json(resulted_data);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/sensorlastactivereport', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.sensor_id);


        var sensor_id = body.sensor_id;

        var query = "SELECT * FROM iot.usage_sensor WHERE sensor_id= $1 ORDER BY record_ts DESC Limit 1";
        req.pdbM.any(query, [sensor_id])
            .then(function (sensor_last) {

                console.log('Found sensor last activation time');
                console.log(sensor_last);

                res.json(sensor_last);



            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/monthlytriggeredtimes', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.sensor_id);
        var month = body.month ;

        var sensor_id = body.sensor_id;

        var query = "";

        req.pdbM.any(query, [sensor_id])
            .then(function (sensor_last) {

                console.log('Found sensor last activation time');
                console.log(sensor_last);

                res.json(sensor_last);



            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/sensorsactivityreport', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);

        var user_id = body.user_id;

        var query = "With sensor as (\n" +
            "SELECT * FROM iot.sensor WHERE user_id = $1\n" +
            ")\n" +
            "SELECT  usage_sensor.record_value, usage_sensor.record_ts as last_ts, sensor.name as sensor_name, sensor.type\n" +
            "FROM iot.usage_sensor\n" +
            "INNER JOIN sensor \n" +
            "ON sensor.id = usage_sensor.sensor_id \n" +
            "ORDER BY usage_sensor.record_ts DESC;";

        req.pdbM.any(query, [user_id])
            .then(function (sensor_activity) {

                console.log('Found sensor last activation time');
                console.log(sensor_activity);

                res.json(sensor_activity);



            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/insertroutine', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);
        console.log(body.name);
        console.log(body.sensor);
        console.log(body.operator);
        console.log(body.trigger_value);
        console.log(body.actionable);
        console.log(body.when_value);


        var user_id= body.user_id;
        var name= body.name;
        var sensor= body.sensor;
        var operator= body.operator;
        var trigger_value= body.trigger_value;
        var actionable= body.actionable;
        var when_value= body.when_value;


        console.log('Sensor to insert name: '+  sensor);
        console.log('Actionable to insert name: '+  actionable);

        var query = "SELECT id from iot.actionable WHERE name=$1 and user_id= $2";
        req.pdbM.any(query, [actionable , user_id])
            .then(function (actionable_id) {

                console.log('Found actionable to inser');
                console.log(actionable_id);



                var query = "SELECT id from iot.sensor WHERE name=$1 and user_id= $2";
                req.pdbM.any(query, [sensor , user_id])
                    .then(function (sensor_id) {

                        console.log('Found sensor to insert');
                        console.log(sensor_id);



                        var query = "INSERT INTO iot.preferences(\n" +
                            "\t operator, sensor_id, actionable_id, \"when\" , user_id , name)\n" +
                            "\tVALUES ( $1, $2, $3, $4 , $5, $6);";
                        req.pdbM.any(query, [operator, sensor_id[0]['id'], actionable_id[0]['id'], when_value , user_id , name])
                            .then(function (status) {

                                console.log('Routine Inserted');
                                console.log(status)

                                res.json("ok");



                            })
                            .catch(function (error) {
                                res.status(401).json({message: error.message});
                                console.error(error);
                            });







                    })
                    .catch(function (error) {
                        res.status(401).json({message: error.message});
                        console.error(error);
                    });


            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.post('/readroutines', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);

        var query = "WITH sensors as (\n" +
            "SELECT * FROM iot.sensor WHERE user_id = $1\n" +
            ")\n" +
            "SELECT pref.id, pref.name , pref.sensor_id, pref.actionable_id, pref.when, pref.operator, sensors.name as sensor_name, pref.sensor_type, sensors.trigger_value, pref.isenabled \n" +
            "FROM iot.preferences as pref\n" +
            "INNER JOIN sensors ON sensors.id::TEXT = pref.sensor_id\n" +
            "WHERE pref.user_id = $1" +
            "ORDER BY pref.id ASC";


        req.pdbM.any(query, [body.user_id])
            .then(function (resulted_data) {

                console.log('Found preference');
                console.log(resulted_data)

                res.json(resulted_data);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });





    });


})

router.get('/deviceip', function(req, res, next) {


    var device_name = req.query.name;
    var device_ip = req.query.ip;
    var chip_id = req.query.chipid;
    var device_type = req.query.type;
    var user = req.query.userid;

    console.log("DEVICE REGISTERED");
    console.log(device_ip);
    console.log(device_name);
    console.log(chip_id);
    console.log(device_type);
    console.log(user);


    if(device_type=="sensor"){

       // var query = "SELECT *" +" FROM iot.sensor" +" WHERE chipid = $1";

        var query = "SELECT *\n" +
            "FROM iot.sensor as a\n" +
            "INNER JOIN iot.user as b\n" +
            "ON a.user_id = b.id\n" +
            "where chipid =  $1 and a.user_id = $2 ";



        req.pdbM.any(query, [chip_id, user])
            .then(function (resulted_sensor) {

                console.log('Found sensor ?');
                console.log(resulted_sensor)

                if(resulted_sensor.length == 0 ){
                    //IF NOT CHIPID IN DB THEN REGISTER NEW DEVICE



                    var query = "SELECT * \n" +
                        "FROM iot.user \n" +
                        "where id = $1";


                    req.pdbM.any(query, [user])
                        .then(function (resulted_user) {


                            console.log("Running db insertion");
                            var query = "INSERT INTO iot.sensor (name, trigger_value, type, user_id, chipid, ip) VALUES ( $1, $2, $3, $4, $5, $6) Returning * ";


                            console.log(resulted_user)
                            req.pdbM.any(query, [device_name,0,device_type,resulted_user[0].id,chip_id,device_ip])
                                .then(function (resulted_inserted_sensor) {


                                    //EDW THA PREPEI NA PARAGONTAI AUTOMATED TA ALERTS GIA TON KATHE SENSORA
                                    console.log("Running preference insertion");
                                    console.log(resulted_inserted_sensor);
                                    var query = "INSERT INTO iot.preferences (sensor_id, user_id, name, sensor_type, isenabled) VALUES ($1, $2, $3, $4, $5 ) ";

                                    req.pdbM.any(query, [resulted_inserted_sensor[0].id, resulted_inserted_sensor[0].user_id, resulted_inserted_sensor[0].name, resulted_inserted_sensor[0].name, 1])
                                        .then(function (resulted_preference) {


                                            console.log('Inserted device');
                                            res.json("device inserted into db");

                                        })
                                        .catch(function (error) {
                                            res.status(401).json({message: error.message});
                                            console.error(error);
                                        });

                                })
                                .catch(function (error) {
                                    res.status(401).json({message: error.message});
                                    console.error(error);
                                });



                        })
                        .catch(function (error) {
                            res.status(401).json({message: error.message});
                            console.error(error);
                        });



                }else{
                    //CHIPID EXISTS UPDATE IP
                    console.log("GOING TO UPDATE");
                    var query = "UPDATE iot.sensor\n" +
                        "\tSET ip=$2\n" +
                        "\tWHERE chipid= $1 and user_id=$3";

                    req.pdbM.any(query, [chip_id , device_ip, resulted_sensor.user_id])
                        .then(function (resulted_actionables) {


                            console.log("UPDATE OK");
                            res.json("UPDATED");

                        })
                        .catch(function (error) {
                            res.status(401).json({message: error.message});
                            console.error(error);
                        });

                }




            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });


    }else{
        var query = "SELECT *" +" FROM iot.actionable" +" WHERE chipid = $1";

        req.pdbM.any(query, [chip_id])
            .then(function (resulted_actionables) {

                console.log('Found actionable ?');
                console.log(resulted_actionables)

                if(resulted_actionables.length == 0 ){
                    //IF NOT CHIPID IN DB THEN REGISTER NEW DEVICE

                    console.log("Running db insertion");
                    var query = "INSERT INTO iot.actionable (name, trigger_value, type, user_id, chipid, ip) VALUES ( $1, $2, $3, $4, $5, $6) ";

                    req.pdbM.any(query, [device_name,0,'E',1,chip_id,device_ip])
                        .then(function (resulted_actionables) {

                            console.log('Inserted device');
                            res.json("device inserted into db");

                        })
                        .catch(function (error) {
                            res.status(401).json({message: error.message});
                            console.error(error);
                        });



                }else{
                    //CHIPID EXISTS UPDATE IP
                    console.log("GOING TO UPDATE");
                    var query = "UPDATE iot.actionable\n" +
                        "\tSET ip=$2\n" +
                        "\tWHERE chipid= $1;";

                    req.pdbM.any(query, [chip_id , device_ip])
                        .then(function (resulted_actionables) {


                            console.log("UPDATE OK");
                            res.json("UPDATED");

                        })
                        .catch(function (error) {
                            res.status(401).json({message: error.message});
                            console.error(error);
                        });

                }




            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });
    }









});

router.post("/createuser", (req, res) => {

    var age = req.body.age;
    var name = req.body.name;
    var password = req.body.password;
    var username = req.body.username;

    req.con.query("INSERT INTO `user`(`name`, `age`, `username`, `password`) VALUES (?,?,?,?)", [name,age,username,password] , function (err, result) {
        if (err) throw err;
        console.log(result);
        res.json({ message: "User inserted" , status :200});
    });

});

router.post("/loginuser", (req, res) => {



    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);

        var password = body.password;
        var email = body.email;

        console.log("SELECT * FROM iot.user WHERE email=$1 AND password=$2");


        req.pdbM.any("SELECT * FROM iot.user WHERE email=$1 AND password=$2", [email,password])
            .then(function (resulted_data) {

                console.log('returned from /log_in_user');
                console.log(resulted_data)

                res.json(resulted_data);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });

    });

});

router.post("/getusersettings", (req, res) => {



    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);

        var id = body.user_id;

        req.pdbM.any("SELECT * FROM iot.user WHERE id=$1", [id])
            .then(function (resulted_data) {

                console.log('returned from /getusersettings');
                console.log(resulted_data)

                res.json(resulted_data);

            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });

    });

});

router.post('/sensorsnotifications', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);

        var user_id = body.user_id;

        var query = "SELECT * FROM iot.notifications as notifications\n" +
            " INNER JOIN iot.preferences as preferences\n" +
            " ON notifications.sensor_id::text = preferences.sensor_id\n" +
            " WHERE preferences.user_id=$1 and notifications.deleted!=true";

        req.pdbM.any(query, [user_id])
            .then(function (sensor_activity) {

                console.log('Found sensor last activation time');
                console.log(sensor_activity);

                res.json(sensor_activity);



            })
            .catch(function (error) {
                console.error(error);
                res.status(401).json({message: error.message});

            });





    });


})

router.post('/deletenotifications', function (req, res){

    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);
        console.log(body.user_id);

        var user_id = body.user_id;

        var query = "UPDATE iot.notifications\n" +
            "\tSET deleted=true\n" +
            "\tWHERE user_id=$1;";

        req.pdbM.any(query, [user_id])
            .then(function (sensor_activity) {

                console.log('Notification not visible anymore');
                console.log(sensor_activity);

                res.json(sensor_activity);



            })
            .catch(function (error) {
                console.error(error);
                res.status(401).json({message: error.message});

            });





    });


})

router.post("/toggleemailswitch", (req, res) => {



    var body='';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {

        body = JSON.parse(body);

        var value = body.value;
        var id = body.pref_id;

        console.log("Change email to "+value);
        console.log(id);
        var query = "UPDATE iot.preferences\n" +
            "\tSET isenabled=$1\n" +
            "\tWHERE id=$2;";

        req.pdbM.any(query, [value,id])
            .then(function (resulted_data) {

                console.log('returned from /toggleemailswitch');
                console.log(resulted_data);
                res.json({ message: "Usage Record inserted" , status :200});


            })
            .catch(function (error) {
                res.status(401).json({message: error.message});
                console.error(error);
            });

    });

});

module.exports = router;


/* req.pdbM.any("SELECT * FROM iot.preferences WHERE sensor_id=$1", [resulted_sensor[0].id.toString()])
                                     .then(function (resulted_pref) {

                                         console.log('Found preference');
                                         console.log(resulted_pref);
                                         //resulted_pref has s_id, a_id, operator, when
                                         var operator = resulted_pref[0].operator;





                                         req.pdbM.any("SELECT * FROM iot.actionable WHERE id=$1", [parseInt(resulted_pref[0].actionable_id)])
                                             .then(function (resulted_actionable) {

                                                 console.log('Found actionable');
                                                 console.log(resulted_actionable)
                                                 //resulted_pref has s_id, a_id, operator, when
                                                 var actionable = resulted_actionable[0].name;
                                                 var actionable_id = resulted_actionable[0].id;//TO CHANGE THE INSERT WITH THE PROPER ID INSTEAD OF 1



                                                 switch (operator) {
                                                     case('>'):
                                                         if(resulted_sensor[0].trigger_value > body.sensor_value){
                                                             axios.post('http://192.168.4.12:80/'+actionable , params , {headers:{'content-type':'application/json'}})
                                                                 .then(response => {

                                                                     if ( typeof response !== 'undefined')
                                                                     {
                                                                         //do stuff if query is defined and not null
                                                                         response=response.data.actionable_state;

                                                                     }
                                                                     else
                                                                     {
                                                                         response= '';
                                                                         console.log('Response from actionable not received');
                                                                         console.log(response);
                                                                     }


                                                                     if (response==1){
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log('Usage Record inserted - state:1');
                                                                                 res.json({ message: "Usage Record inserted" , status :200});



                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });

                                                                     }else if (response==0){
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log('Usage Record inserted - state:0');
                                                                                 res.json({ message: "Usage Record inserted" , status :200});


                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });
                                                                     }else{
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, ts_off, state) VALUES ($1,$2,$3) " , [1, now,'unknown'])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log('Usage Record inserted - state:unknown');
                                                                                 res.json({ message: "Usage Record inserted" , status :200});


                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });
                                                                     }





                                                                 })
                                                                 .catch(error => {
                                                                     console.log(error);
                                                                     res.send(error);
                                                                 });
                                                         }


                                                         break;
                                                     case('<'):



                                                         if(resulted_sensor[0].trigger_value < body.sensor_value){
                                                             axios.post('http://192.168.4.12:80/'+actionable , params , {headers:{'content-type':'application/json'}})
                                                                 .then(response => {

                                                                     if ( typeof response !== 'undefined')
                                                                     {
                                                                         //do stuff if query is defined and not null
                                                                         response=response.data.actionable_state;

                                                                     }
                                                                     else
                                                                     {
                                                                         response= '';
                                                                         console.log('Response from actionable not received');
                                                                         console.log(response);
                                                                     }

                                                                     console.log('Changed state to :'+ response);
                                                                     if (response==1){
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log(result);
                                                                                 res.json({ message: "Usage Record inserted" , status :200});



                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });

                                                                     }else if (response==0){
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log(result);
                                                                                 res.json({ message: "Usage Record inserted" , status :200});


                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });
                                                                     }else{
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, ts_off, state) VALUES ($1,$2,$3) " , [1, now,'unknown'])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log('Usage Record inserted - state:unknown');
                                                                                 res.json({ message: "Usage Record inserted" , status :200});


                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });
                                                                     }





                                                                 })
                                                                 .catch(error => {
                                                                     console.log(error);
                                                                     res.send(error);
                                                                 });
                                                         }


                                                         break;
                                                     case('='):



                                                         if(resulted_sensor[0].trigger_value == body.sensor_value){
                                                             axios.post('http://192.168.4.12:80/'+actionable , params , {headers:{'content-type':'application/json'}})
                                                                 .then(response => {

                                                                     if ( typeof response !== 'undefined')
                                                                     {
                                                                         //do stuff if query is defined and not null
                                                                         response=response.data.actionable_state;

                                                                     }
                                                                     else
                                                                     {
                                                                         response= '';
                                                                         console.log('Response from actionable not received');
                                                                         console.log(response);
                                                                     }

                                                                     console.log('Changed state to :'+ response);
                                                                     if (response==1){
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log(result);
                                                                                 res.json({ message: "Usage Record inserted" , status :200});



                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });

                                                                     }else if (response==0){
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-DD-MM HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, event_ts,state) VALUES ($1,$2,$3) " , [1, now,response])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log(result);
                                                                                 res.json({ message: "Usage Record inserted" , status :200});


                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });
                                                                     }else{
                                                                         var now = moment().tz("Europe/Athens").format('YYYY-MM-DD HH:mm:ss');
                                                                         req.pdbM.query("INSERT INTO iot.usage_actionable (actionable_id, ts_off, state) VALUES ($1,$2,$3) " , [1, now,'unknown'])
                                                                         //req.pdbM.any("SELECT id, actionable_id, ts_on, ts_off FROM iot.usage_actionable", [])
                                                                             .then(function (result) {

                                                                                 console.log('Usage Record inserted - state:unknown');
                                                                                 res.json({ message: "Usage Record inserted" , status :200});


                                                                             })
                                                                             .catch(function (error) {
                                                                                 res.status(401).json({message: error.message});
                                                                                 console.error(error);
                                                                             });
                                                                     }





                                                                 })
                                                                 .catch(error => {
                                                                     console.log(error);
                                                                     res.send(error);
                                                                 });
                                                         }


                                                         break;
                                                     default:


                                                 }






                                             })
                                             .catch(function (error) {
                                                 res.status(401).json({message: error.message});
                                                 console.error(error);
                                             });


                                     })
                                     .catch(function (error) {
                                         res.status(401).json({message: error.message});
                                         console.error(error);
                                     });*/


