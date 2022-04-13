const JWT = require("jsonwebtoken")
const createError = require("http-errors")
const { UserModel } = require("../models/users")
const { isRef } = require("@hapi/joi/lib/ref");
const fs = require("fs");
const path = require("path");
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = require("./constans")
const redisClient = require("./init_redis")
function RandomNumberGenerator(){
    return Math.floor((Math.random() * 90000) + 10000)
}
function SignAccessToken(userId){
    return new Promise(async (resolve, reject) => {
        const user = await UserModel.findById(userId)
        const payload = {
            mobile : user.mobile
        };
        const options = {
            expiresIn : "1h"
        };
        JWT.sign(payload, ACCESS_TOKEN_SECRET_KEY, options , (err, token) => {
            if(err) reject(createError.InternalServerError("خطای سروری"));
            resolve(token)
        })
    })
}
function SignRefreshToken(userId){
    return new Promise(async (resolve, reject) => {
        const user = await UserModel.findById(userId)
        const payload = {
            mobile : user.mobile
        };
        const options = {
            expiresIn : "1y"
        };
        JWT.sign(payload, REFRESH_TOKEN_SECRET_KEY, options , async (err, token) => {
            if(err) reject(createError.InternalServerError("خطای سروری"));
            await redisClient.SETEX(userId, (365*24*60*60) ,token);
            resolve(token)
        })
    })
}
function VerifyRefreshToken(token){
        return new Promise((resolve, reject) => {
            JWT.verify(token, REFRESH_TOKEN_SECRET_KEY, async (err, payload) => {
                if(err) reject(createError.Unauthorized("وارد حساب کاربری خود شوید"))
                const {mobile} = payload || {};
                const user = await UserModel.findOne({mobile}, {password : 0, otp : 0})
                if(!user) reject(createError.Unauthorized("حساب کاربری یافت نشد"))
                const refreshToken = await redisClient.get(user._id);
                if(token === refreshToken) return  resolve(mobile);
                reject(createError.Unauthorized("ورود مجدد به حسابی کاربری انجام نشد"))
            })
        })
}

function deleteFileInPublic(fileAddress) {
    const pathFile = path.join(__dirname, "..", "..", "public", fileAddress)
    fs.unlinkSync(pathFile)
}

module.exports = {
    RandomNumberGenerator,
    SignAccessToken,
    SignRefreshToken,
    VerifyRefreshToken,
    deleteFileInPublic
}