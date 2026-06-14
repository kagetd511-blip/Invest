// ========================
// GLOBAL STATE
// ========================
let currentUserKey = localStorage.getItem("currentUser");
let user = null;

// ambil ulang user dari localStorage (biar selalu update)
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

    localStorage.setItem(currentUserKey, JSON.stringify(user));

    alert("TEST SALDO +10.000.000");

    renderUser();
}

// ========================
// UPDATE PAKET / PROFIT
// ========================
function updatePaket(){

    loadUser();
    if(!user || !Array.isArray(user.paketAktif)) return;

    const now = new Date();
    const hariIni = now.toDateString();

    user.paketAktif.forEach(p => {

        if(p.terakhirUpdate !== hariIni){

            p.hariBerjalan++;
            p.durasi--;

            const profit = parseInt(p.profit.replace(/[^0-9]/g,""));
            p.saldoPaket += profit;

            p.terakhirUpdate = hariIni;
        }
    });

    // kalau paket habis
    user.paketAktif = user.paketAktif.filter(p => {

        if(p.durasi <= 0){
            user.saldo += p.modal;
            return false;
        }

        return true;
    });

    localStorage.setItem(currentUserKey, JSON.stringify(user));
}

// ========================
// TAMPILKAN PAKET AKTIF
// ========================
function tampilkanPaketAktif(){

    loadUser();
    if(!user || !Array.isArray(user.paketAktif)) return;

    user.paketAktif.forEach(p => {

        const box = document.getElementById("paket" + p.id);
        if(!box) return;

        // hapus tampilan lama
        const old = box.querySelector(".status-aktif");
        if(old) old.remove();

        const persen = (p.hariBerjalan / 14) * 100;

        box.insertAdjacentHTML("beforeend", `
            <div class="status-aktif">
                <div class="badge">AKTIF</div>

                <p>Saldo Paket</p>
                <h4>Rp ${Number(p.saldoPaket).toLocaleString("id-ID")}</h4>

                <p>${p.profit}</p>
                <p>Sisa ${p.durasi} Hari</p>

                <div class="progress">
                    <div class="progress-fill" style="width:${persen}%"></div>
                </div>
            </div>
        `);
    });
}

// ========================
// TEST PROFIT MANUAL (WAJIB ADA BUTTON)
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

    alert("TEST PROFIT +50.000 BERHASIL");

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
// AUTO UPDATE PROFIT
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
