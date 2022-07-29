// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut  } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { getDatabase, ref, onValue, push, set, update } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const dots_vertical = document.querySelector(".dots-vertical");
const pop_up_menu = document.querySelector(".pop-up-menu");
const pop_up_menu_items = document.querySelectorAll(".pop-up-menu-item");
const add_category = document.querySelector("#add_category");
const add = document.querySelector("#add");
const view = document.querySelector("#view");
const content = document.querySelector("#content");
const add_categories = document.querySelector("#add_categories");
const view_categories = document.querySelector("#view_categories");
const queries = document.querySelector("#queries");
const search_button = document.querySelector("#search_button");
const search_text = document.querySelector("#search_text");
const save = document.querySelector("#save");
const save_category = document.querySelector("#save_category");
const category_name = document.querySelector("#category_name");
const category_tbody = document.querySelector("#category_tbody");
const all_checkboxes = document.querySelector("#all_checkboxes");
const delete_category = document.querySelector("#delete_category");
const select_all_qna = document.querySelector("#select_all_qna");
const delete_qna = document.querySelector("#delete_qna");
let editor1, editor2;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        getCategories(uid);
        getQueries(uid);
        getQna(uid);

        view_categories.addEventListener("change",function(e){
            content.innerHTML = `<h1 class="text-2xl font-semibold text-center mt-10">Loading...</h1>
                    <p class="mt-5 text-gray-600 text-center">In case nothing loads, please check your internet connection and then Reload this page again.</p>`;
            if(view_categories.value === "All"){
                getQna(uid);
            }else{
                onValue(ref(db, 'questions_answers/qna/'+view_categories.value), (snapshot) => {
                    content.innerHTML = "";
                    const data = snapshot.val();
                    showData(data);
                });
            }            
        });

        search_button.addEventListener("click",function(e){
            if(search_text.value !== ""){
                window.find(search_text.value);
                if(!queries.innerText.includes(search_text.value)){
                    push(ref(db, 'questions_answers/queries'), {
                        text: search_text.value
                    });
                }
            }
        });

        save_category.addEventListener("click",function(e){
            set(ref(db, 'questions_answers/categories/'+category_name.value),{
                category: category_name.value,
            }).then(()=>{
                alert("Data saved successfully..");
                category_name.value = "";
            });
        });

        save.addEventListener("click",function(e){
            if(add_categories.value === ""){
                alert("Please provide a Category");
                return;
            }
            push(ref(db, 'questions_answers/qna/'+add_categories.value),{
                question: editor1.getData(),
                answer: editor2.getData(),
                category: add_categories.value,
            }).then(()=>{
                alert("Data saved successfully..");
                editor1.setData('');                
                editor2.setData('');                
            });
        });
    } else {
        // User is signed out
        window.open("index.html","_self");
    }
});

function getCategories(userId){
    onValue(ref(db, 'questions_answers/categories'), (snapshot) => {
        add_categories.innerHTML = "";
        category_tbody.innerHTML = "";
        let updates = {};
        const data = snapshot.val();
        for(let d in data){
            add_categories.innerHTML += `<option>${data[d].category}</option>`;
            category_tbody.innerHTML += `
                <tr class="hover:bg-gray-100">
                    <td class="p-2">${data[d].category}</td>
                    <td class="p-2 text-right"><input type="checkbox" class="checkbox" data-key="${d}"></td>
                </tr>
            `;
        }
        all_checkboxes.addEventListener("click",function(e){
            if(all_checkboxes.checked){
                document.querySelectorAll(".checkbox").forEach(checkbox=>{
                    checkbox.checked = true;
                    updates['questions_answers/categories/'+checkbox.dataset.key] = null;
                });
            }else{
                document.querySelectorAll(".checkbox").forEach(checkbox=>{
                    checkbox.checked = false;
                });
                updates = {};
            }
        });
        document.querySelectorAll(".checkbox").forEach(checkbox=>{
            checkbox.addEventListener("click",function(e){
                all_checkboxes.checked = false;
                if(checkbox.checked){
                    updates['questions_answers/categories/'+checkbox.dataset.key] = null;
                }else{
                    delete updates['questions_answers/categories/'+checkbox.dataset.key];
                }
            });
        });
        delete_category.addEventListener("click",function(e){
            if(confirm("Do you want to delete this?")){
                update(ref(db), updates).then(()=>{
                    all_checkboxes.checked = false;
                    updates = {};
                });
            }
        });
    });
}

function getQueries(userId){
    onValue(ref(db, 'questions_answers/queries'), (snapshot) => {
        queries.innerHTML = "";
        const data = snapshot.val();
        for(let key in data){
            onValue(ref(db, 'questions_answers/queries/'+key), (snapshot) => {
                const data = snapshot.val();
                queries.innerHTML += `<option>${data.text}</option>`;
            },{
                onlyOnce: true
            });
        }
    });
}

function getQna(userId){
    content.innerHTML = `<h1 class="text-2xl font-semibold text-center mt-10">Loading...</h1>
                    <p class="mt-5 text-gray-600 text-center">In case nothing loads, please check your internet connection and then Reload this page again.</p>`;
    onValue(ref(db, 'questions_answers/qna'), (snapshot) => {
        view_categories.innerHTML = "<option>All</option>";
        content.innerHTML = "";
        let updates = {};
        const data = snapshot.val();
        for(let key in data){
            view_categories.innerHTML += `<option>${key}</option>`;
            onValue(ref(db, 'questions_answers/qna/'+key), (snapshot) => {
                const data = snapshot.val();
                showData(data, userId, updates);
            },{
                onlyOnce: true
            });
        }
    });
}

function showData(data, uid, updates){
    for(let d in data){
        let contentinnerHTML = `
            <div class="shadow-md p-2 bg-gray-100 border-l-slate-700 border-2 mb-5">
                <div class="flex justify-between mb-5">
                    <input type="checkbox"  data-key="${data[d].category}/${d}" class="p-2 individual_qna" />
                    <div>
                        <button class="font-semibold px-2 rounded-md update_qna" data-key="${d}">Update</button>
                        <button class="font-semibold px-2 rounded-md delete_individual_qna" data-key="${d}">Delete</button>
                    </div>
                </div>
                <div class="flex items-center mb-2">
                    <small class="mr-2"><b>Category:</b></small>
                    <span class="${d}_category">${data[d].category}</span>
                </div>
                <div class="grid grid-flow-row mb-2">
                    <small><b>Question</b></small>
                    <span contenteditable="true" class="${d}_question">${data[d].question}</span>
                </div>
                <div class="grid grid-flow-row">
                    <small><b>Answer</b></small>
                    <span contenteditable="true" class="${d}_answer">${data[d].answer}</span>
                </div>
            </div>
        `;
        content.innerHTML += contentinnerHTML;
        
        select_all_qna.addEventListener("click",function(e){
            if(select_all_qna.checked){
                document.querySelectorAll(".individual_qna").forEach(checkbox=>{
                    checkbox.checked = true;
                    updates['questions_answers/qna/'+checkbox.dataset.key] = null;
                    console.log(updates);
                });
            }else{
                document.querySelectorAll(".individual_qna").forEach(checkbox=>{
                    checkbox.checked = false;
                });
                updates = {};
            }
        });
        document.querySelectorAll(".individual_qna").forEach(checkbox=>{
            checkbox.addEventListener("click",function(e){
                select_all_qna.checked = false;
                if(checkbox.checked){
                    updates['questions_answers/qna/'+checkbox.dataset.key] = null;
                    console.log(updates);
                }else{
                    delete updates['questions_answers/qna/'+checkbox.dataset.key];
                    console.log(updates);
                }
            });
        });
        delete_qna.addEventListener("click",function(e){
            if(confirm("Do you want to delete this?")){
                update(ref(db), updates).then(()=>{
                    select_all_qna.checked = false;
                    updates = {};
                });
            }
        });        
        document.querySelectorAll(".update_qna").forEach(updateBtn=>{
            updateBtn.addEventListener("click",function(e){
                if(confirm("Do you want to update this?")){
                    let key = updateBtn.dataset.key;
                    let question = document.querySelector("."+key+"_question").innerText;
                    let answer = document.querySelector("."+key+"_answer").innerText;
                    let category = document.querySelector("."+key+"_category").innerText;
                    update(ref(db, 'questions_answers/qna/'+category+'/'+key),{
                        question: question,
                        answer: answer,
                        category: category,
                    }).then(()=>{
                        alert("Data updated successfully..");
                    });
                }
            });
        });        
        document.querySelectorAll(".delete_individual_qna").forEach(deleteBtn=>{
            deleteBtn.addEventListener("click",function(e){
                if(confirm("Do you want to delete this?")){
                    let key = deleteBtn.dataset.key;
                    let category = document.querySelector("."+key+"_category").innerText;
                    let itemToDelete = {};
                    itemToDelete['questions_answers/qna/'+category+'/'+key] = null;
                    update(ref(db), itemToDelete).then(()=>{
                        itemToDelete = {};
                    });
                }
            });
        });
    }
}

ClassicEditor
.create( document.querySelector('#editor1') )
.then(e=>{
    editor1 = e;
})
.catch( error => {
});

ClassicEditor
.create( document.querySelector('#editor2') )
.then(e=>{
    editor2 = e;
})
.catch( error => {
});

view.setAttribute('hidden', true);
add_category.setAttribute('hidden', true);

pop_up_menu.setAttribute('hidden',true);

dots_vertical.addEventListener("click",function(e){
    pop_up_menu.toggleAttribute('hidden');
});

pop_up_menu_items.forEach(function(pop_up_menu_item){ 
    pop_up_menu_item.addEventListener("click",function(e){
        pop_up_menu.toggleAttribute('hidden');
        if(e.currentTarget.dataset.section === "signout"){
            if(confirm("Do you want to sign out?")){
                signOut(auth).then(() => {
                    // Sign-out successful.
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    alert(errorMessage);
                });
            }
            return;
        }
        if(e.currentTarget.dataset.section !== "close"){
            add_category.setAttribute('hidden',true);
            add.setAttribute('hidden',true);
            view.setAttribute('hidden',true);
            document.querySelector("#"+e.currentTarget.dataset.section).removeAttribute('hidden');
        }
    });
});