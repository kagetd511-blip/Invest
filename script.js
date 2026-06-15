// ========================
// GLOBAL STATE
// ========================
let currentUserKey = localStorage.getItem("currentUser");
let user = null;

function loadUser(){
    currentUserKey = localStorage.getItem("currentUser");
    user = currentUserKey ? JSON.parse(localStorage.getItem(currentUserKey)) : null;
}

// ========================
// DRAWER MENU
// ========================
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

// ========================
// SLIDER
// ========================
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

// ========================
// RENDER USER
// ========================
function renderUser(){

    loadUser();
    if(!user) return;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val;
    };

    set("namaUser", user.username);
    set("saldoHeader", "Rp " + Number(user.saldo).toLocaleString("id-ID"));
    set("saldoDrawer", "Rp " + Number(user.saldo).toLocaleString("id-ID"));
    set("memberId", "ID Member : " + user.memberId);
    set("userPhone", "Nomor HP : " + user.phone);
    set("userLevel", "Level : " + user.level);
    set("userReferral", "Referral : " + (user.referral || "-"));
}

// ========================
// PILIH PAKET
// ========================
function pilihPaket(id){
    localStorage.setItem("selectedPaket", id);
    window.location.href = "paket.html";
}

// ========================
// TEST SALDO
// ========================
function tambahSaldoTest(){

    loadUser();
    if(!user) return;

    user.saldo += 10000000;

    if(!user.riwayatDeposit){
        user.riwayatDeposit = [];
    }

    user.riwayatDeposit.unshift({
        nominal:10000000,
        tanggal:new Date().toLocaleString("id-ID")
    });

    localStorage.setItem(
        currentUserKey,
        JSON.stringify(user)
    );

    alert("TEST SALDO +10.000.000");

    renderUser();
}

// ========================
// UPDATE PAKET (FIX FINAL STABLE)
// ========================
function updatePaket(){

    loadUser();
    if(!user || !Array.isArray(user.paketAktif)) return;

    const now = Date.now();

    user.paketAktif.forEach(p => {

        if(!p.lastTick) p.lastTick = now;

        // 5 detik = 1 hari simulasi
        if(now - p.lastTick >= 5000){

            p.hariBerjalan++;
            p.durasi--;

            const profit = parseInt(p.profit.replace(/[^0-9]/g,""));

            p.saldoPaket += profit;

            p.lastTick = now;
        }
    });

    // ========================
    // CAIR FINAL (FIX UTAMA)
    // ========================
    user.paketAktif = user.paketAktif.filter(p => {

        if(p.durasi <= 0){

    user.saldo += p.saldoPaket;

    if(user.riwayatPaket){

        const item =
        user.riwayatPaket.find(
            x =>
            x.nama === p.nama &&
            x.status === "AKTIF"
        );

        if(item){
            item.status = "KADALUWARSA";
        }
    }

    return false;
}

        return true;
    });

    localStorage.setItem(currentUserKey, JSON.stringify(user));
}

// ========================
// TAMPILKAN PAKET AKTIF (FIX UI)
// ========================
function tampilkanPaketAktif(){

    loadUser();
    if(!user || !Array.isArray(user.paketAktif)) return;

    user.paketAktif.forEach(p => {

        const box = document.getElementById("paket" + p.id);
        if(!box) return;

        const old = box.querySelector(".status-aktif");
        if(old) old.remove();

        const persenHari = (p.hariBerjalan / 14) * 100;

        const profit = parseInt(p.profit.replace(/[^0-9]/g,""));

        const total = p.saldoPaket;

        // 💥 persen profit REAL
        const persenProfit = (((total - p.modal) / p.modal) * 100).toFixed(1);

        box.insertAdjacentHTML("beforeend", `
            <div class="status-aktif">

                <div class="badge">AKTIF</div>

                <p>Modal: Rp ${Number(p.modal).toLocaleString("id-ID")}</p>

                <h4>
                    Rp ${Number(total).toLocaleString("id-ID")}
                    <span style="color:#00ff88;font-size:12px">
                        (${persenProfit}%)
                    </span>
                </h4>

                <p>+Rp ${profit.toLocaleString("id-ID")} / hari</p>

                <p>Sisa Hari: ${p.durasi}</p>

                <div class="progress">
                    <div class="progress-fill" style="width:${persenHari}%"></div>
                </div>

            </div>
        `);
    });
}

// ========================
// TEST PROFIT
// ========================
function testProfit(){

    loadUser();

    if(!user || !Array.isArray(user.paketAktif)){
        alert("Tidak ada paket aktif");
        return;
    }

    user.paketAktif.forEach(p => {
        p.saldoPaket += 50000;
    });

    localStorage.setItem(currentUserKey, JSON.stringify(user));

    alert("TEST PROFIT +50.000");

    renderAll();
}

// ========================
// RENDER ALL
// ========================
function renderAll(){
    renderUser();
    updatePaket();
    tampilkanPaketAktif();
}

// ========================
// AUTO UPDATE
// ========================
setInterval(() => {

    loadUser();
    if(!user) return;

    updatePaket();

    localStorage.setItem(currentUserKey, JSON.stringify(user));

    renderAll();

    console.log("AUTO UPDATE OK");

}, 5000);

// ========================
// START
// ========================
renderAll();

function adminWhatsapp(){

    window.open(
        "https://wa.me/6281234567890",
        "_blank"
    );

}

function logout(){

    document
    .getElementById("logoutPopup")
    .classList.add("active");

}

function tutupLogout(){

    document
    .getElementById("logoutPopup")
    .classList.remove("active");

}

function prosesLogout(){

    localStorage.removeItem("isLogin");

    localStorage.removeItem("currentUser");

    window.location.href =
    "index.html";

}
