if(process.env.NODE_ENV != "production"){

    require('dotenv').config();
}

const express= require('express');
const app=express();
const mongoose = require('mongoose');
const path=require('path');
const method= require('method-override'); 
const ejsMate=require('ejs-mate');
const ExpressError= require('./utils/ExpressError.js');
const listings=require('./routes/listing.js');
const reviews = require('./routes/review.js');
const userRouter = require('./routes/user.js');
const session= require('express-session');
const MongoStore= require('connect-mongo');
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy= require('passport-local');
const User = require('./models/user.js');


app.set("view engine",'ejs');
app.set("views",path.join(__dirname,"views"));
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(method('_method'));


const dbUrl=process.env.ATLASDB_URL;

// const MongooUrl='mongodb://localhost:27017/wanderlust';

main().then(()=>{
    console.log("connected");
}).catch((err) =>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*3600,
})
store.on('error',()=>{
    console.log("error in mongo session store",err)
});

const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized: true,
cookie:{
    expire: Date.now()+7 * 24 * 60 *60 *1000,
    maxAge: 7 * 24 * 60 *60 *1000,
    httpOnly: true,
}
};


// app.get('/',(req,res)=>{
//     res.send("hi ,I am root");
// })

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

// app.get('/demouser', async(req,res)=>{
//     let fakeUser= new User({
//         email:"student@gmail.com",
//         username:"delta-student"

//     });
//     const registeredUser= await User.register(fakeUser,"helloworld")
//     res.send(registeredUser);
// })


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use('/',userRouter);





// app.get("/testlisting",async (req,res)=>{
//     let samplelesting= new Listing({
//         title: 'my new villa',
//         description:'By the beach',
//         price:1200,
//         location:'calangute,Goa',
//         country:"India",
//     })
//    await samplelesting.save();
//    console.log("sample was saved")
//    res.send("succesful testing")
// })

app.all('*',(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next)=>{
    let{status=500,message="something went wrong"}=err;
   res.render('listings/error.ejs',{message});
})

app.listen('8080',()=>{
    console.log('app is listining to port 8080');
})