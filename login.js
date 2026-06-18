function showAlert(title, message){

document.getElementById(
"alertTitle"
).innerText = title;

document.getElementById(
"alertMessage"
).innerText = message;

document.getElementById(
"customAlert"
).classList.add("show");

}

function closeAlert(){

document.getElementById(
"customAlert"
).classList.remove("show");

}

// ======================
// LOADING LOGIN
// ======================

function showLoading(){

document
.getElementById("loadingScreen")
.classList.add("active");

}

function hideLoading(){

document
.getElementById("loadingScreen")
.classList.remove("active");

}

// ======================
// LOADING REGISTER
// ======================

function goRegister(){

document
.getElementById("miniLoader")
.classList.add("active");

setTimeout(()=>{

    window.location.href =
    "register.html";

},1500);

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

function openForgotPassword(){
    document
    .getElementById("forgotPopup")
    .classList.add("show");
}

function closeForgotPassword(){
    document
    .getElementById("forgotPopup")
    .classList.remove("show");
}

function resetPassword(){

    let phone =
    document.getElementById("resetPhone")
    .value.trim();

    let newPass =
    document.getElementById("newPassword")
    .value.trim();

    if(phone === ""){
        showAlert(
        "Peringatan",
        "Masukkan nomor HP"
        );
        return;
    }

    if(newPass.length < 5){
        showAlert(
        "Peringatan",
        "Sandi minimal 5 karakter"
        );
        return;
    }

    let data =
    localStorage.getItem(phone);

    if(!data){

        showAlert(
        "Gagal",
        "Nomor HP tidak terdaftar"
        );
        return;
    }

    let user =
    JSON.parse(data);

    user.password = newPass;

    localStorage.setItem(
    phone,
    JSON.stringify(user)
    );

    document
    .getElementById("forgotPopup")
    .classList.remove("show");

    showAlert(
    "Berhasil",
    "Sandi berhasil diubah"
    );
}

// ======================
// LOGIN
// ======================

function login(){

let phone =
document.getElementById("phone")
.value.trim();

let password =
document.getElementById("password")
.value;

if(phone === ""){

    showAlert(
    "Peringatan",
    "Masukkan Nomor HP"
    );

    return;

}

if(password === ""){

    showAlert(
    "Peringatan",
    "Masukkan Sandi"
    );

    return;

}

let data =
localStorage.getItem(phone);

if(!data){

    showAlert(
    "Login Gagal",
    "Akun belum terdaftar"
    );

    return;

}

let user =
JSON.parse(data);

if(user.password === password){

    localStorage.setItem(
    "isLogin",
    "true"
    );

    localStorage.setItem(
    "currentUser",
    phone
    );

    sessionStorage.setItem("fromLogin", "true");

    showLoading();

    setTimeout(()=>{

        window.location.href =
        "dashboard.html";

    },4000);

}else{

    showAlert(
    "Login Gagal",
    "Sandi yang Anda masukkan salah"
    );

}

}
