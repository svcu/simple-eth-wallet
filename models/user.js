const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const crypt = require("bcryptjs");
const CryptoJS = require("crypto-js");

const userSchema = new Schema({
    id: String, 
    email: String,
    password: String,
    address: String,
    public: String,
    private: String
})

userSchema.methods.encrypt = async (password) => {
    const salt = await crypt.genSalt(10);
    const hash = await crypt.hash(password, salt);
    return hash;
}

userSchema.methods.match = async (hash, password) => {
    return crypt.compare(password, hash)
}

userSchema.methods.encryptData = (data, pass) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), pass).toString();
}

module.exports = mongoose.model("user", userSchema);
