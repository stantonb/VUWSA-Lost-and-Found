/**
 * Created by johnstrobe on 3/10/16.
 */

(function() {

    var pg = require('pg');
    //needed to connect to heroku
    pg.defaults.ssl = true;
    //location of our heroku DB
    var db = "postgres://kwumrsivhgpwme:OkWx2rA84KLrjTPOmSkOc2CIna@ec2-23-21-234-201.compute-1.amazonaws.com:5432/d54qeacf1ad3fc";
    var db = require('./db.js');
    var search = require('./search.js');
    var editdb = require("./editdb.js");


    module.exports = {
        test: test,
        testAll: testAll
    }
    function testAll(){
        return;
    }

    function test(subPath, cb) {

        //do the actions we actually need to be testing -call back with the results

        //count items test
        if (subPath == "countitems") {
            //do stuff
            db.countItems(function (err, result) {
                if (err) {
                    console.error(err);
                } else {
                    //format our result nicely for testing
                    var array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    for (var i = 0; i < array.length; i++) {
                        array[i] = parseInt(result[i][0].count);
                    }
                    console.log(array[0]);

                    cb(false, array);
                }
            });

            //testing the ability to add and remove categories
        } else if (subPath == "addremovecategory") {
            db.countCategories(function (err, result) {
                console.log(result);
                var initialCount = result;
                db.addCategory("testcategory", function (err, result) {
                    db.countCategories(function (err2, result2) {
                        var firstConditional = (result2 - initialCount == 1);
                        db.removeCategory("testCategory", function (err, result) {
                            db.countCategories(function (err3, result3) {
                                var secondConditional = (result3 == initialCount);
                                var toReturn = {
                                    first: firstConditional,
                                    second: secondConditional
                                }
                                cb(false, toReturn);
                            })
                        })
                    })
                });
            })

        } else if (subPath == "addremovecampus") {
            db.countCampuses(function (err, result) {
                console.log(result);
                var initialCount = result;
                db.addCampus("testcampus", function (err, result) {
                    db.countCampuses(function (err2, result2) {
                        var firstConditional = (result2 - initialCount == 1);
                        db.removeCampus("testcampus", function (err, result) {
                            db.countCampuses(function (err3, result3) {
                                var secondConditional = (result3 == initialCount);
                                var toReturn = {
                                    first: firstConditional,
                                    second: secondConditional
                                };
                                cb(false,toReturn);
                            })
                        })
                    })
                });
            })
        } else if (subPath == "editItem") {//these are not the tests you are looking for
            console.log("get into?");
            db.viewItem(2,function(err,result){
                var returnresult = {
                    first: "test",
                    second: "test"
                }
                cb(false,returnresult);
                /*db.editItem(result, function (err1, result1) {
                    db.viewItem(2,function(err2,result2){
                        console.log(result2.itemName)
                        returnresult.secound=result2.itemName;
                        result2.itemName=null;
                        db.editItem(result2,function(err3,result3){
                            db.viewItem(2,function(err5,result5){
                                console.log(result5.itemName)
                                cb(false,returnresult);
                            })
                        })
                    })

                })*/
            })
        }

        else if (subPath == "addremoveitem") {
            db.countItems(function (err, result) {
                console.log("INITIAL: " + result);
                var initialCount = result;
                var data = { itemName: "testItemName", itemDescription: "testDescription", category: "testCategory", dateReceived: "Mon Oct 3 2016 14:53:54", locationFound: "testLocFound", ownerName: "testOwnerName", campus: "testCampus", photourl: "testPhotourl"};
                db.addItem(data, function (err, result) {
                    db.countItems(function (err2, result2) {
                        var firstConditional = (result2 - initialCount == 1);
                        console.log("1st Cond: " + (result2 - initialCount));
                        db.getLastAddedItemid(function(err3, result3){
                            db.deleteItem(result3, function (err, result) {
                                db.countItems(function (err4, result4) {
                                    var secondConditional = (result4 == initialCount);
                                    console.log("2nd Cond: " + result4);
                                    var toReturn = {
                                        first: firstConditional,
                                        second: secondConditional
                                    }
                                    cb(false, toReturn);
                                })
                            })
                        })
                    })
                });
            })
        }
    }
})();