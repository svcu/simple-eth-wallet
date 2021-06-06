const passport = require("passport");
const local = require("passport-local").Strategy;
const user = require("../models/user")

passport.use(new local({
    usernameField: "email"
}, async (email, password, done)=>{
    const v = await user.findOne({email: email});

    if(v){
        const newUser = new user({email, password});
        const userSelected = await user.findOne({email: email})

        const match = newUser.match(userSelected.password, newUser.password);

        

        if(match){
            return done(null, newUser)
        }else{
            return done(null, false, {message: "Wrong password"})
        }
    }else{
       return done(null, false, {message: "Wrong Email"})
    }
}))




passport.serializeUser((userr, done)=>{
    console.log("USERRR: ", userr)
    done(null, userr.email)
})

passport.deserializeUser( (id, done)=>{
    console.log("ID: ", id)
      user.findOne({email: id}, (err, userr)=>{
          done(err, userr)
      });
})