var express = require('express');
var router = express.Router();
var pg = require('pg');
//needed to connect to heroku
pg.defaults.ssl= true;
//location of our heroku DB
var database = "postgres://kwumrsivhgpwme:OkWx2rA84KLrjTPOmSkOc2CIna@ec2-23-21-234-201.compute-1.amazonaws.com:5432/d54qeacf1ad3fc";
//our js file for interacting with the db
var db = require('./db.js');
var search = require('./search.js');
var editdb = require("./editdb.js");
var url = require('url');
var testSuite = require('./testSuite.js');

var fs = require('fs');

//set up static db on boot
db.getRestrictedJSONSnapshot(function(err,result){
    if(err){
        console.error(err);
    }
    console.log("application booted");
    console.log("restricted local version of DB created");
})





//setting up express session
router.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

//passport login stuff
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

var login = require("./login.js");
router.use(passport.initialize());
router.use(passport.session());

//this is our strategy for logging in, used by passport
passport.use(new LocalStrategy(
    function(USERNAME, PASSWORD, done) {
        //check the username login in database
        login.login(USERNAME,PASSWORD,done);
    }
));

//the serialize functions are needed by passport to check the session
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
//this method is passed as middleware to see if the user is logged in
function ensureAuthenticated() {
    return function(req,res,next){
        if (req.isAuthenticated()) {
            return next();
        }
        var urlparts = url.parse(req.url,true);
       if(urlparts.pathname=='/search'){
           console.log(urlparts.search);
           res.redirect('/studentsearchresults');
       } else {
           //redirect to login if not logged in
           res.redirect('/login');
       }
    }
}

/* login method*/
router.post('/login', passport.authenticate('local', {failureRedirect: '/login',
        failureFlash: true
    }),function(req,res){
        res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user });
    }
);

/*log out*/
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user});
});


/* GET listing page.  -RJ*/
router.get('/search',ensureAuthenticated(), function(req, res, next) {
    //search logic goes here
    //extract from url search query
    var  urlparts = url.parse(req.url,true);
    //at the moment use simple search
    search.simpleSearch(urlparts.query.mysearch,function(err,result){
        db.getCampuses(function(err1,campusresult){
            db.getCategories(function(err2,categoryresult){
                if(err || err1 ||err2){
                    console.log.print(err);
                    res.render('index', { title: 'Search - VUWSA Lost and Found' , user:req.user});
                } else {
                    res.render('advancedSearch', { title: 'Search - VUWSA Lost and Found',
                        results : result.rows,
                        campus: campusresult.rows,
                        categories: categoryresult.rows,
                        user:req.user});
                }
            })
        })
    })


});

/* GET edit db page. -RJ*/
router.get('/editdb',
    ensureAuthenticated(),
    function(req, res, next) {
        //need to get categories and campus options from DB to give user the current correct options to use
        db.getCampuses(function(err1,campusresult){
            db.getCategories(function(err2,categoryresult){
                if(err1 || err2){
                    console.log("error getting campuses and categories from db");
                    res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user});
                } else {
                    //render page with info from db
                    res.render('editdb', {
                        title: 'Edit Database - VUWSA Lost and Found',
                        categories: categoryresult.rows,
                        campus: campusresult.rows,
                        user: req.user
                    });
                }
            })
        })
    });

//this is where we deal with posts from the edit db page
router.post('/editdb', ensureAuthenticated(), function (req,res){
    //get info from table for re-rendering ad page + add the item to the db
    db.getCampuses(function(err1,campusresult){
        db.getCategories(function(err2,categoryresult){
            editdb.editdb(req, function(msg){
                if(err1 || err2){
                    console.log("error getting campuses and categories from db");
                    res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user});
                } else {
                    res.render('editdb', {
                        title: 'Add Item - VUWSA Lost and Found',
                        categories: categoryresult.rows,
                        campus: campusresult.rows,
                        message: msg,
                        user: req.user
                    });
                }
            });
        })
    })
});




/* GET add item page. -RJ*/
router.get('/addItem', ensureAuthenticated(), function(req, res, next) {
    //need to get categories and campus options from DB to give user the current correct options to use
    db.getCampuses(function(err1,campusresult){
        db.getCategories(function(err2,categoryresult){
            if(err1 || err2){
                console.log("error getting campuses and categories from db");
                res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user});
            } else {
                //render page with info from db
                res.render('addItem', { title: 'Add Item - VUWSA Lost and Found', categories: categoryresult.rows, campus: campusresult.rows, user:req.user});
            }
        })
    })
});

router.post('/addItem', ensureAuthenticated(), function (req,res){
    //get info from table for re-rendering ad page + add the item to the db
    db.getCampuses(function(err1,campusresult){
        db.getCategories(function(err2,categoryresult){
            db.addItem(req.body,function(err3,result){
                if(err1 || err2){
                    console.log("error getting campuses and categories from db");
                    res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user});
                } else {

                    if(err3){
                        res.render('addItem', { title: 'Add Item - VUWSA Lost and Found', categories: categoryresult.rows,
                            campus: campusresult.rows,
                            message: "Error when adding item",
                            user:req.user});
                    }else {
                        res.render('addItem', { title: 'Add Item - VUWSA Lost and Found',
                            categories: categoryresult.rows,
                            campus: campusresult.rows,
                            message: "Item added successfuly",
                            user:req.user});
                    }

                }

            })
        })
    })
});

/* GET advanced search page. */
router.get('/advancedSearch', ensureAuthenticated(), function (req, res) {
    db.getCampuses(function(err1,campusresult){
        db.getCategories(function(err2,categoryresult){
            if(err1 || err2){
                res.render('addItem', { title: 'Add Item - VUWSA Lost and Found',
                    categories: categoryresult.rows,
                    campus: campusresult.rows,
                    message: "Error when adding item",
                    user:req.user});
            }else {

                //get url parts
                var urlparts = url.parse(req.url, true).query;
                //blank load with no search
                if (url.parse(req.url, true).search == '') {
                    res.render('advancedSearch', {
                        title: 'Search Results - VUWSA Lost and Found',
                        categories: categoryresult.rows,
                        campus: campusresult.rows,
                        user: req.user
                    });
                } else {
                    search.advancedSearch(urlparts, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.render('advancedSearch', {
                                title: 'Search Results - VUWSA Lost and Found',
                                categories: categoryresult.rows,
                                campus: campusresult.rows,
                                results: result.rows,
                                user: req.user,
                                previousfrom: urlparts.from,
                                previousto: urlparts.to,
                                previousCategory: urlparts.category,
                                previouschecked: urlparts.includereturned,
                                previouskeywords: urlparts.keywords
                            });
                        }
                    })
                }
            }
        })
    })
});

/* GET view item page. */
router.get('/viewItem', ensureAuthenticated(), function (req, res) {
    var id = url.parse(req.url, true).query.itemid;
    db.viewItem(id,function(err,itemresult){
            var tempDateReceived = reformatDate(itemresult.datereceived);
            itemresult.datereceived = tempDateReceived.itemDate;

            var tempDateReturned = reformatDate(itemresult.datereturned);
            itemresult.datereturned = tempDateReturned.itemDate;

            if (err){
                res.render('index', { title: 'Welcome to VUWSA Lost and Found', user:req.user});
            }

            res.render('viewItem', {
                title: 'View Item - VUWSA Lost and Found',
                itemName: itemresult.itemname,
                itemCategory: itemresult.category,
                itemDesc: itemresult.description,
                itemDateReceived: itemresult.datereceived,
                itemLocFound: itemresult.locationfound,
                itemOwnerName: itemresult.ownername,
                itemCampusLoc: itemresult.campus,
                photoSRC: itemresult.photourl,
                itemid: itemresult.itemid,
                itemReturnStatus: itemresult.returnstatus,
                itemDateReturned: itemresult.datereturned,
                user: req.user
            });
    })
});


/* GET edit item page. */
router.get('/editItem', ensureAuthenticated(), function (req, res) {
    db.getCampuses(function(err,campusresult){
        db.getCategories(function(err,categoryresult){
            db.viewItem(req.query.id, function(err,itemresult){
                var tempDateReceived = reformatDate(itemresult.datereceived);
                itemresult.datereceived = tempDateReceived.itemDate;

                var tempDateReturned = reformatDate(itemresult.datereturned);
                itemresult.datereturned = tempDateReturned.itemDate;

                if (err){
                    res.render('viewItem', {
                        title: 'View Item - VUWSA Lost and Found',
                        itemName: itemresult.itemname,
                        itemCategory: itemresult.category,
                        itemDesc: itemresult.description,
                        itemDateReceived: itemresult.datereceived,
                        itemLocFound: itemresult.locationfound,
                        itemOwnerName: itemresult.ownername,
                        itemCampusLoc: itemresult.campus,
                        photoSRC: itemresult.photourl,
                        itemid: itemresult.itemid,
                        itemReturnStatus: itemresult.returnstatus,
                        itemDateReturned: itemresult.datereturned,
                        user: req.user
                    });
                }


                res.render('editItem', {
                    title: 'Edit Item - VUWSA Lost and Found',
                    categories: categoryresult.rows,
                    campus: campusresult.rows,
                    itemName: itemresult.itemname,
                    itemCategory: itemresult.category,
                    itemDesc: itemresult.description,
                    itemDateReceived: itemresult.datereceived,
                    itemLocFound: itemresult.locationfound,
                    itemOwnerName: itemresult.ownername,
                    itemCampusLoc: itemresult.campus,
                    photoSRC: itemresult.photourl,
                    itemid: itemresult.itemid,
                    itemReturnStatus: itemresult.returnstatus,
                    itemDateReturned: itemresult.datereturned,
                    user:req.user
                });
            })
        })
    })
});

router.post('/viewItem', ensureAuthenticated(), function (req,res){
    //get info from table for re-rendering page + add edited info to the db
    db.getCampuses(function(err,campusresult){
        db.getCategories(function(err2,categoryresult){
            db.editItem(req.body,function(err3,result){
                db.viewItem(req.body.itemid,function(err4,itemresult){
                    var tempDateReceived = reformatDate(itemresult.datereceived);
                    itemresult.datereceived = tempDateReceived.itemDate;

                    var tempDateReturned = reformatDate(itemresult.datereturned);
                    itemresult.datereturned = tempDateReturned.itemDate;


                    if (err || err2 || err3 || err4){
                        res.render('editItem', {
                            title: 'Edit Item - VUWSA Lost and Found',
                            categories: categoryresult.rows,
                            campus: campusresult.rows,
                            itemName: itemresult.itemname,
                            itemCategory: itemresult.category,
                            itemDesc: itemresult.description,
                            itemDateReceived: itemresult.datereceived,
                            itemLocFound: itemresult.locationfound,
                            itemOwnerName: itemresult.ownername,
                            itemCampusLoc: itemresult.campus,
                            photoSRC: itemresult.photourl,
                            itemid: itemresult.itemid,
                            itemReturnStatus: itemresult.returnstatus,
                            itemDateReturned: itemresult.datereturned,
                            message: "Error editing item",
                            user:req.user
                        });
                    }

                    res.render('viewItem', {
                        title: 'View Item - VUWSA Lost and Found',
                        itemName: itemresult.itemname,
                        itemCategory: itemresult.category,
                        itemDesc: itemresult.description,
                        itemDateReceived: itemresult.datereceived,
                        itemLocFound: itemresult.locationfound,
                        itemOwnerName: itemresult.ownername,
                        itemCampusLoc: itemresult.campus,
                        photoSRC: itemresult.photourl,
                        itemid:itemresult.itemid,
                        itemReturnStatus: itemresult.returnstatus,
                        itemDateReturned: itemresult.datereturned,
                        message: "Item information successfully updated",
                        user: req.user
                    });
                })
            })
        })
    })
});


/* Function to reformat date correctly  -TG */
reformatDate = function(itemDate) {
//format from timestamp to date

    if (itemDate == null){
        itemDate = new Date();
        itemDate = itemDate.toJSON();
    }

    console.log("Date: " + itemDate);
    var yy = itemDate.toString().substring(0, 4);
    var mm = itemDate.toString().substring(5, 7);
    var dd = itemDate.toString().substring(8, 10);
    var ddNew = Number(dd) + Number(1);
    var mmNew = Number(mm);


    //For months with 30 days -- 4, 6, 9, 11
    if (dd == 30) {
        if (mm == 4 || mm == 6 || mm == 9 || mm == 11) {
            mmNew = Number(mm) + Number(1);
            ddNew = Number(1);
            itemDate = ddNew + '-' + mmNew + "-" + yy;
        }
    }

    //For months with 31 days -- 1, 3, 5, 7, 8, 10, 12
    else if (dd == 31) {
        if (mm == 1 || mm == 3 || mm == 5 || mm == 7 || mm == 8 || mm == 10 || mm == 12) {
            mmNew = Number(mm) + Number(1);
            ddNew = Number(1);
            itemDate = ddNew + '-' + mmNew + "-" + yy;
        }
    }

    // If current year is a leap year
    else if (dd == 29 && mm == 2 && Number(yy) % 4 == 0) {
        mmNew = Number(mm) + Number(1);
        ddNew = Number(1);
        itemDate = ddNew + '-' + mmNew + "-" + yy;
    }

    // If current year is not a leap year
    else if (dd == 28 && mm == 2 && Number(yy) % 4 != 0) {
        mmNew = Number(mm) + Number(1);
        ddNew = Number(1);
        itemDate = ddNew + '-' + mmNew + "-" + yy;
    }

    itemDate = ddNew + '-' + mmNew + "-" + yy;
    return {itemDate: itemDate};
};

/* GET login page. */
router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Log In - VUWSA Lost and Found' });
});

/*GET student view page. */
router.get('/studentView', function(req,res,next){
    res.render('studentView', {title: 'Student View - VUWSA Lost and Found'});
});

//deals with performing a restricted student search
router.get('/studentSearchResults', function(req,res,next){
    var urlparts = url.parse(req.url,true);
        db.getCategories(function (err, categoryresult) {
            if(err){
                console.log("error getting categories from DB");
            }
            //if no url params then just load
            if (urlparts.search == '') {
                //render the page without results!
                if(urlparts.query.from==null){ urlparts.query.from='';}
                if(urlparts.query.to==null){ urlparts.query.to='';}
                res.render('studentSearchResults', {title: 'Student Search - VUWSA Lost and Found', categories: categoryresult.rows, results: 0, previousFrom:urlparts.query.from,previousTo:urlparts.query.to, previousCategory:urlparts.query.category, user:req.user});
            } else {
                //otherwise perform a student search
                search.studentSearch(urlparts, function (err, result) {
                    if (err) {
                        console.log("error performing student search");
                    } else {
                        if(urlparts.query.from==null){ urlparts.query.from='';}
                        if(urlparts.query.to==null){ urlparts.query.to='';}
                        //render student results page with the results from the DB
                        res.render('studentSearchResults', {title: 'Search Results - VUWSA Lost and Found',
                            categories:categoryresult.rows,
                            results: result.rows.length,
                            previousFrom:urlparts.query.from,
                            previousTo:urlparts.query.to,
                            previousCategory:urlparts.query.category,
                            user:req.user});
                    }
                });
            }
        })
});

/*GET statistics view page. */  //MUST FIX ONLY WORKS FOR 2016
router.get('/statistics', ensureAuthenticated(), function(req,res,next){
    db.countItems(function (err, arrResult) {
        var jan = 450 - ((JSON.stringify(arrResult[0]).match(/\d+/)[0]));
        var feb = 450 - ((JSON.stringify(arrResult[1]).match(/\d+/)[0]));
        var mar = 450 - ((JSON.stringify(arrResult[2]).match(/\d+/)[0]));
        var apr = 450 - ((JSON.stringify(arrResult[3]).match(/\d+/)[0]));
        var may = 450 - ((JSON.stringify(arrResult[4]).match(/\d+/)[0]));
        var jun = 450 - ((JSON.stringify(arrResult[5]).match(/\d+/)[0]));
        var jul = 450 - ((JSON.stringify(arrResult[6]).match(/\d+/)[0]));
        var aug = 450 - ((JSON.stringify(arrResult[7]).match(/\d+/)[0]));
        var sep = 450 - ((JSON.stringify(arrResult[8]).match(/\d+/)[0]));
        var oct = 450 - ((JSON.stringify(arrResult[9]).match(/\d+/)[0]));
        var nov = 450 - ((JSON.stringify(arrResult[10]).match(/\d+/)[0]));
        var dec = 450 - ((JSON.stringify(arrResult[11]).match(/\d+/)[0]));

        res.render('statistics', {title: 'Statistics - VUWSA Lost and Found', january: jan, february: feb, march: mar, april: apr, may: may, june: jun, july: jul, august: aug, september: sep, october: oct, november: nov, december: dec, user:req.user});
    })

});

/* GET testing page. */
router.get('/testing/*', function(req, res, next) {

    var urlparts = url.parse(req.url,true);
    urlparts = urlparts.path;
    //isolate the sub path we want to use
    var subPath  = urlparts.replace("/testing/","");


    testSuite.test(subPath, function(err,result){
        //which test page do we want to render?
        if(subPath=="countitems"){
            res.render("RoutesTesting", {test: subPath, result: result});
        } else if (subPath=="addremovecategory"){
            res.render("RoutesTesting", {test: subPath, result: result});
        } else if(subPath =="addremovecampus"){
            res.render("RoutesTesting", {test: subPath, result: result});
        }else if(subPath =="editItem"){
        } else if(subPath =="addremoveitem"){
            res.render("RoutesTesting", {test: subPath, result: result});
        }

    });
});

router.get('/itemPagesTesting', function(req, res, next) {
    res.render("itemPagesTesting");
});

router.get('/staticStudentView',function(req,res,next){
    fs.readFile("../static/jsondb.json", function(err,data){
        if(err){
            console.error(err);
        }
        var dbobject = JSON.parse(data);
        res.render("staticStudentView", {title: 'Search Results - VUWSA Lost and Found',
            resultslength: dbobject.length,
            results: dbobject,
            user:req.user});

    } )

})

module.exports = router;

