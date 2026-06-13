function login(){

let phone =
document.getElementById("phone").value.trim();

let password =
document.getElementById("password").value;

if(phone === ""){

    alert(
    "Masukkan Nomor HP"
    );

    return;

}

if(password === ""){

    alert(
    "Masukkan Sandi"
    );

    return;

}

let data =
localStorage.getItem(phone);

if(!data){

    alert(
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

    alert(
    "Login berhasil"
    );

    window.location.href =
    "dashboard.html";

}else{

    alert(
    "Sandi salah"
    );

}

}
