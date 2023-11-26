// Create web server
// By: Virgilio D. Cabading Jr.
// Created on: January 27, 2013
// Last update: January 27, 2013
// ******************************

// Setup web server and socket.io
var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app);

// Setup database
var mongoose = require('mongoose'),
    db = mongoose.connect('mongodb://localhost/test');

// Setup model
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Comment = new Schema({
    id: ObjectId,
    name: String,
    comment: String,
    created: Date
});

var CommentModel = mongoose.model('Comment', Comment);

// Setup web server port
app.listen(8000);

// Setup view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view options', {layout: false});

// Setup static content
app.use(express.static(__dirname + '/public'));

// Setup routes
app.get('/', function(req, res){
    res.render('index');
});

// Setup socket.io
io.sockets.on('connection', function(socket) {
    // Get comments from database
    CommentModel.find({}, function(err, docs) {
        if(err) throw err;
        socket.emit('load', docs);
    });

    // Save comment to database
    socket.on('save', function(data) {
        var comment = new CommentModel(data);
        comment.save(function(err) {
            if(err) throw err;
            io.sockets.emit('save', [data]);
        });
    });
});