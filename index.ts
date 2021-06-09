const router = require("express").Router();
const user = require("../models/user");
const rp = require("request-promise")
const passport = require("passport")
const {ethers}= require("ethers")
//const signer = require("ethjs-signer");
require("../helpers/passport")
const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner()
const s = require("ethjs-signer");

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

    const {email, password, address, publick, privatek} = req.body;
    const userList = await user.find();
    const lastID = parseInt(userList.length, 10);
    const id = lastID + 1;

    const v = await user.findOne({email: email});

    if(!v){
        const newUser = new user({id, email, password, address, public: publick, private: privatek})

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
    res.render("send.hbs")
})

router.get("/generate_keys", (req, res)=>{

    const wallet = ethers.Wallet.createRandom();
    const adress = wallet.address;
    const public_key= wallet.publicKey;
    const priavte_key = wallet.privateKey;
    const mem = wallet.mnemonic;

    const b = {
        "address" : adress,
        "public" : public_key,
        "private" :priavte_key,
        "mem" : mem 
    }

    res.send(b)
})

router.post("/balance", async(req, res)=>{

    const options = {
        uri: " https://api.blockcypher.com/v1/eth/main/addrs/"+req.body.add+"/balance"
    }

    rp(options)
    .then(response => {

        console.log(response)

        res.send(JSON.stringify(response))
    })
})

router.post("/transaction", async(req, res)=>{

    const priv = req.body.private;

    const body = {
        "fromAddress" : req.body.from,
        "toAddress" : req.body.to,
        "value" : req.body.value
    }

   const options = {
        uri: "https://api.cryptoapis.io/v1/bc/eth/ropsten/txs/send",
        method: "POST",
        json: true,
        body: body,
        headers: {
            "Content-Type" : "application/json",
            "X-API-Key" : "444360b0ca99b7daa9b555246b5b1d3659e6378e"
        }
   }

   rp(options)
   .then(response => {
       console.log(response);

       const tx = response;


       const b = {
           "tx" : tx,
           "priv" : priv
       }
       
       const options = {
           uri : "http://localhost:3000/sign",
           method : "post",
           json : true,
           body : b
       }

       rp(options)
       .then(response2 => {
           const hex = response2;

           const b = {
            "hex" : hex
        }
        
        const options = {
            uri : "http://localhost:3000/broadcast",
            method : "post",
            json : true,
            body : b
        }

        rp(options)
        .then(response3 => {
            console.log(response3)
            res.send(response3)
        })
       })
       
   })
    
})

router.post("/sign", async(req, res)=>{
    const {priv, tx} = req.body;

    console.log("SIGNING TRANSACTION....");

    const hex = s.sign(tx, priv, false );

    console.log("TRANSACTION SIGNED: ", hex);

    res.send(hex);
})

router.post("/broadcast", (req, res)=>{
    const {hex} = req.body;

    const body = {
        "hex" : hex
    }

   const options = {
        uri: "https://api.cryptoapis.io/v1/bc/eth/ropsten/txs/push",
        method: "POST",
        json: true,
        body: body,
        headers: {
            "Content-Type" : "application/json",
            "X-API-Key" : "444360b0ca99b7daa9b555246b5b1d3659e6378e"
        }
   }

   rp(options)
   .then(response => {
       console.log(response);

       const ress = {
           "state" : "OK",
           "content" : "Transaction sended succesfully"
       }

       res.send(ress)
   }).catch(e => {

    if(e){
        const ress = {
            "state" : "failure",
            "content" : e.toString()
        }
    
           res.send(ress)
    }

  
   })
    
})

router.get("/generate-from-mem", (req, res)=>{
    const {mem} = req.body;

    const add = ethers.Wallet.fromMnemonic(mem);

    res.send(add)
})



module.exports = router;