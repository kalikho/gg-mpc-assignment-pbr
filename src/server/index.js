const express = require('express');
const os = require('os');
var multer = require('multer')
var cors = require('cors');
const path = require("path");
const app = express();
const fs = require('fs')

app.use(express.static('dist'),cors());
const proxy = require("http-proxy-middleware");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, __dirname+"/uploads")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname )
  }
})

var upload = multer({ storage: storage }).single('file')
app.post('/api/sign',function(req,res){
  var path = __dirname+"/outputs/"+req.query.user+"/success"
  const { exec } = require("child_process");
  const command = "bash "+__dirname+"/server-script.sh"+" "+req.query.message+" "+req.query.uid+" "+req.query.client_r+" "+req.query.client_s+" "+req.query.user
  console.log(command)
  if(!fs.existsSync(__dirname+"/outputs/"+req.query.user+"/"+req.query.uid)){
    exec(command)
  }
  path = __dirname+"/outputs/"+req.query.user+"/"+"success"
  if(fs.existsSync(__dirname+"/outputs/"+req.query.user+"/"+req.query.uid)){
    if (fs.existsSync(path)) {
      fs.readFile(__dirname+"/outputs/"+req.query.user+"/"+"signatures.json", "utf8", (err, jsonString) => {
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
  });

  app.post('/api/movefile',function(req,res){
    const user = req.query['0'];
    const move_to_path = __dirname+"/uploads/"+user+"/keygen-server"
    const currentPath = path.join(__dirname, "uploads", "keygen-server");
    fs.renameSync(currentPath, move_to_path, function (err) {
      if (err) {
          throw err
      } else {
          console.log("Successfully moved the file!");
      }
    })
  })

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
