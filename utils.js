function sendMessage(type, text){
    let user = localStorage.getItem("currentUser");
    if(!user) return;

    let key = "messages_" + user;

    let messages = JSON.parse(localStorage.getItem(key)) || [];

    messages.push({
        type,
        text,
        time: new Date().toLocaleString("id-ID"),
        read: false
    });

    localStorage.setItem(key, JSON.stringify(messages));
}
