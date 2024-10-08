const socket = io();

const output = document.querySelector(".output");
const textbox = document.getElementById("message");
const user = document.getElementById("user");
const sendB = document.getElementById("send");

document.addEventListener('DOMContentLoaded', ()=>{
    output.scrollTop = output.scrollHeight;
})

sendB.addEventListener("click", ()=>{
    if(textbox.value == "") {
        alert("Inserte un mensaje");
    } else {
        socket.emit("mensaje", {
            message: textbox.value,
            user: user.value,
            userid: userid.value
        });
        textbox.value = "";
        textbox.focus();
        output.scrollTop = output.scrollHeight;
    }
})

socket.on("mensaje", (data)=>{
    output.innerHTML += `<p><strong>${data.user}:</strong> ${data.message}</p>`
})