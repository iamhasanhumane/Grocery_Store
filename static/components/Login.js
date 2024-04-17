export default {
    template: `
  <div class='d-flex justify-content-center' style="margin-top: 25vh">
    <div class="mb-3 p-5 bg-light">
        <div class='text-danger'>{{error}}</div>
        <label for="user-email" class="form-label">Email address</label>
        <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
        <label for="user-password" class="form-label">Password</label>
        <input type="password" class="form-control" id="user-password" v-model="cred.password">
        <button class="btn btn-primary mt-2" @click='login' > Login </button>
        <hr>
        <div>New User?</div>
        <button class="btn btn-primary mt-2" @click='signup'> Sign Up</button> 
    </div> 

  </div>
  `,
    data(){
        return{
            cred: {
                email: null,
                password: null,
            },
            error: null,
        }
    },
    methods: {
        signup(){
            this.$router.push('/signup');  
           }, 
        async login(){
            const res = await fetch('/user-login',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(this.cred),   // sending the credentials as json object to the backend
            })
            const data = await res.json() ;  // res is getting from the backend as json object
            if (res.ok){    
                localStorage.setItem('auth-token',data.token) ;
                localStorage.setItem('role',data.role) ;
                this.$router.push({path: '/'}); 
            }
            else{
                this.error = data.message;  
            }
        }, 
    },
}


