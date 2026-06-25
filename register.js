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
   LOADING REGISTER
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
   MINI LOADER
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

/* ======================
   SHOW PASSWORD
====================== */
function togglePassword() {
    let password = document.getElementById("password");
    let eye = document.getElementById("eyeIcon");

    if (password.type === "password") {
        password.type = "text";
        eye.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
        password.type = "password";
        eye.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
}

/* =========================
   REGISTER
========================= */
let registerData = null;

async function register() {

    let username = document.getElementById("username").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let referral = document.getElementById("referral").value.trim();

    if (!username) return showAlert("Peringatan", "Username wajib diisi");
    if (!phone) return showAlert("Peringatan", "Nomor HP wajib diisi");
    if (!email) return showAlert("Peringatan", "Email wajib diisi");

    if (!/^0\d{9,}$/.test(phone)) {
        return showAlert("Peringatan", "Nomor HP tidak valid");
    }

    if (password.length < 5) {
        return showAlert("Peringatan", "Sandi minimal 5 karakter");
    }

    if (password !== confirmPassword) {
        return showAlert("Peringatan", "Password tidak cocok");
    }

    showLoading();

    /* =========================
       SEND OTP (FIX TIMEOUT)
    ========================= */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        let res = await fetch("https://invest-production-dfd6.up.railway.app/send-otp", {
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
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        let data = await res.json();

        hideLoading();

        if (data.status) {

            registerData = {
                username,
                phone,
                email,
                password,
                referral
            };

            document.getElementById("otpText").innerHTML =
                `Kode OTP telah dikirim ke <b>${email}</b>`;

            document.getElementById("otpPopup").classList.add("show");

        } else {
            showAlert("Gagal", data.message || "Gagal mengirim OTP");
        }

    } catch (err) {

        hideLoading();

        if (err.name === "AbortError") {
            showAlert("Timeout", "Server terlalu lama merespon");
        } else {
            showAlert("Error", "Server tidak merespon");
        }
    }
}

/* =========================
   AUTO REFERRAL
========================= */
window.addEventListener("load", () => {

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
        const referralInput = document.getElementById("referral");

        if (referralInput) {
            referralInput.value = ref;
            referralInput.readOnly = true;
        }
    }

});

/* =========================
   OTP COLLECT
========================= */
function getOTP() {
    let otp = "";

    document.querySelectorAll(".otp-input").forEach(input => {
        otp += input.value;
    });

    return otp;
}

/* =========================
   VERIFY OTP (FIX TIMEOUT)
========================= */
async function verifyOTP() {

    if (!registerData) {
        return showAlert("Error", "Data registrasi tidak ditemukan");
    }

    const otp = getOTP();

    if (otp.length !== 6) {
        return showAlert("Peringatan", "Masukkan 6 digit OTP");
    }

    showLoading();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {

        const res = await fetch(
            "https://invest-production-dfd6.up.railway.app/verify-otp",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: registerData.email,
                    otp
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        const data = await res.json();

        if (!data.status) {
            hideLoading();
            return showAlert("Gagal", "OTP tidak valid");
        }

        /* REGISTER FINAL */
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 15000);

        const registerRes = await fetch(
            "https://invest-production-dfd6.up.railway.app/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registerData),
                signal: controller2.signal
            }
        );

        clearTimeout(timeout2);

        const registerDataRes = await registerRes.json();

        hideLoading();

        if (registerDataRes.status) {

            document.getElementById("otpPopup").classList.remove("show");

            showAlert("Berhasil", "Pendaftaran Sukses");

            setTimeout(() => {
                location.href = "login.html";
            }, 1000);

        } else {
            showAlert("Gagal", registerDataRes.message || "Gagal register");
        }

    } catch (err) {

        hideLoading();

        if (err.name === "AbortError") {
            showAlert("Timeout", "Server terlalu lama merespon");
        } else {
            showAlert("Error", "Server tidak merespon");
        }
    }
}

/* =========================
   OTP INPUT UX
========================= */
document.querySelectorAll(".otp-input").forEach((input, index, arr) => {

    input.addEventListener("input", () => {
        if (input.value.length === 1 && arr[index + 1]) {
            arr[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && arr[index - 1]) {
            arr[index - 1].focus();
        }
    });

});
