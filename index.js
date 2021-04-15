const express=require('express');
const app=express();
app.use(express.json());

require('dotenv').config();

const cors=require('cors');
app.use(cors());

const mongodb=require('mongodb');
const bcrypt=require('bcrypt');

const mongoClient=mongodb.MongoClient;
const objectId=mongodb.ObjectID;


const nodemailer=require('nodemailer');

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'suryanagarajan01@gmail.com',
        pass:process.env.PASSWORD
    }
});

const dbUrl=process.env.DB_URL || "mongodb://127.0.0.1:27017";
const port=process.env.PORT || 4000;


app.post("/signup", async (req,res)=>{
    
    const client = await mongoClient.connect(dbUrl);
    if(client){
        try {
           
            const {email}=req.body;
            const db = client.db("inventory");
                const documentFind = await db.collection("users").findOne({email:req.body.email});
                if(documentFind){
                    res.status(400).json({
                        message:"User already Exists"
                    })
                }else{
                   
                    let salt=await bcrypt.genSalt(10);
                    let hash=await bcrypt.hash(req.body.password,salt);
                    req.body.password=hash;
                    const newuser = {
                        firstName:req.body.name,
                        lastName:req.body.lastName,
                        email:req.body.email,
                        password:req.body.password

                    }
                    let document=await db.collection("users").insertOne(req.body);
                    
                    if(document){ 
                       
                        let info = await transporter.sendMail({
                            from: 'suryanagarajan01@gmail.com', 
                            to: req.body.email, 
                            subject: "Welcome", 
                            html: '<h1>Welcome</h1> <span> your resgistration is succesful </span>'
                          })
                        res.status(200).json({
                            "message":"registration successful"
                        })
                    }
                }
            client.close();
        } catch (error) {
            console.log(error);
            client.close();
        }
    }else{
        res.sendStatus(500);
    }
})

app.listen(port,()=>{console.log("App Started",port)});