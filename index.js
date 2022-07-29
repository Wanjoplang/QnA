// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const dots_vertical = document.querySelector(".dots-vertical");
const pop_up_menu = document.querySelector(".pop-up-menu");
const pop_up_menu_items = document.querySelectorAll(".pop-up-menu-item");
const signin = document.querySelector("#signin");
const signup = document.querySelector("#signup");
const login = document.querySelector("#login");
const register = document.querySelector("#register");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const email1 = document.querySelector("#email1");
const password1 = document.querySelector("#password1");
const confirm_password = document.querySelector("#confirm_password");

onAuthStateChanged(auth, (user)=>{
    if(user){
        window.open("qna.html","_self");
    }else{
        signin.removeAttribute('hidden');

        login.addEventListener("click",function(e){
            if(email.value === "" || password.value === ""){
                alert("Please enter Email id and Password");
                return;
            }
            signIn(auth, email.value, password.value);
        });

        register.addEventListener("click",function(e){
            if(email1.value !== confirm_password.value){
                alert("Password did not match");
                return;
            }
            if(email1.value === "" || password1.value === "" || confirm_password.value === ""){
                alert("Please enter Email id and Password and confirm your password");
                return;
            }
            signUp(auth, email1.value, password1.value);
        });
    }
});

function signUp(auth, email, password){
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // User created 
        const user = userCredential.user;
        console.log("User Created");
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        alert(errorMessage);
    });
}

function signIn(auth, email, password){
    console.log(auth, email, password);
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("User Signed In");
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        alert("User is not registered. Please Sign up to proceed.");    
    });
}

signin.setAttribute('hidden', true);
signup.setAttribute('hidden', true);

pop_up_menu.setAttribute('hidden',true);

dots_vertical.addEventListener("click",function(e){
    pop_up_menu.toggleAttribute('hidden');
});

pop_up_menu_items.forEach(function(pop_up_menu_item){ 
    pop_up_menu_item.addEventListener("click",function(e){
        pop_up_menu.toggleAttribute('hidden');
        signin.setAttribute('hidden',true);
        signup.setAttribute('hidden',true);
        document.querySelector("#"+e.currentTarget.dataset.section).removeAttribute('hidden');
    });
});

email.addEventListener("keydown",function(e){
    if(email.value !== "" && password.value !== ""){
        login.classList.remove("bg-gray-400");
        login.classList.remove("cursor-not-allowed");
        login.classList.add("bg-blue-400");
        login.classList.add("cursor-pointer");
        login.removeAttribute("disabled");
    }else{
        login.classList.add("bg-gray-400");
        login.classList.add("cursor-not-allowed");
        login.classList.remove("bg-blue-400");
        login.classList.remove("cursor-pointer");
        login.setAttribute("disabled",true);
    }
});

password.addEventListener("keydown",function(e){
    if(email.value !== "" && password.value !== ""){
        login.classList.remove("bg-gray-400");
        login.classList.remove("cursor-not-allowed");
        login.classList.add("bg-blue-400");
        login.classList.add("cursor-pointer");
        login.removeAttribute("disabled");
    }else{
        login.classList.add("bg-gray-400");
        login.classList.add("cursor-not-allowed");
        login.classList.remove("bg-blue-400");
        login.classList.remove("cursor-pointer");
        login.setAttribute("disabled",true);
    }
});