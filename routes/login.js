
(function() {

    var pg = require('pg');
    //needed to connect to heroku
    pg.defaults.ssl = true;
    //location of our heroku DB
    var database = "postgres://kwumrsivhgpwme:OkWx2rA84KLrjTPOmSkOc2CIna@ec2-23-21-234-201.compute-1.amazonaws.com:5432/d54qeacf1ad3fc";
    var db = require('./db.js');

    module.exports = {
        db: db,
        login:login
    };

    //function that checks the database to see if the username password pairing exists
    function login(USERNAME, PASSWORD,done){

        pg.connect(database,function(err,client){
            if(err) {
                return console.error('could not connect to postgres', err);
            }
            console.log('Connected to database');
            var query = "SELECT * FROM users WHERE username='%NAME%' AND password='%PASSWORD%';".replace("%NAME%", USERNAME).replace("%PASSWORD%", PASSWORD);
            client.query(query, function(error, result){
                if(error) {
                    console.error(error);
                    return done(null, false);
                }
                else if (result.rowCount === 0){
                    return done(null, false);
                } else {
                    const newUser = {
                        username: USERNAME,
                        password: PASSWORD,
                        id: 1
                    };
                    return done(null,newUser);
                }
            })
        });
    }

})();