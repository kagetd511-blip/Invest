/* ===============================
   API BACKEND RAILWAY
================================ */
const API = "https://invest-production-366e.up.railway.app";


/* ===============================
   ANNOUNCEMENT / INBOX MESSAGE
================================ */
function sendMessage(type, text){

    let userPhone = localStorage.getItem("currentUser");
    if(!userPhone) return;

    let key = "messages_" + userPhone;
    let messages = JSON.parse(localStorage.getItem(key)) || [];

    messages.push({
        type: type,
        text: text,
        time: new Date().toLocaleString("id-ID"),
        read: false
    });

    localStorage.setItem(key, JSON.stringify(messages));
}


/* ===============================
   GLOBAL USER STATE
================================ */
let currentUserKey = localStorage.getItem("currentUser");
let user = null;


/* ===============================
   LOAD USER DARI MONGODB
   Ini supaya saldo terbaru muncul
   setelah topup di-approve admin
================================ */
async function loadUser(){

    currentUserKey = localStorage.getItem("currentUser");

    if(!currentUserKey){
        window.location.href = "login.html";
        return;
    }

    try{

        let res = await fetch(API + "/user/" + currentUserKey);
        let data = await res.json();

        if(data.status){

            user = data.user;

            // Simpan cadangan ke localStorage
            localStorage.setItem(
                currentUserKey,
                JSON.stringify(user)
            );

        }else{
            window.location.href = "login.html";
        }

    }catch(err){

        // Kalau server error, pakai data cadangan localStorage
        let localData = localStorage.getItem(currentUserKey);
        user = localData ? JSON.parse(localData) : null;

    }
}


/* ===============================
   GLOBAL LOADER
================================ */
function showLoader(){
    const el = document.getElementById("miniLoader");
    if(el) el.classList.add("active");
}

function hideLoader(){
    const el = document.getElementById("miniLoader");
    if(el) el.classList.remove("active");
}

function withLoader(callback, delay = 800){

    showLoader();

    setTimeout(() => {
        callback();
        hideLoader();
    }, delay);
}


/* ===============================
   DRAWER MENU
================================ */
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");

if(menuBtn && drawer && overlay){

    menuBtn.addEventListener("click", () => {
        drawer.classList.add("active");
        overlay.classList.add("active");
    });

    overlay.addEventListener("click", () => {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    });

}


/* ===============================
   SLIDER BANNER
================================ */
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

if(slides.length > 0){

    setInterval(() => {

        slides[currentSlide].classList.remove("active");

        currentSlide++;

        if(currentSlide >= slides.length){
            currentSlide = 0;
        }

        slides[currentSlide].classList.add("active");

    }, 5000);

}


/* ===============================
   RENDER DATA USER KE DASHBOARD
================================ */
function renderUser(){

    if(!user) return;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val;
    };

    set("namaUser", user.username || "-");

    set(
        "saldoHeader",
        "Rp " + Number(user.saldo || 0).toLocaleString("id-ID")
    );

    set(
        "saldoDrawer",
        "Rp " + Number(user.saldo || 0).toLocaleString("id-ID")
    );

    set(
        "memberId",
        "ID Member : " + (user.memberId || user._id || "-")
    );

    set(
        "userPhone",
        "Nomor HP : " + (user.phone || "-")
    );

    set(
        "userLevel",
        "Level : " + (user.level || "Basic")
    );

    set(
        "userReferral",
        "Referral : " + (user.referral || "-")
    );
}


/* ===============================
   PILIH PAKET
================================ */
function pilihPaket(id){

    withLoader(() => {
        localStorage.setItem("selectedPaket", id);
        window.location.href = "paket.html";
    }, 1000);

}


/* ===============================
   UPDATE PAKET LOKAL
   Bagian ini tetap dipertahankan
   agar JS lama tidak rusak
================================ */
function updatePaket(){

    if(!user || !Array.isArray(user.paketAktif)) return;

}


/* ===============================
   TAMPILKAN PAKET AKTIF
   Bagian ini tetap aman
================================ */
function tampilkanPaketAktif(){

    if(!user || !Array.isArray(user.paketAktif)) return;

    user.paketAktif.forEach(p => {

        if(!p.aktif) return;

        let nomorPaket = "";
        if(p.nama){
            nomorPaket = p.nama.replace(/[^0-9]/g, "");
        }

        const box = document.getElementById("paket" + nomorPaket);
        if(!box) return;

        const old = box.querySelector(".status-aktif");
        if(old) old.remove();

        const profit = Number(p.profitPerHari || 0);
        const modal = Number(p.modal || 0);
        const hari = Number(p.hariBerjalan || 0);
        const durasi = Number(p.durasi || 14);

        const persenHari = (hari / durasi) * 100;

        box.insertAdjacentHTML("beforeend", `
            <div class="status-aktif">
                <div class="badge">AKTIF</div>

                <p>Modal: Rp ${modal.toLocaleString("id-ID")}</p>

                <h4>
                    +Rp ${profit.toLocaleString("id-ID")} / hari
                </h4>

                <p>Hari Berjalan: ${hari} / ${durasi}</p>

                <div class="progress">
                    <div class="progress-fill" style="width:${persenHari}%"></div>
                </div>
            </div>
        `);
    });
}


/* ===============================
   RENDER SEMUA DATA
================================ */
async function renderAll(){

    await loadUser();

    renderUser();

    updatePaket();

    tampilkanPaketAktif();

}


/* ===============================
   ANNOUNCEMENT POPUP DASHBOARD
================================ */
window.addEventListener("load", async () => {

    await renderAll();

    const popup = document.getElementById("announcementPopup");
    const closeBtn = document.getElementById("closeAnnouncement");

    if(!popup) return;

    const fromLogin = sessionStorage.getItem("fromLogin");

    if(fromLogin === "true"){

        popup.style.display = "flex";

        const textEl = document.getElementById("announcementMessageText");
        const text = textEl ? textEl.innerText : "Pengumuman baru";

        sendMessage("info", text);

        sessionStorage.removeItem("fromLogin");

    }else{

        popup.style.display = "none";

    }

    if(closeBtn){

        closeBtn.addEventListener("click", () => {
            popup.style.display = "none";
        });

    }

});


/* ===============================
   AUTO REFRESH SALDO
   Ambil saldo terbaru dari MongoDB
   setiap 5 detik
================================ */
setInterval(async () => {

    await renderAll();

}, 5000);


/* ===============================
   ADMIN WHATSAPP
================================ */
function adminWhatsapp(){
    window.open("https://wa.me/6281234567890", "_blank");
}

function hubungiAdmin(){
    adminWhatsapp();
}


/* ===============================
   LOGOUT
================================ */
function logout(){
    document.getElementById("logoutPopup").classList.add("active");
}

function tutupLogout(){
    document.getElementById("logoutPopup").classList.remove("active");
}

function prosesLogout(){

    withLoader(() => {

        localStorage.removeItem("isLogin");
        localStorage.removeItem("currentUser");

        window.location.href = "login.html";

    }, 1000);

}


/* ===============================
   PINDAH HALAMAN DENGAN LOADER
================================ */
function goWithLoading(url){

    withLoader(() => {
        window.location.href = url;
    }, 1000);

}
