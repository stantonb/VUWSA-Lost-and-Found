/**
 * Created by borthwstan on 15/08/16.
 */
(function(){
    var pg = require('pg');
    //needed to connect to heroku
    pg.defaults.ssl= true;
    //location of our heroku DB
    var db = "postgres://kwumrsivhgpwme:OkWx2rA84KLrjTPOmSkOc2CIna@ec2-23-21-234-201.compute-1.amazonaws.com:5432/d54qeacf1ad3fc";



    function getXPosJan() {
        var queryResult;
        var startJan = new Date().setFullYear(new Date().getFullYear(),0,0);
        var startFeb = new Date().setFullYear(new Date().getFullYear(),1,0);
        var startMarch = new Date().setFullYear(new Date().getFullYear(),2,0);
        var startApril = new Date().setFullYear(new Date().getFullYear(),3,0);
        var startMay = new Date().setFullYear(new Date().getFullYear(),4,0);
        var startJune = new Date().setFullYear(new Date().getFullYear(),5,0);
        var startJuly = new Date().setFullYear(new Date().getFullYear(),6,0);
        var startAug = new Date().setFullYear(new Date().getFullYear(),7,0);
        var startSept = new Date().setFullYear(new Date().getFullYear(),8,0);
        var startOct = new Date().setFullYear(new Date().getFullYear(),9,0);
        var startNov = new Date().setFullYear(new Date().getFullYear(),10,0);
        var startDec = new Date().setFullYear(new Date().getFullYear(),11,0);

        var stmt = 'SELECT DateCollected, COUNT(DateCollected) AS collectedCount FROM items WHERE (DateCollected >= :startJan) && (DateCollected < :startFeb);';
        var listCount = [0,1,2,3,4,5,6,7,8,9,10,11];

        pg.connect(db,function(err,client,done){
            if(err){
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return ;
            }
            console.log("connection successful");
            //execute the search
            for (i=0;i<listCount.length();i++) {
                client.query(stmt, function(error,result){
                    done();
                    if(error){
                        console.log("query failed");
                        console.log(error);
                        return;
                    }
                    listCount[i]=result;
                    //use call back with out search results
                    cb(false,result);
                });
            }

        });
    }
});