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

function goRegister(){

    document
    .getElementById("miniLoader")
    .classList.add("active");

    setTimeout(()=>{

        window.location.href =
        "register.html";

    },3000);

}

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

        showLoading();

        setTimeout(()=>{

            window.location.href =
            "dashboard.html";

        },5000);

    }else{

        showAlert(
        "Login Gagal",
        "Sandi yang Anda masukkan salah"
        );

    }

}
