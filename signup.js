let form = document.querySelector("form");
form.addEventListener("submit", (event)=>{handleFormSubmit(event)});
let obj;
function handleFormSubmit(event){
    event.preventDefault();
    let email = event.target[0].value;
    let password = event.target[1].value;

    //username and password must not be empty
    if(email && password){
        obj = {
            email,
            password
        }
        console.log(obj);
        checkServerData(obj);
    }else{
        window.alert("please fill all details");
    }
}

//check if the username is matching with the server data
async function checkServerData(obj){
    try{
        let response = await fetch(`http://localhost:3000/users`);
        if(!response.ok){
            throw new Error("Network error", response.statusText);
            console.log("hi");
        }
        let data = await response.json();
        console.log(data);
        let flag = false;
        for(let i = 0; i < data.length; i++){
            if(data[i].email == obj.email){
                window.alert("email already exist, please login");
                flag = true;
                break;
            }
        }
        if (!flag) {
            let newUser = {
                email: obj.email,
                password: obj.password,
                tasks: {},
                profile: {}
            };
            await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });
            window.alert("User registered successfully!");
        }
    }
    catch(error){
        console.log("error: ", error);
    }
}






// let formData = document.querySelector("form");
// let handleFormSubmit = (event)=>{
//     event.preventDefault();
//     let random = Math.random().toString();
//     let title = event.target[0].value;
//     let description = event.target[1].value;
//     let priority = event.target[2].value;
//     let status = event.target[3].value;
//     if(title && description && priority && status){
//         let obj = {
//             "id" : random,
//             title,
//             description,
//             priority,
//             status
//         }
//         console.log(obj);
//         fetch("http://localhost:3000/todos",{
//             method : "POST",
//             headers : {
//                 "Content-type" : "application/json"
//             },
//             body : JSON.stringify(obj)
//             //it is represhing after submitting data
//         })
//     }else{
//         window.alert("please fill all the details");
//     }
    
// }
// formData.addEventListener("submit",(event)=>{handleFormSubmit(event)});