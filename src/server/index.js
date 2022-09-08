const express = require('express');
const os = require('os');

var multer = require('multer')
var cors = require('cors');

const app = express();
const spawn = require("child_process").spawn;

app.use(express.static('dist'),cors());
const proxy = require("http-proxy-middleware");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, '/home/samurai/gg-mpc-assignment-pbr/application/src/server/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname )
  }
})

var upload = multer({ storage: storage }).single('file')

app.post('/api/sign',function(req,res){
  const fs = require('fs')
  var path = '/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/success'
  console.log(req.query.message);
  const { exec } = require("child_process");
  const command = "bash /home/samurai/gg-mpc-assignment-pbr/application/src/server/server-script.sh"+" "+req.query.message+" "+req.query.uid
  console.log(command)
  if(!fs.existsSync("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/"+req.query.uid)){
    exec(command)
  }
  path = '/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/success'
  if(fs.existsSync("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/"+req.query.uid)){
    if (fs.existsSync(path)) {
      fs.readFile("/home/samurai/gg-mpc-assignment-pbr/application/src/server/outputs/signatures.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("File read failed:", err);
          return;
        }
        res.send(jsonString)
      });
    }else{
      console.log("Bad Signature");
      res.send("Bad Signature") ;
    }}else{
      res.send("processing")
    }
  });

app.post('/api/upload',function(req, res) {
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               console.log(err)
               return res.status(500).json(err)
           } else if (err) {
                console.log(err)
               return res.status(500).json(err)
           }
      return res.status(200).send(req.file)
    })
    console.log("OK")
});

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
