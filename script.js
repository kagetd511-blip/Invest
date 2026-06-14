const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");

menuBtn.addEventListener("click", () => {
    drawer.classList.add("active");
    overlay.classList.add("active");
});

overlay.addEventListener("click", () => {
    drawer.classList.remove("active");
    overlay.classList.remove("active");
});

const slides = document.querySelectorAll(".slide");

let currentSlide = 0;

setInterval(() => {
    slides[currentSlide].classList.remove("active");

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    slides[currentSlide].classList.add("active");

}, 9000);

const currentUser =
localStorage.getItem("currentUser");

if(currentUser){

    const user =
    JSON.parse(
        localStorage.getItem(currentUser)
    );

    document.getElementById(
"namaUser"
).textContent =
user.username;

    document.getElementById(
        "saldoHeader"
    ).textContent =
    "Rp " +
    Number(user.saldo)
    .toLocaleString("id-ID");

    document.getElementById(
        "saldoDrawer"
    ).textContent =
    "Rp " +
    Number(user.saldo)
    .toLocaleString("id-ID");

    document.getElementById(
        "memberId"
    ).textContent =
    "ID Member : " +
    user.memberId;

    document.getElementById(
        "userPhone"
    ).textContent =
    "Nomor HP : " +
    user.phone;

    document.getElementById(
        "userLevel"
    ).textContent =
    "Level : " +
    user.level;

    document.getElementById(
        "userReferral"
    ).textContent =
    "Referral : " +
    (user.referral || "-");

    updatePaket(user);
tampilkanPaketAktif(user);

}

function pilihPaket(id){

    localStorage.setItem(
        "selectedPaket",
        id
    );

    window.location.href =
    "paket.html";

}

function tambahSaldoTest(){

    const currentUser =
    localStorage.getItem("currentUser");

    if(!currentUser) return;

    let user =
    JSON.parse(
        localStorage.getItem(currentUser)
    );

    user.saldo += 10000000;

    localStorage.setItem(
        currentUser,
        JSON.stringify(user)
    );

    alert(
        "Saldo berhasil ditambah Rp10.000.000"
    );

    location.reload();

}

function updatePaket(user){

    if(!user.paketAktif || user.paketAktif.length === 0){
        return;
    }

    let sekarang = new Date();
    let hariIni = sekarang.toDateString();

    user.paketAktif.forEach((paket) => {

        if(
            paket.terakhirUpdate !== hariIni
        ){

            paket.hariBerjalan++;
            paket.durasi--;

            let profitHarian =
            parseInt(paket.profit.replace(/[^0-9]/g,""));

            paket.saldoPaket += profitHarian;

            paket.terakhirUpdate = hariIni;

        }
    });

    // cek paket selesai
    user.paketAktif = user.paketAktif.filter(paket => {

        if(paket.durasi <= 0){

            user.saldo += paket.modal;

            return false; // hapus paket
        }

        return true;
    });

    localStorage.setItem(
        localStorage.getItem("currentUser"),
        JSON.stringify(user)
    );
}

function tampilkanPaketAktif(user){

    if(!user.paketAktif || user.paketAktif.length === 0){
        return;
    }

    user.paketAktif.forEach(paket => {

        let box = document.getElementById("paket" + paket.id);

        if(!box) return;

        // HAPUS status lama biar tidak numpuk
        let old = box.querySelector(".status-aktif");
        if(old) old.remove();

        let persen = (paket.hariBerjalan / 14) * 100;

        box.insertAdjacentHTML("beforeend", `
            <div class="status-aktif">
                <div class="badge">AKTIF</div>

                <p>Saldo Paket</p>
                <h4>Rp ${Number(paket.saldoPaket).toLocaleString("id-ID")}</h4>

                <p>${paket.profit}</p>
                <p>${paket.durasi} Hari</p>

                <div class="progress">
                    <div class="progress-fill" style="width:${persen}%"></div>
                </div>
            </div>
        `);
    });
}
