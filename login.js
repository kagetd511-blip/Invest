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

        showAlert(
        "Berhasil",
        "Login berhasil"
        );

        setTimeout(() => {

            window.location.href =
            "dashboard.html";

        }, 1000);

    }else{

        showAlert(
        "Login Gagal",
        "Sandi yang Anda masukkan salah"
        );

    }

}
