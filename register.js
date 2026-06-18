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
   if (!/^0\d{9,}$/.test(phone)) {
    return showAlert(
        "Peringatan",
        "Nomor HP harus diawali angka 0 dan minimal 10 digit"
    );
}
   let uniqueDigits = [...new Set(phone)];

if(uniqueDigits.length === 1){
    return showAlert(
        "Peringatan",
        "Nomor HP tidak valid"
    );
}
    if (!password) return showAlert("Peringatan", "Sandi wajib diisi");
   if(password.length < 5){
    return showAlert(
        "Peringatan",
        "Sandi minimal 5 karakter"
    );
}
    if (!confirmPassword) return showAlert("Peringatan", "Ulangi sandi wajib diisi");

    if (password !== confirmPassword) {
        return showAlert("Peringatan", "Password tidak cocok");
    }

   async function register() {

    let username = document.getElementById("username").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let referral = document.getElementById("referral").value.trim();

    if (!username) return showAlert("Peringatan", "Username wajib diisi");
    if (!phone) return showAlert("Peringatan", "Nomor HP wajib diisi");
    if (!password) return showAlert("Peringatan", "Sandi wajib diisi");
    if (password !== confirmPassword) return showAlert("Peringatan", "Password tidak cocok");

    showLoading();

    try {

        let res = await fetch("https://invest-production-366e.up.railway.app/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                phone,
                email,
                password,
                referral
            })
        });

        let data = await res.json();

        hideLoading();

        if (data.status) {

            showAlert("Berhasil", "Pendaftaran Sukses");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 800);

        } else {
            showAlert("Gagal", data.message);
        }

    } catch (err) {
        hideLoading();
        showAlert("Error", "Server tidak merespon");
    }
}
