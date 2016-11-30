var express = require('express');
var router = express.Router();
var database = "postgres://kwumrsivhgpwme:OkWx2rA84KLrjTPOmSkOc2CIna@ec2-23-21-234-201.compute-1.amazonaws.com:5432/d54qeacf1ad3fc";
var pg = require('pg').native;
var multer = require('multer');
var upload = multer({dest: '/images'});

app.post('/file_upload', upload.single('file'), function(req,res){
    var file = _dirname + '/'
})