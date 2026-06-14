// ========================
// MENU DRAWER
// ========================
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");

if(menuBtn){
    menuBtn.addEventListener("click", () => {
        drawer.classList.add("active");
        overlay.classList.add("active");
    });
}

if(overlay){
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
// GET USER
// ========================
let currentUserKey = localStorage.getItem("currentUser");
let user = currentUserKey ? JSON.parse(localStorage.getItem(currentUserKey)) : null;

// ========================
// RENDER USER
// ========================
function renderUser(){

    if(!user) return;

    document.getElementById("namaUser").innerText = user.username;
    document.getElementById("saldoHeader").innerText =
        "Rp " + Number(user.saldo).toLocaleString("id-ID");

    document.getElementById("saldoDrawer").innerText =
        "Rp " + Number(user.saldo).toLocaleString("id-ID");

    document.getElementById("memberId").innerText = "ID Member : " + user.memberId;
    document.getElementById("userPhone").innerText = "Nomor HP : " + user.phone;
    document.getElementById("userLevel").innerText = "Level : " + user.level;
    document.getElementById("userReferral").innerText = "Referral : " + (user.referral || "-");
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

    if(!user) return;

    user.saldo += 10000000;

    localStorage.setItem(currentUserKey, JSON.stringify(user));

    alert("TEST: Saldo +10.000.000");

    renderUser();
}

// ========================
// UPDATE PAKET (PROFIT)
// ========================
function updatePaket(){

    if(!user || !Array.isArray(user.paketAktif)) return;

    const sekarang = new Date();
    const hariIni = sekarang.toDateString();

    user.paketAktif.forEach(paket => {

        if(paket.terakhirUpdate !== hariIni){

            paket.hariBerjalan++;
            paket.durasi--;

            let profit = parseInt(paket.profit.replace(/[^0-9]/g,""));

            paket.saldoPaket += profit;

            paket.terakhirUpdate = hariIni;
        }
    });

    // selesai paket
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

    if(!user || !Array.isArray(user.paketAktif)) return;

    user.paketAktif.forEach(paket => {

        let box = document.getElementById("paket" + paket.id);
        if(!box) return;

        let old = box.querySelector(".status-aktif");
        if(old) old.remove();

        let persen = (paket.hariBerjalan / 14) * 100;

        box.insertAdjacentHTML("beforeend", `
            <div class="status-aktif">
                <div class="badge">AKTIF</div>

                <p>Saldo Paket</p>
                <h4>Rp ${Number(paket.saldoPaket).toLocaleString("id-ID")}</h4>

                <p>${paket.profit}</p>
                <p>Sisa: ${paket.durasi} Hari</p>

                <div class="progress">
                    <div class="progress-fill" style="width:${persen}%"></div>
                </div>
            </div>
        `);
    });
}

// ========================
// TEST LIVE (INI BIAR KELIHATAN JALAN)
// ========================
function testProfit(){

    if(!user) return;

    if(!Array.isArray(user.paketAktif)) return alert("Tidak ada paket");

    user.paketAktif.forEach(p => {
        p.saldoPaket += 50000;
    });

    localStorage.setItem(currentUserKey, JSON.stringify(user));

    alert("TEST: Profit +50.000 ditambahkan");

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
// AUTO UPDATE TIAP 5 DETIK
// ========================
setInterval(() => {

    if(!user) return;

    updatePaket();
    localStorage.setItem(currentUserKey, JSON.stringify(user));

    renderAll();

    console.log("AUTO UPDATE BERJALAN");

}, 5000);

// ========================
// START
// ========================
renderAll();
