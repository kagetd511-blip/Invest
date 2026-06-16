/* =========================
   ALERT
========================= */
function showAlert(title, message) {
    document.getElementById("alertTitle").innerText = title;
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").classList.add("show");
}

function closeAlert() {
    document.getElementById("customAlert").classList.remove("show");
}

/* =========================
   LOADING REGISTER (FIX ERROR)
========================= */
function showLoading() {
    const el = document.getElementById("loadingScreen");
    if (el) el.classList.add("active");
}

function hideLoading() {
    const el = document.getElementById("loadingScreen");
    if (el) el.classList.remove("active");
}

/* =========================
   MINI LOADER (LOGIN)
========================= */
function showMiniLoader() {
    const el = document.getElementById("miniLoader");
    if (el) el.classList.add("active");
}

function hideMiniLoader() {
    const el = document.getElementById("miniLoader");
    if (el) el.classList.remove("active");
}

/* =========================
   LOGIN BUTTON
========================= */
function goLogin() {
    showMiniLoader();

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

// ======================
// SHOW PASSWORD
// ======================

function togglePassword(){

let password =
document.getElementById("password");

let eye =
document.getElementById("eyeIcon");

if(password.type === "password"){

    password.type = "text";

    eye.innerHTML =
    '<i class="fa-solid fa-eye-slash"></i>';

}else{

    password.type = "password";

    eye.innerHTML =
    '<i class="fa-solid fa-eye"></i>';

}

}


/* =========================
   REGISTER
========================= */
function register() {

    let username = document.getElementById("username").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let referral = document.getElementById("referral").value.trim();

    if (!username) return showAlert("Peringatan", "Username wajib diisi");
    if (!phone) return showAlert("Peringatan", "Nomor HP wajib diisi");
    if (!password) return showAlert("Peringatan", "Sandi wajib diisi");
    if (!confirmPassword) return showAlert("Peringatan", "Ulangi sandi wajib diisi");

    if (password !== confirmPassword) {
        return showAlert("Peringatan", "Password tidak cocok");
    }

    if (localStorage.getItem(phone)) {
        return showAlert("Gagal", "Nomor HP sudah terdaftar");
    }

    let userData = {
        username,
        phone,
        email,
        password,
        referral,
        saldo: 0,
        level: "Member",
        registerDate: new Date().toLocaleDateString("id-ID")
    };

    localStorage.setItem(phone, JSON.stringify(userData));

   // 1. tampilkan loading
    showLoading();

    // 2. tunggu loading
    setTimeout(() => {

        hideLoading();

        // 3. tampilkan alert sukses
        showAlert("Pendaftaran Berhasil", "Mengalihkan ke halaman login...");

        // 4. tunggu user lihat alert
        setTimeout(() => {

            // 5. pindah halaman
            window.location.href = "login.html";

        }, 4000);

    }, 600);
}
