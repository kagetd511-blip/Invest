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

function togglePassword(){

    let password =
    document.getElementById("password");

    if(password.type === "password"){

        password.type = "text";

    }else{

        password.type = "password";

    }

}

function toggleConfirmPassword(){

    let confirmPassword =
    document.getElementById(
    "confirmPassword"
    );

    if(confirmPassword.type === "password"){

        confirmPassword.type = "text";

    }else{

        confirmPassword.type = "password";

    }

}

function register(){

    let username =
    document.getElementById("username")
    .value.trim();

    let phone =
    document.getElementById("phone")
    .value.trim();

    let email =
    document.getElementById("email")
    .value.trim();

    let password =
    document.getElementById("password")
    .value;

    let confirmPassword =
    document.getElementById(
    "confirmPassword"
    ).value;

    let referral =
    document.getElementById("referral")
    .value.trim();

    if(username === ""){

        showAlert(
        "Peringatan",
        "Username wajib diisi"
        );

        return;

    }

    if(phone === ""){

        showAlert(
        "Peringatan",
        "Nomor HP wajib diisi"
        );

        return;

    }

    if(password === ""){

        showAlert(
        "Peringatan",
        "Sandi wajib diisi"
        );

        return;

    }

    if(confirmPassword === ""){

        showAlert(
        "Peringatan",
        "Ulangi sandi wajib diisi"
        );

        return;

    }

    if(password !== confirmPassword){

        showAlert(
        "Peringatan",
        "Ulangi sandi tidak cocok"
        );

        return;

    }

    if(localStorage.getItem(phone)){

        showAlert(
        "Pendaftaran Gagal",
        "Nomor HP sudah terdaftar"
        );

        return;

    }

    let userData = {

        username: username,

        phone: phone,

        email: email,

        password: password,

        referral: referral,

        saldo: 0,

        level: "Member",

        registerDate:
        new Date().toLocaleDateString("id-ID")

    };

    localStorage.setItem(
        phone,
        JSON.stringify(userData)
    );

    function showLoading(title,text){

    document
    .getElementById("loadingTitle")
    .innerText = title;

    document
    .getElementById("loadingText")
    .innerText = text;

    document
    .getElementById("loadingScreen")
    .classList.add("active");

}

    showLoading(
"Pendaftaran Berhasil",
"Mengalihkan ke halaman login..."
);

setTimeout(() => {

    window.location.href =
    "index.html";

},2500);

}
