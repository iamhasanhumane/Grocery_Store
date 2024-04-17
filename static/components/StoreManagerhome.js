import Category from "./Category.js"; 

export default{
    template: `<div>
    <h1 align="center">Welcome Store Manager</h1>
    <br>
    <br> 
    <div v-if="categories.length>0">
         <h1> Categories: </h1>
         <Category v-for="(category,index) in categories" :key="index"  :category = "category"/>
         <br>
    </div>  

    <br>
    <br>
    <div v-if="showCategoryForm">
    <form @submit.prevent="addCategory"> 
       <label for="category">Category Name: </label>
       <input  id="category" v-model="resource.category_name" placeholder = "Enter Category Name" required>
       <br><br>
       <button type="submit" class="btn btn-primary">Add Category</button>
    </form> 
    </div>
    <br>
    <br> 
    <div v-if="error">{{error}}</div> 

    <div v-if="message">{{message}}</div> 
    <br>
    <div style="position:static ; bottom: 0px; left: 100px">
       <button class="btn btn-primary" @click="showAddCategoryForm" >Add-Category</button>
    </div>

    <div v-if="categories.length>0" align="center">
        <button class="btn btn-success" @click="download">Export CSV</button>
    </div>

    </div>
    
    `,
    data(){
        return {
            categories: [], // list of categories created by user
            error: null,  
            message: null,
            token: localStorage.getItem('auth-token'),
            showCategoryForm: false, 
            resource : {category_name: ''}, 
            isWaiting: false, 
        }; 
    },
    components: {
        Category,
    },
    methods: {
        showAddCategoryForm(){
            alert('clicked');
            this.showCategoryForm = true;
            console.log(this.showCategoryForm);
        },
        async addCategory(){
            // pass
            // 
            alert('clicked'); 
            console.log(this.resource.category_name) 
            const res = await fetch('/api/categories',{
                method: 'POST',
                headers: {
                    "Authentication-Token": this.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.resource),
            }) 
            const data = await res.json().catch((e) => {})
            if (res.ok){
               console.log(data.message); 
               // this.$router.go(0); 
            }
            else{
                alert(data.message); 
                console.log(data.message);
            }
            this.showCategoryForm = false;
            this.resource.category_name = '';  
            this.error = null,
            this.message = data.message;
        },
        async download(){ 
            this.isWaiting = true; 
            const res = await fetch('/download-csv',{
                headers: {
                    "Authentication-Token": localStorage.getItem('auth-token'),
                }
            })
            const data = await res.json() 
            if (res.ok){
                const taskId = data["task_id"];     
                const intv = setInterval(async () =>{
                    const csv_res = await fetch(`/get-csv/${taskId}`)
                    if (csv_res.ok){
                        this.isWaiting = false;
                        clearInterval(intv) ; 
                        window.location.href = `/get-csv/${taskId}`  
                    }
                }, 1000)      
            } 
        }
    }, 
    async mounted(){
        console.log(this.token);
        const res = await fetch('/api/categories',{  
          headers: {
            "Authentication-Token": this.token, 
          }
        })
        const data = await res.json().catch((e) => {}) 
        if (res.ok){
          this.categories = data  
         } 
         else{
          this.error = data.message;
          console.log(data.message); 
         } 
      },   
}   

