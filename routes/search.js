/**
 * Created by johnstrobe on 15/08/16.
 */
(function(){

    var pg = require('pg');
    //needed to connect to heroku
    pg.defaults.ssl= true;
    //location of our heroku DB
    var db = "postgres://kwumrsivhgpwme:OkWx2rA84KLrjTPOmSkOc2CIna@ec2-23-21-234-201.compute-1.amazonaws.com:5432/d54qeacf1ad3fc";

    //var names of the tables we have
    var ITEMS_TABLE = 'items ';
    var CAMPUSES_TABLE = 'campus ';
    var CATEGORIES_TABLE = 'category ';

    //going to use some vars for building our sql queries
    var SELECT_ALL = 'SELECT * FROM ';
    var INSERT = 'INSERT INTO ';
    var UPDATE = 'UPDATE ';
    var WHERE = "WHERE "

    var DATE_RECEIVED = "datereceived ";


    //all the functions we can use here
    module.exports = {
        search: search,
        simpleSearch: simpleSearch,
        advancedSearch: advancedSearch,
        studentSearch : studentSearch,
        //example:example
    };

    /**
     * this method is used to perform a "student search"
     * this is a search that only uses a category and  (possibly) 2 dates to perform a restricted search
     * @param search category + date range
     * @param cb callback
     */
    function studentSearch(data,cb) {
        //console.log("performing student search");

        //format to get info is... data.query.xxxx   where xxxx is category, from , to;
        //base of the statement - and match category
        if(data.query.category=='All Categories'){
            //change category to a wildcard if no specific category selected
            var stmt = SELECT_ALL + ITEMS_TABLE + WHERE + " category ILIKE '" + "%" + "' ";
        } else {
            //otherwise just include it like normal
            var stmt = SELECT_ALL + ITEMS_TABLE + WHERE + " category ILIKE '" + data.query.category + "' ";
        }

        //if 'from' date is included, add it to the statement
        if(data.query.from!='' && data.query.from!=undefined){
            stmt += " AND " + DATE_RECEIVED +" > '"+data.query.from+"' ";
        }
        //if 'to' date is included then add to statement
        if(data.query.to != '' && data.query.from!=undefined){
            stmt += " AND " + DATE_RECEIVED + " < '"+data.query.to + "'";

        }
        //adding the final semi colon
        stmt += ";";
        // stmt+=' AND datediscarded IS NULL;';
        console.log(stmt);
        //connect to db
        pg.connect(db,function(err,client,done){
            if(err){
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return ;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function(error,result){
                done();
                if(error){
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false,result);
            });
        });
    }


    /**
     * a more advanced search query that makes use of filters to search the DB
     ** @param search query
     * @param cb callback
     */
    function advancedSearch(data,cb) {
        console.log("performing advanced search");

        //need to build this out to make a super complicated SQL query
        //base of the statement
        console.log(data);
        var words = data.keywords.split(" ");
        var stmt = SELECT_ALL + ITEMS_TABLE + WHERE;
        //loop through to flesh out the query
        stmt+="(";
        for(var i =0; i< words.length; i++){
            stmt = stmt + "ItemName ILIKE '%" +words[i]+"%'" +  ' OR Description ILIKE ' + "'%" + words[i]+"%' OR " ;
                if(parseInt(words[i])>0){ stmt += 'itemid= ' +words[i] + " OR ";}
        }

        //end of loop, remove trailing OR and replace with semicolon to finish query - is there a better way to do this??
        stmt=stmt.substring(0,stmt.length-4);
        stmt+=")";
        //include discarded items in search?
        if(data.includereturned !='on'){
            stmt+=' AND datereturned IS NULL ';
        }
        //add category if included
        if(data.category != "All Categories" && data.category != ""){
            stmt+= 'AND category ILIKE ' + "'"+data.category+"' ";
        }
        //add campus if included
        if(data.campus != "All Campuses" && data.campus != ""){
            stmt+= 'AND campus ILIKE ' + "'"+ data.campus + "' ";
        }
        if(data.from!=''){
            stmt += " AND datereceived > '"+data.from+"' ";
        }
        //if 'to' date is included then add to statement
        if(data.to != ''){
            stmt += " AND datereceived < '" + data.to + "'";
        }

        //add final semi cln
        stmt += ';';
        console.log(stmt);


        //connect to db
        pg.connect(db,function(err,client,done){
            if(err){
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return ;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function(error,result){
                done();
                if(error){
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false,result);
            });
        });
    }




    /**
     * a simple search function that takes text from the search bar and uses it to search the DB
     ** @param search query
     * @param cb callback
     */
    function simpleSearch(data,cb) {
        console.log("performing simple search");

        var words =  data.split(" ");
        //base of the statement
        var stmt = SELECT_ALL + ITEMS_TABLE + WHERE;
        //loop through to flesh out the query
        for(var i =0; i< words.length; i++) {
            stmt = stmt + "ItemName ILIKE '%" + words[i] + "%'" + ' OR Description ILIKE ' + "'%" + words[i] + "%' OR ";
            if (parseInt(words[i]) > 0) {
                stmt += 'itemid= ' + words[i] + " OR ";
            }
        }
        //end of loop, remove trailing OR and replace with semicolon to finish query - is there a better way to do this??
        stmt=stmt.substring(0,stmt.length-4);
        stmt+=' AND datereturned IS NULL;';
        console.log(stmt);

        //connect to db
        pg.connect(db,function(err,client,done){
            if(err){
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return ;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function(error,result){
                done();
                if(error){
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false,result);
            });
        });
    }

    /**
     * Used to search our db
     * @param search query
     * @param cb callback
     */
    function search(data,cb) {

        //figure out search logic here
        var stmt = '';

        //connect to db
        pg.connect(db,function(err,client,done){
            if(err){
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return ;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function(error,result){
                done();
                if(error){
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false,result);
            });
        });
    }


})();