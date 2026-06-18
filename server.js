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
// DB CONNECT
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
            lastClaim: { type: Number, default: Date.now },
            aktif: { type: Boolean, default: true }
        }
    ]
});

// =========================
// REGISTER
// =========================
app.post("/register", async (req,res)=>{
    try{
        const u = new User(req.body);
        await u.save();

        send(`🔵 REGISTRASI
Username : ${u.username}
HP       : ${u.phone}
Email    : ${u.email}
Referral : ${u.referral || "-"}`);

        res.json({status:true});
    }catch(e){
        res.json({status:false, message:e.message});
    }
});

// =========================
// LOGIN
// =========================
app.post("/login", async (req,res)=>{
    const {phone, password} = req.body;

    const user = await User.findOne({phone});

    if(!user || user.password !== password){
        return res.json({status:false});
    }

    send(`🟢 LOGIN
HP   : ${phone}`);

    res.json({status:true, user});
});

// =========================
// TOPUP
// =========================
app.post("/topup", async (req,res)=>{
    const {phone, nominal, method} = req.body;

    send(`🔴 TOPUP PENDING
HP      : ${phone}
Nominal : Rp ${nominal}
Metode  : ${method}`);

    res.json({status:true});
});

// =========================
// WITHDRAW
// =========================
app.post("/withdraw", async (req,res)=>{
    const {phone, nominal, bank} = req.body;

    send(`💸 WITHDRAW REQUEST
HP      : ${phone}
Nominal : Rp ${nominal}
Bank    : ${bank}`);

    res.json({status:true});
});

// =========================
// REFERRAL
// =========================
app.post("/referral", async (req,res)=>{
    const {phone, referralPhone} = req.body;

    send(`🟨 REFERRAL DIGUNAKAN
HP       : ${phone}
REF      : ${referralPhone}`);

    res.json({status:true});
});

// =========================
// 🔥 ENGINE PAKET 24 JAM (FIXED STABLE)
// =========================
setInterval(async ()=>{

    const users = await User.find({ "paketAktif.0": { $exists: true } });

    const now = Date.now();

    for(let user of users){

        let changed = false;

        for(let paket of user.paketAktif){

            if(!paket.aktif) continue;

            const diff = now - (paket.lastClaim || now);

            // 24 jam
            if(diff >= 24 * 60 * 60 * 1000){

                user.saldo += paket.profitPerHari;
                paket.hariBerjalan += 1;
                paket.lastClaim = now;
                changed = true;

                send(`📈 PROFIT
HP   : ${user.phone}
+Rp ${paket.profitPerHari}`);

                if(paket.hariBerjalan >= paket.durasi){
                    paket.aktif = false;
                    send(`⛔ PAKET SELESAI
HP : ${user.phone}
Paket : ${paket.nama}`);
                }
            }
        }

        if(changed){
            await user.save();
        }
    }

    console.log("Engine running...");

}, 60 * 1000);

// =========================
// SERVER
// =========================
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log("Server running on", PORT);
});
