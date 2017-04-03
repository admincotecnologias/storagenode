var express = require('express');
var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
global.appRoute = path.normalize(__dirname).replace(/[\\*]/g,'/');
console.log(global.appRoute)
var index = require('./routes/index');
var users = require('./routes/users');
var files = require('./routes/files');
var api = require('./routes/api');
var applications = require('./routes/applications');
var db = require('./models/dbSchema');
var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(session({secret:'00VuC2ib9M4HfMewg6vn1ZYe5V3wQq6Y'}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api',api);
app.use('/', index);
app.use('/users', function (req,res,next) {
    sess = req.session
    if(!sess.name){
        res.redirect('/')
    }else
      next()
});
app.use('/users',users)
app.use('/files', function (req,res,next) {
    sess = req.session
    if(!sess.name){
        res.redirect('/')
    }else
        next()
});
app.use('/files',files);

app.use('/applications', function (req,res,next) {
    sess = req.session
    if(!sess.name){
        res.redirect('/')
    }else
        next()
});
app.use('/applications',applications);

app.use('/logout',function (req,res,next) {
    delete req.session.name;
    res.redirect('/');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log(!req.header('token_storage'))
    if(!req.url.includes('api')){
        if(!req.session.name && !req.header('token_storage')){
            res.redirect('/')
        }else{
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        }
    }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
db.createTables();
module.exports = app;

