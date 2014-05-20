var express = require("express");
var app = express();
var nodemailer = require('nodemailer');
var MemoryStore = require('connect').session.MemoryStore;
// Import the data layer 
var mongoose = require('mongoose');
var config = {
    // mail: require('./config/mail')
    mail: {
        auth: {
            user: "gmail.user@gmail.com", // service is detected from the username
            pass: "userpass"
        }
    }
};

mongoose.connect('mongodb://' + process.env.IP + '/nodebackbone');

// Import the accounts 
//var Account = require('./models/Account')(config, mongoose, nodemailer);
var models = {
    Account: require('./models/Account')(config, mongoose, nodemailer)
};


app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

/*var getRawBody = require('raw-body');
app.use(function(req, res, next) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '1mb',
        encoding: 'utf8'
    }, function(err, string) {
        if (err) return next(err);

        req.text = string;
        next();
    });
});*/

app.use(require('body-parser')());
app.use(require('cookie-parser')());

var session = require('express-session');
app.use(session({
    secret: "SocialNet secret key",
    store: new MemoryStore()
}));

/*app.get('/', function(req, res){    
    console.log('empieza esto');
    res.render("index", {layout:false}); 
});

app.get('/account/authenticated', function(req, res) {
    if (req.session.loggedIn) {
        res.send(200);
    }
    else {
        res.send(401);
    }
}); 

app.post('/register', function(req, res) {
    var firstName = req.param('firstName', '');
    var lastName = req.param('lastName', '');
    var email = req.param('email', null);
    var password = req.param('password', null);
    if (null == email || null == password) {
        res.send(400);
        return;
    }
    Account.register(email, password, firstName, lastName);
    res.send(200);
});

app.post('/login', function(req, res) {
    console.log('login request');
    var email = req.param('email', null);
    var password = req.param('password', null);
    if (null == email || email.length < 1 || null == password || password.length < 1) {
        res.send(400);
        return;
    }
    Account.login(email, password, function(success) {
        if (!success) {
            res.send(401);
            return;
        }
        console.log('login was successful');
        res.send(200);
    });
});

app.post('/forgotpassword', function(req, res) {
    var hostname = req.headers.host;
    var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
    var email = req.param('email', null);
    if (null == email || email.length < 1) {
        res.send(400);
        return;
    }
    Account.forgotPassword(email, resetPasswordUrl, function(success) {
        if (success) {
            res.send(200);
        }
        else { // Username or password not found      
            res.send(404);
        }
    });
});

app.get('/resetPassword', function(req, res) {
    var accountId = req.param('account', null);
    res.render('resetPassword.jade', {
        locals: {
            accountId: accountId
        },
        layout:false
    });
});

app.post('/resetPassword', function(req, res) {
    var accountId = req.param('accountId', null);
    var password = req.param('password', null);
    if (null != accountId && null != password) {
        Account.changePassword(accountId, password);
    }
    res.render('resetPasswordSuccess.jade');
});

app.get('/accounts/:id', function(req, res) {
    var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
    Account.findOne({
        _id: accountId
    }, function(account) {
        res.send(account);
    });
});

app.get('/accounts/:id/activity', function(req, res) {
    var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
    models.Account.findById(accountId, function(account) {
        res.send(account.activity);
    });
});
*/

app.get('/', function(req, res) {
    res.render('index.jade');
});
app.post('/login', function(req, res) {
    console.log('login request');
    var email = req.param('email', null);
    var password = req.param('password', null);
    if (null == email || email.length < 1 || null == password || password.length < 1) {
        res.send(400);
        return;
    }
    models.Account.login(email, password, function(account) {
        if (!account) {
            res.send(401);
            return;
        }
        console.log('login was successful');
        req.session.loggedIn = true;
        req.session.accountId = account._id;
        res.send(200);
    });
});
app.post('/register', function(req, res) {
    var firstName = req.param('firstName', '');
    var lastName = req.param('lastName', '');
    var email = req.param('email', null);
    var password = req.param('password', null);
    if (null == email || email.length < 1 || null == password || password.length < 1) {
        res.send(400);
        return;
    }
    models.Account.register(email, password, firstName, lastName);
    res.send(200);
});
app.get('/account/authenticated', function(req, res) {
    if (req.session.loggedIn) {
        res.send(200);
    }
    else {
        res.send(401);
    }
});
app.get('/accounts/:id/activity', function(req, res) {
    var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
    models.Account.findById(accountId, function(account) {
        res.send(account.activity);
    });
});
app.get('/accounts/:id/status', function(req, res) {
    var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
    models.Account.findById(accountId, function(account) {
        res.send(account.status);
    });
});
app.post('/accounts/:id/status', function(req, res) {
    var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
    models.Account.findById(accountId, function(account) {
        status = {
            name: account.name,
            status: req.param('status', '')
        };
        account.status.push(status);
        // Push the status to all friends
        account.activity.push(status);
        account.save(function(err) {
            if (err) {
                console.log('Error saving account: ' + err);
            }
        });
    });
    res.send(200);
});
app.get('/accounts/:id', function(req, res) {
    var accountId = req.params.id == 'me' ? req.session.accountId : req.params.id;
    models.Account.findById(accountId, function(account) {
        res.send(account);
    });
});
app.post('/forgotpassword', function(req, res) {
    var hostname = req.headers.host;
    var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
    var email = req.param('email', null);
    if (null == email || email.length < 1) {
        res.send(400);
        return;
    }
    models.Account.forgotPassword(email, resetPasswordUrl, function(success) {
        if (success) {
            res.send(200);
        }
        else {
            // Username or password not found
            res.send(404);
        }
    });
});
app.get('/resetPassword', function(req, res) {
    var accountId = req.param('account', null);
    res.render('resetPassword.jade', {
        locals: {
            accountId: accountId
        }
    });
});
app.post('/resetPassword', function(req, res) {
    var accountId = req.param('accountId', null);
    var password = req.param('password', null);
    if (null != accountId && null != password) {
        models.Account.changePassword(accountId, password);
    }
    res.render('resetPasswordSuccess.jade');
});

  
app.listen(process.env.PORT, process.env.IP);
