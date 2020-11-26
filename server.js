const express = require('express');
var bodyParser = require('body-parser')

const fileUpload = require('express-fileupload');
var session = require('express-session')

const app = express();
const path = require('path');


var db = require("./database.js")

const fs = require('fs')
const http = require('http')
const https = require('https')

const credentials = {
  key: fs.readFileSync('./security/key.pem'),
  cert: fs.readFileSync('./security/cert.pem'),
  // host: 8443,
  requestCert: false,
  rejectUnauthorized: false
}

const httpsPort = 443;

app.use(fileUpload({
  createParentPath: true
}));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, 'public')))

// app.get('/', (req, res) => {
//   res.redirect('/static/spectrogram.html');
// });

app.all("/database",function(req,res){
  if (req.session.loggedin){
    var sql = "select * from audio_config"
    var params = []
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      res.json({
          "message": "success",
          "data": rows
      })
    });
  }
  else {res.redirect('/directory.html');}
});

app.all("/getfilelist",function(req,res){
  if (req.session.loggedin){
    db.all('select * from audio_config where user_id = ?', [req.session.userid], (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message});
        return;
      }
      arr = []
      for (i = 0; i < rows.length; i++) {
        arr.push(rows[i]['audio_location'])
      }

      res.json({
          "message": "success",
          "data": arr
      })
    });
  }
  else {res.redirect('/')}
});

app.get('/', function(req, res) {
  if (req.session.loggedin){
    res.redirect('/directory.html');
  } else {res.redirect('/login.html')}
});


app.post('/auth', function(req, res) {
	var username = req.body.username;
  var password = req.body.password;
	if (username && password) {
		db.all('SELECT * FROM user_accounts WHERE Username = ? AND Password = ?', [username, password], function(error, results, fields) {

			if (results.length > 0) {
				req.session.loggedin = true;
        req.session.username = username;
        req.session.userid = results[0]['ID'];
				res.redirect('/directory.html');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get("/file", function(req,res){
  if (req.session.loggedin && req.query) {
    // console.log(req.session.username + "/" + req.query.file)
    res.sendFile(path.join(__dirname, "file/" + req.session.username + "/" + req.query.file))
	} else {res.redirect('/')}
});


app.post('/upload_audio', async (req, res) => {
  if (req.session.loggedin){
    try {
      if(!req.files) {
        console.log("no files")
        res.status(500).end('No file uploaded');
      } else {
        req.files.fileUploaded.mv('./file/' + req.session.username + "/" + req.files.fileUploaded.name);
        
        db.run('INSERT INTO audio_config (user_id, audio_location) VALUES (?, ?)', [req.session.userid, req.files.fileUploaded.name], function(err) {
          console.log(err)
          //send response
          res.send({
              status: 200,
              message: 'File is uploaded',
              success: "Updated Successfully"
          });
        });
      }
    } catch (err) {
        res.status(500).send(err);
    }
  }
  else {res.redirect('/')}
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, "192.168.0.9", () => {
  console.log("Https server listing on port : " + httpsPort)
});