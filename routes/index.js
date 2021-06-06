const router = require("express").Router();
const user = require("../models/user");
const rp = require("request-promise")
const passport = require("passport")
//const signer = require("ethjs-signer");
require("../helpers/passport")

function auth(req, res, next){
    if(req.isAuthenticated()){
        next()
    }else{
        res.redirect("/login")
    }
}

router.get("/", (req, res)=>{
    res.render("index.hbs")
})

router.get("/login", (req, res)=>{
    res.render("login.hbs")
})

router.get("/register", (req, res)=>{
    res.render("register.hbs")
})

router.post("/user", async (req, res)=>{
    console.log(req.body)

    const {email, password, address, public, private} = req.body;
    const userList = await user.find();
    const lastID = parseInt(userList.length, 10);
    const id = lastID + 1;

    const v = await user.findOne({email: email});

    if(!v){
        const newUser = new user({id, email, password, address, public, private})

        newUser.password = await newUser.encrypt(newUser.password);
    
        await newUser.save();
    
        res.render("login.hbs");
    }else{
        res.send("Used Email")
    }

 
})


router.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
}))

router.get("/dashboard", auth, async (req, res)=>{
    const email = req.user.email;

    const userSelected = await user.findOne({email: email});

    const h = [{
        address : userSelected.address,
        public : userSelected.public,
        private : userSelected.private
    }]

    res.render("dashboard.hbs", {h})
})

router.get("/user", async(req, res)=>{
    res.send(await user.find());
})

router.get("/receive", auth, (req, res)=>{
    res.render("receive.hbs");
})

router.get("/send", auth, (req, res)=>{
    res.render("n.hbs")
})

/*router.post("/sign", (req, res)=>{
        const {private, tx} = req.body;
        var signature;

        signature = signer.sign(tx, private, false);

        res.send(signature)
})*/



module.exports = router;