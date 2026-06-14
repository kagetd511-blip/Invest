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

}

function pilihPaket(id){

    localStorage.setItem(
        "selectedPaket",
        id
    );

    window.location.href =
    "paket.html";

}
