const express = require('express');
const multer = require('multer');
const mysql=require('mysql')
const path = require('path');
const fs = require('fs')
const cors=require('cors')
const bodyParser=require('body-parser');


//lidhja me db
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'webc',
    multipleStatements:true

})

db.connect()

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });


  // Init Upload
const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('image');
  
  // Check File Type
  function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }

  
  const app = express();
  app.use(cors())

app.use((req, res, next) => {
    
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
      );
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

// Public Folder
app.use(express.static('./public'));
//ketu do bejm postin
let varc;
app.post('/post',(req,res)=>{
let bod=req.body
console.log(bod)


if(!bod){
    res.status(400).send({
        error:true,
        message:"te dhenat nuk jane te sakta"
        
    })
}
else{
    
    db.query('INSERT INTO post(first_name,last_name,location,phone_nr,post_type,register_date,body)\
     VALUES("?","?","?","?","?","?","?");',[req.body.first_name,req.body.last_name,req.body.location,req.body.phone_nr,req.body.post_type,req.body.body],
        
     (err,result,field)=>{
         if(err)throw err
         else{
             console.log('viij ketu')
            
            res.status(200).json({

                message: "Postimi juaj u realizuar",
                data: result
                
            })
           
            
         }
        
         


        })
}



       

})

//tn do hedhim fotot

app.post('/upload/img',(req,res)=>{ 
  upload(req, res, (err) => {
        
    console.log(req.body)
    
    if(err){
        console.log('jam tap')
      throw err
    } else {
      // kujdeeees
      let sql2='SELECT id FROM post ORDER BY ID DESC LIMIT 1'
      db.query(sql2,(err,rows)=>{
        if(err)throw err
else{
  let kjo=0;
    rows.forEach(row=> {
        kjo=row.id
        console.log(kjo)
    })
   console.log(JSON.stringify(req.file.path))
  var sql = "INSERT INTO image (post_id,img_name,img_path) VALUES('"+kjo +"','"+ req.file.filename+"','"+JSON.stringify(req.file.path) +"');"

  db.query(sql, (err, result)=>{
     if(err)throw err 
   else{
     res.status(200).json({

      message: "Postimi juaj u realizuar",
      data: result
     
  })

}
     })
}
      })
   
    
    }
  });
  
})
  
//metoda get nqss ti klikon ke nje nga postimet
app.get('/car/rentcr/:id',(req,res)=>{
  let arraypath=[];
  let idi=req.params.id;
  
  let sql='SELECT *FROM post WHERE id='+idi
  db.query(sql,(err,result)=>{
    if(err)throw err
    else{
      
      let sql2='SELECT img_path FROM image WHERE post_id='+idi
      db.query(sql2,(err,rows)=>{
        if(err)throw err
        else{
          rows.forEach(row=> {
            arraypath.push(row.img_path)

            
                
          })
          console.log(arraypath)
            
          res.status(200).json({
            message:'sadas',
            data:result,arraypath
          })
        }
      })
    }

  
  })
})

//metoda get qe do i hedhesh ne state dhe do i shfaqesh si ke todo
app.get('/home',(req,res)=>{
  let sql='SELECT  p.id as id, p.first_name as first_name,\
   p.location as location, i.img_name as image_name,\
    i.img_path as image_path FROM post p inner join image i ON p.id=i.post_id group\
     by p.id ORDER BY p.id DESC LIMIT 0, 10'
     db.query(sql,(err,result)=>{
       if(err)throw err
       else{
         res.status(200).json({
           message:'postimet kryesore te faqes',
           data:result
         })
       }
     })
  
})

app.listen(5000,()=>{
    console.log('porta eshte e hapur')
})