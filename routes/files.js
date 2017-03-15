/**
 * Created by Enrique on 03/03/2017.
 */
var express = require('express');
const fs = require('fs');
var path = require('path');
var glob = require("glob");
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('file_manager');
});
router.get('/:route', function(req, res, next) {
    var path = req.params.route.toString().replace(/[,*]/g,'/');
    fs.stat(path,function (err,stat) {
        if(err){
            res.json({error:true,data:err});
        }else
            if(stat.isFile()){
                res.download(path)
            }
    })
});
router.post('/getDir',function (req,res,next) {
    var dir = req.body.dir;
    var r = '<ul class="jqueryFileTree" style="display: none;">';
    try {
        r = '<ul class="jqueryFileTree" style="display: none;">';
        var files = fs.readdirSync(dir,'utf8');
        files.forEach(function(f){
            var ff = dir + f;
            var stats = fs.statSync(ff)
            if (stats.isDirectory()) {
                r += '<li class="directory collapsed"><a href="#" rel="' + ff  + '/">' + f + '</a></li>';
            } else {
                var e = path.extname(f).replace('.','');
                r += '<li class="file ext_' + e + '"><a href="#" rel='+ ff + '>' + f + '</a></li>';
            }
        });
        r += '</ul>';
    } catch(e) {
        r += 'Could not load directory: ' + dir;
        r += '</ul>';
    }
    res.send(r);
})
router.post('/:app',function (req,res,next) {
    if(isApp(req.query.app)){

    }
})

const isApp = function(app){
    config.apps.forEach(function (item,index) {
        if(item==app)
            return true
    })
    return false
}

module.exports = router;
