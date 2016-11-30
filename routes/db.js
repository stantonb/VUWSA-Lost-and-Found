/**
 * Created by johnstrobe on 8/08/16.
 */
var arr = [1,2,3,4,5,6,7,8,9,10,11,12];
var year = new Date().getFullYear().toString();
var datesArray = ["'2016-01-01'", "'2016-02-01'", "'2016-03-01'", "'2016-04-01'", "'2016-05-01'", "'2016-01-01'", "'2016-06-01'", "'2016-07-01'", "'2016-08-01'", "'2016-09-01'", "'2016-10-01'", "'2016-11-01'", "'2016-12-01'"];

(function() {


    var pg = require('pg');
    //needed to connect to heroku
    pg.defaults.ssl = true;
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
    var WHERE = "WHERE ";
    var DELETE_FROM = "DELETE FROM ";
    var ALTER = "ALTER ";
    var TABLE = "TABLE ";
    var ADD_COLUMN = "ADD COLUMN ";
    var DROP_COLUMN = "DROP COLUMN ";


    //all the functions we can use here
    module.exports = {
        db: db,
        getAllItems: getAllItems,
        getCategories: getCategories,
        getCampuses: getCampuses,
        addItem: addItem,
        deleteItem: deleteItem,
        deleteItemsBeforeDate: deleteItemsBeforeDate,
        addCategory: addCategory,
        removeCategory: removeCategory,
        addCampus: addCampus,
        removeCampus: removeCampus,
        //example:example
        viewItem: viewItem,
        editItem: editItem,
        addCol: addCol,
        removeCol: removeCol,
        countCategories: countCategories,
        countCampuses: countCampuses,
        getJSONSnapshot: getJSONSnapshot, 
        getRestrictedJSONSnapshot:getRestrictedJSONSnapshot,
        countItems: countItems,
        getLastAddedItemid: getLastAddedItemid,
        addUser: addUser,
        removeUser:removeUser,
        getItemsCount:getItemsCount
    };


    /**
     * Returns all the active items from the database -RJ
     * @param cb callback
     */
    function getAllItems(cb) {

        //the sql statement we need
        var stmt = SELECT_ALL + ITEMS_TABLE + ';';
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                cb(false, result);
            });
        });

    }

    /**
     * Returns all possible categories for an item to have
     * used when populating the dropdown menu when adding a new item -RJ
     * @param cb callback
     */
    function getCategories(cb) {

        //the sql statement we need
        var stmt = SELECT_ALL + CATEGORIES_TABLE + ';';
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                cb(false, result);
            });
        });
    }

    /**
     * Returns all the possible campuses
     * used for populating the dropdown menu when adding a new item -RJ
     * @param cb callback
     */
    function getCampuses(cb) {

        //the sql statement we need
        var stmt = SELECT_ALL + CAMPUSES_TABLE + ';';
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                cb(false, result);
            });
        });

    }

    /**
     * Used to add a Column to items table in our db
     * @param new column name and the type it should hold -RJ
     * @param cb callback
     */
    function addCol(name, type, cb) {
        var stmt = ALTER + TABLE + ITEMS_TABLE + ADD_COLUMN + name + " " + type + ";";
        console.log(stmt);
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false, result);
            });
        });

    }

    /**
     * Used to remove a Column from items table in our db -RJ
     * @param column name to remove
     * @param cb callback
     */
    function removeCol(name, cb) {
        var stmt = ALTER + TABLE + ITEMS_TABLE + DROP_COLUMN + name + ";";
        console.log(stmt);
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false, result);
            });
        });

    }


    /**
     * Used to add an item to our database -RJ
     * @param data the required fields to add for the item
     * @param cb callback
     */
    function addItem(data, cb) {
        console.log("adding...");
        //the sql statement we need
        var args = '(\'' + data.itemName + '\',\'' + data.itemDescription + '\',\'' + data.category + '\',\'' + data.dateReceived + '\',\'' +
            data.locationFound + '\',\'' + data.ownerName  + '\',\'' + data.campus + '\',\'' + data.photourl + '\');';

        //Sets default photo if no photo url entered
        if (data.photourl = null) {
            data.photourl = ' ';
        }


        var stmt = /*'SET datestyle = \"ISO,DMY\";*/ INSERT + ITEMS_TABLE + '(itemName,Description,Category,datereceived,LocationFound, ownerName, Campus,photourl) VALUES' + args ;


        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                cb(false, result);
            });
        });

    }



    /**
     * Used to delete an item from our database -RJ
     * @param ID of item to delete
     * @param cb callback
     */
    function deleteItem(data, cb) {

        //only try to do the delete if we have a valid number
        if(parseInt(data,10)>0){

            //for the statement
            var stmt = DELETE_FROM + ITEMS_TABLE + WHERE + "itemid =" + data +";";

            //connect to db
            pg.connect(db, function (err, client, done) {
                if (err) {
                    //deal with db connection issues
                    console.log('cant connect to db');
                    console.log(err);
                    return;
                }
                console.log("connection successful");
                //submit the statement we want
                client.query(stmt, function (error, result) {
                    done();
                    if (error) {
                        console.log("query failed");
                        console.log(error);
                        return;
                    }
                    cb(false, result);
                });

            });

        }
    }



    /**
     * Used to delete all items before a given date from our database -RJ
     * @param ID of item to delete
     * @param cb callback
     */
    function deleteItemsBeforeDate(data, cb) {

        console.log(data);
        //only try to do the delete if we have a valid date
        //format should be "dd-mm-yyyy" so lets check that first
        if(data[2] == '-' || data[5] == '-'
                //check month is valid
            && parseInt(data[3]+data[4]) < 12 && parseInt(data[3]+data[4]) >0
                //lazy check day is at lease almost valid
                && parseInt(data[0]+data[1])<= 31 ){


                    //for the statement
                    var stmt = DELETE_FROM + ITEMS_TABLE + WHERE + "datereceived < '" + data +"';";
                    console.log(stmt);
                    //connect to db
                    pg.connect(db, function (err, client, done) {
                        if (err) {
                            //deal with db connection issues
                            console.log('cant connect to db');
                            console.log(err);
                            cb(err);
                        }
                        console.log("connection successful");
                        //submit the statement we want
                        client.query(stmt, function (error, result) {
                            done();
                            if (error) {
                                console.log("query failed");
                                console.log(error);
                                cb(error);
                            }
                            cb(false, result);
                        });
                    });

        }
    }




    /**
     * this method is used to add a category to the Categories table in the database
     * this should only be accessed by a superuser -RJ
     * @param search category to add
     * @param cb callback
     */
    function addCategory(data, cb) {

        var stmt = INSERT + CATEGORIES_TABLE + " (category) VALUES ('" + data + "');";
        console.log(stmt);
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false, result);
            });
        });

    }


    /**
     * this method is used to remove a category from the category table in the database
     * this should only be accessed by a superuser
     * @param search category to remove -RJ
     * @param cb callback
     */
    function removeCategory(data, cb) {

        var stmt = DELETE_FROM + CATEGORIES_TABLE + " WHERE category ILIKE '" + data + "';";
        console.log(stmt);
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false, result);
            });
        });

    }

    /**
     * this method is used to add a campus to the Campus table in the database
     * this should only be accessed by a superuser -RJ
     * @param search campus to add
     * @param cb callback
     */
    function addCampus(data, cb) {

        var stmt = INSERT + CAMPUSES_TABLE + " (campus) VALUES ('" + data + "');";
        console.log(stmt);
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false, result);
            });
        });

    }

    /**
     * this method is used to remove a campus from the Campus table in the database
     * this should only be accessed by a superuser -RJ
     * @param search campus to remove
     * @param cb callback
     */
    function removeCampus(data, cb) {

        var stmt = DELETE_FROM + CAMPUSES_TABLE + " WHERE CAMPUS ILIKE '" + data + "';";
        console.log(stmt);
        //connect to db
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //execute the search
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                //use call back with out search results
                cb(false, result);
            });
        });

    }


    // Created by gelidotris 15/08/16
    /**
     * Function which is used to view details about an item in the database
     * @param cb callback
     */
    function viewItem(id, cb) {
        if (typeof id === "function" || id == null) {
            //use a default thing
            cb(true);
            //if the params arent right here i think we should just bail and not do anything
        }

        var stmt = SELECT_ALL + ITEMS_TABLE + " WHERE itemid = " + id;
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");


            client.query(stmt, function (error, result) {

                var q = JSON.stringify(result.rows);
                var queryResult = JSON.parse(q);

                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }

                cb(false, queryResult[0]);

            });
        });
    }

    // Created by gelidotris 15/08/16
    /**
     * Function which is used to edit details about an item in the database
     * @param cb callback
     */
    function editItem(data,cb) {
        var stmt = 'UPDATE  items SET itemName =  \''+ data.itemName + '\', Description =  \'' + data.itemDescription +
            '\', Category = \'' + data.category + '\', datereceived = \''+ data.dateReceived +'\', LocationFound = \'' +
            data.locationFound + '\', OwnerName = \'' + data.ownerName + '\', Campus = \'' + data.campus + '\', photourl = \'' + data.photourl + '\', returnstatus = \'' +
            data.returnstatus + '\', DateReturned = \'' + data.dateReturned + '\'  WHERE itemid = ' + data.itemid + ' ;';
        console.log(stmt);
        pg.connect(db,function(err,client,done){
            if(err){
                console.log('cant connect to db');
                console.log(err);
                return;
            }

            console.log("connection successful");
            client.query(stmt, function (error, result) {

                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                cb(false, result);
            });
        })
    }


    function processArray(listCount, fn) {
        return new Promise(function(resolve,reject){
            var index = 0;

            function next() {
                if(index<12){
                    processItem(index++).then(next);
                } else {
                    resolve();
                }
            }
            next();
        })

    }


    function countItems(cb) {

        processArray(arr, processItem).then(function(){
            cb(false,arr);
        });

    }

    //deal with one of the counts
    function processItem(item){

                return new Promise(function(resolve,reject){
                    pg.connect(db, function (err, client, done) {
                        if (err) {
                            console.log('cant connect to db');
                            console.log(err);
                            reject();
                        }
                        console.log("connection successful");
                        var stmt = "SELECT COUNT(*) FROM items WHERE (datereturned >= " + datesArray[item] + ") AND (datereturned < " + datesArray[item + 1] + ");";
                        client.query(stmt, function (error, result) {
                            done();
                            if (error) {
                                console.log("query failed");

                                console.log(error);
                                reject();
                            }

                            arr[item] = result.rows;
                            console.log(result.rows);
                            console.log("query succesful");
                            console.log(datesArray[0]);
                            //maybe use the promise count system here??????
                            resolve();
                })
            });
        })

    }

    function countCategories(cb){
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            var stmt = "SELECT COUNT(category) FROM category;";
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                var count = result.rows[0].count;
                cb(false,count);
            });
        });
    }
    function countCampuses(cb){

    }

    /*a full and glorius representation of our database in javascript object notation (thats JSON btw) */
    function getJSONSnapshot(cb){

        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            var stmt = "SELECT row_to_json(t) FROM (SELECT * FROM items) t;";
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }

                //create and return a json representation of our db
                var finalString = "[";

                //get each parsed row and add a comma to be correct
                for(var i=0;  i<result.rows.length; i++){
                    var stringtoadd = JSON.stringify(result.rows[i]);
                    var objectstring = JSON.parse(stringtoadd);

                    //dont add a comma on the last entry
                    finalString+= JSON.stringify(objectstring.row_to_json);
                    if(i<result.rows.length-1){
                        finalString+=",";
                    }
                }
                //add final closing square bracket
                finalString+="]";

                cb(false,finalString);
            });
        });


    }

    /*creates a json representation of our database - restricted to only the given values - ie so students cant see all info about the item*/
    function getRestrictedJSONSnapshot(cb){

        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            //number at end is count of items from the last x days. The category,locationfound,itemid,datereveived are the field we will return and save of the items
            var stmt = "SELECT row_to_json(t) FROM (SELECT itemname, category,locationfound, itemid, datereceived FROM items) t WHERE datereceived > CURRENT_DATE - integer '90';";
            //submit the statement we want
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }

                //create and return a json representation of our db
                var finalString = "[";

                //get each parsed row and add a comma to be correct
                for(var i=0;  i<result.rows.length; i++){
                    var stringtoadd = JSON.stringify(result.rows[i]);
                    var objectstring = JSON.parse(stringtoadd);

                    //dont add a comma on the last entry
                    finalString+= JSON.stringify(objectstring.row_to_json);
                    if(i<result.rows.length-1){
                        finalString+=",";
                    }
                }
                //add final closing square bracket
                finalString+="]";

                cb(false,finalString);
            });
        });


    }


    function getItemsCount(cb){ 
        pg.connect(db, function (err, client, done) { 
            if (err) { 
                //deal with db connection issues 
                console.log('cant connect to db'); 
                console.log(err); 
                return; 
            } 
            console.log("connection successful"); 
            var stmt = "SELECT COUNT(itemid) FROM items;"; 
            //submit the statement we want 
            client.query(stmt, function (error, result) { 
                done(); 
                if (error) { 
                    console.log("query failed"); 
                    console.log(error); 
                    return; 
                } 
                var count = result.rows[0].count; 
                cb(false,count); 
            }); 
        }); }  


        function addItemTest(data, cb){ 
            pg.connect(db, function (err, client, done) { 
                if (err) { 
                    //deal with db connection issues 
                    console.log('cant connect to db'); 
                    console.log(err); 
                    return; 
                } 
                console.log("connection successful - ADD"); 
                var stmt = "INSERT INTO original (itemname) VALUES ('" + data + "');";  
                console.log(stmt);
                client.query(stmt, function (error, result) { 
                    done(); 
                    if (error) { 
                        console.log("query failed - ADD"); 
                        console.log(error); 
                        return; 
                    }
                    cb(false,result); 
                }); 
            }); 
        }

          function deleteItemTest(data, cb) {  
            pg.connect(db, function (err, client, done) { 
                if (err) {

                    //deal with db connection issues 
                    console.log('cant connect to db');
                    console.log(err);
                    return;
                }
                console.log("connection successful - DELETE");
                var stmt = DELETE_FROM + "original WHERE itemname ILIKE '" + data + "';";
                console.log(stmt);
                //submit the statement we want 
                client.query(stmt, function (error, result) {
                    done();
                    if (error) {
                        console.log("query failed - DELETE");
                        console.log(error);
                        return;
                    }
                    cb(false, result);
                });
            });
        }

        function addUser(username,password,cb){
            pg.connect(db, function (err, client, done) {
                if (err) {
                    //deal with db connection issues 
                    console.log('cant connect to db');
                    console.log(err);
                    return;
                }
                console.log("connection successful - ADD USER");
                var stmt = "INSERT INTO users (username,password) VALUES ('" + username+ "','"+password + "');";
                console.log(stmt);
                client.query(stmt, function (error, result) {
                    done();
                    if (error) {
                        console.log("query failed - ADD USER");
                        console.log(error);
                        return;
                    }
                    cb(false,result);
                });
            });
        }

        function removeUser(username,cb){
            pg.connect(db, function (err, client, done) {
                if (err) {
                    //deal with db connection issues 
                    console.log('cant connect to db');
                    console.log(err);
                    return;
                }
                console.log("connection successful - ADD USER");
                var stmt = "DELETE FROM Users WHERE username like '"+username+"' ;";
                console.log(stmt);
                client.query(stmt, function (error, result) {
                    done();
                    if (error) {
                        console.log("query failed - ADD USER");
                        console.log(error);
                        return;
                    }
                    cb(false,result);
                });
            });
        }


    /* Get id of last item added - to be used for deleting added test item */
    function getLastAddedItemid(cb){
        pg.connect(db, function (err, client, done) {
            if (err) {
                //deal with db connection issues 
                console.log('cant connect to db');
                console.log(err);
                return;
            }
            console.log("connection successful");
            // var stmt = "SELECT COUNT(itemname) FROM original;"; 
            var stmt = "SELECT MAX(itemid) FROM items;";
            //submit the statement we want 
            client.query(stmt, function (error, result) {
                done();
                if (error) {
                    console.log("query failed");
                    console.log(error);
                    return;
                }
                var maxid = JSON.stringify(result.rows);
                maxid = maxid.toString().substring(8, 12)
                cb(false, maxid);
            });
        });
    }

})();
