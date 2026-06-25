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
   LOADING
========================= */
function showLoading() {
    document.getElementById("loadingScreen")?.classList.add("active");
}

function hideLoading() {
    document.getElementById("loadingScreen")?.classList.remove("active");
}

/* =========================
   REGISTER DATA TEMP
========================= */
let registerData = null;

/* =========================
   SEND OTP
========================= */
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
        return showAlert("Peringatan", "Password minimal 5 karakter");
    }

    if (password !== confirmPassword) {
        return showAlert("Peringatan", "Password tidak cocok");
    }

    showLoading();

    try {

        const res = await fetch("https://invest-production-dfd6.up.railway.app/send-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        hideLoading();

        if (!data.status) {
            return showAlert("Gagal", data.message || "OTP gagal dikirim");
        }

        registerData = {
            username,
            phone,
            email,
            password,
            referral
        };

        document.getElementById("otpPopup").classList.add("show");
        document.getElementById("otpText").innerHTML =
            `Kode OTP telah dikirim ke <b>${email}</b>`;

    } catch (err) {
        hideLoading();
        showAlert("Error", "Server tidak merespon");
    }
}

/* =========================
   AMBIL OTP
========================= */
function getOTP() {
    let otp = "";
    document.querySelectorAll(".otp-input").forEach(input => {
        otp += input.value;
    });
    return otp;
}

/* =========================
   VERIFY OTP + REGISTER
   (INI SUDAH DIGABUNG)
========================= */
async function verifyOTP() {

    if (!registerData) {
        return showAlert("Error", "Data register tidak ditemukan");
    }

    const otp = getOTP();

    if (otp.length !== 6) {
        return showAlert("Peringatan", "Masukkan 6 digit OTP");
    }

    showLoading();

    try {

        const res = await fetch("https://invest-production-dfd6.up.railway.app/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...registerData,
                otp
            })
        });

        const data = await res.json();

        hideLoading();

        if (!data.status) {
            return showAlert("Gagal", data.message || "OTP salah atau gagal register");
        }

        document.getElementById("otpPopup").classList.remove("show");

        showAlert("Berhasil", "Registrasi sukses");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (err) {
        hideLoading();
        showAlert("Error", "Server tidak merespon");
    }
}

/* =========================
   OTP INPUT UX (AUTO FOCUS FIX)
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const inputs = document.querySelectorAll(".otp-input");

    inputs.forEach((input, index) => {

        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "");

            if (input.value && inputs[index + 1]) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && inputs[index - 1]) {
                inputs[index - 1].focus();
            }
        });

    });

});
