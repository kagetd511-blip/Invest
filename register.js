function register(){

let username =
document.getElementById("username")
.value.trim();

let phone =
document.getElementById("phone").value.trim();

let email =
document.getElementById("email").value.trim();

let password =
document.getElementById("password").value;

let confirmPassword =
document.getElementById("confirmPassword").value;

let referral =
document.getElementById("referral").value.trim();

if(username === ""){

alert(
"Username wajib diisi"
);

return;

}

if(phone === ""){

    alert(
    "Nomor HP wajib diisi"
    );

    return;

}

if(password === ""){

    alert(
    "Sandi wajib diisi"
    );

    return;

}

if(password !== confirmPassword){

    alert(
    "Ulangi sandi tidak cocok"
    );

    return;

}

if(localStorage.getItem(phone)){

    alert(
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
    new Date().toLocaleDateString()

};

localStorage.setItem(
    phone,
    JSON.stringify(userData)
);

alert(
"Pendaftaran berhasil"
);

window.location.href =
"index.html";

}
