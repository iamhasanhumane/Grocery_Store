export default{
    template: `<div class='d-flex justify-content-center' style="margin-top: 25vh">
    <div class="mb-3 p-5 bg-light">
        <div class='text-danger'>{{error}}</div> 
        <label for="username" class="form-label">Username</label>
        <input type="text" class="form-control" id="username" placeholder="username" v-model="cred.username">

        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">

        <label for="user-password" class="form-label">Set Password</label> 
        <input type="password" class="form-control" id="user-password" v-model="cred.password">

        <label for="role">Role:</label>
        <select name="role" id="role" v-model="cred.role"  required>  
             <option value="user"> User </option> 
             <option value="store_manager"> Store Manager </option> 
        </select>

        <br>
        <button class="btn btn-primary mt-2" @click='register_user'> Register User</button> 
        
    </div> 

  </div>`,
  data(){
    return{
        cred: {
            username : null,
            email: null,
            password: null,
            role: null,
        },
        error: null,
    }
},
methods: {
    async register_user(){
        const res = await fetch('/user-signup',{
            method: 'POST',
            headers: {
                'Content-Type':'application/json',
            },
            body: JSON.stringify(this.cred),   // sending the credentials as json object to the backend
        })
        const data = await res.json() ;  // res is getting from the backend as json object
        if (res.ok){ 
            console.log(data.message);   
            alert(data.message);
            this.$router.push({path: '/'});  
        }
        else{
            this.error = data.message;
        }
},
},
}  