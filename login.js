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
// LOGIN FIX FULL (SERVER)
// ======================

async function login(){

    let phone = document.getElementById("phone").value.trim();
    let password = document.getElementById("password").value;

    if(phone === "" || password === ""){
        showAlert("Peringatan", "Lengkapi data login");
        return;
    }

    showLoading();

    try {

        let res = await fetch("invest-production-dfd6.up.railway.app/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phone,
                password
            })
        });

        let data = await res.json();

        hideLoading();

        if(data.status){

    localStorage.setItem("currentUser", data.user.phone);

    localStorage.setItem(
        data.user.phone,
        JSON.stringify(data.user)
    );

    localStorage.setItem(
        "isLogin",
        "true"
    );

    sessionStorage.setItem(
        "fromLogin",
        "true"
    );

    showLoading();

    setTimeout(()=>{
        window.location.href =
        "dashboard.html";
    },1200);

}
        else {
            showAlert("Login Gagal", "Nomor atau sandi salah");
        }

    } catch(err){
        hideLoading();
        showAlert("Error", "Server tidak merespon");
    }
}
