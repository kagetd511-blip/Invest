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

   if(!email){
    return showAlert(
        "Peringatan",
        "Email wajib diisi"
    );
}

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
            })
        });

        let data = await res.json();

        hideLoading();

        if(data.status){

    registerData = {
        username,
        phone,
        email,
        password,
        referral
    };

    document.getElementById("otpText").innerHTML =
    `Kode OTP telah dikirim ke <b>${email}</b>`;

    document
    .getElementById("otpPopup")
    .classList.add("show");

}else{

    showAlert("Gagal", data.message);

}

}catch(err){

    hideLoading();

    showAlert(
        "Error",
        "Server tidak merespon"
    );

}
}

window.addEventListener("load", () => {

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if(ref){
        const referralInput =
        document.getElementById("referral");

        if(referralInput){
            referralInput.value = ref;
            referralInput.readOnly = true;
        }
    }

});

function getOTP(){

    let otp = "";

    document
    .querySelectorAll(".otp-input")
    .forEach(input=>{
        otp += input.value;
    });

    return otp;
}

async function verifyOTP(){

   if(!registerData){
    return showAlert(
        "Error",
        "Data registrasi tidak ditemukan"
    );
}

    const otp = getOTP();

    if(otp.length !== 6){
        return showAlert(
            "Peringatan",
            "Masukkan 6 digit OTP"
        );
    }

    showLoading();

    try{

        const res = await fetch(
        "https://invest-production-dfd6.up.railway.app/verify-otp",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email: registerData.email,
                otp
            })
        });

        const data = await res.json();

        if(!data.status){

            hideLoading();

            return showAlert(
                "Gagal",
                "OTP tidak valid"
            );
        }

        const registerRes = await fetch(
        "https://invest-production-dfd6.up.railway.app/register",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(registerData)
        });

        const registerDataRes =
        await registerRes.json();

        hideLoading();

        if(registerDataRes.status){

            document
            .getElementById("otpPopup")
            .classList.remove("show");

            showAlert(
                "Berhasil",
                "Pendaftaran Sukses"
            );

            setTimeout(()=>{
                location.href="login.html";
            },1000);

        }else{

            showAlert(
                "Gagal",
                registerDataRes.message
            );

        }

    }catch(err){

        hideLoading();

        showAlert(
            "Error",
            "Server tidak merespon"
        );
    }
}

document
.querySelectorAll(".otp-input")
.forEach((input,index,arr)=>{

    input.addEventListener("input",()=>{

        if(
            input.value.length === 1 &&
            arr[index+1]
        ){
            arr[index+1].focus();
        }

    });

    input.addEventListener("keydown",(e)=>{

        if(
            e.key === "Backspace" &&
            input.value === "" &&
            arr[index-1]
        ){
            arr[index-1].focus();
        }

    });

});
