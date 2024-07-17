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
                if(data[i].password == obj.password){
                    window.alert("Login successful");
                }else{
                    window.alert("Incorrect password")
                }
                flag = true;
                break;
            }
        }
        if(!flag){
            window.alert("email doesn't exist");
        }
    }
    catch(error){
        console.log("error: ", error);
    }
}
