export default{
    template: `<div>
    
    <h2>New Delete Requests : </h2>

    <br>
    <div v-for="request in requests"> 
       <h4>{{request.category_name}}</h4>
       <button type="button" v-if="!request.is_deleted" class="btn btn-danger" @click="delete_(request.category_id)">Delete</button> 
    </div>

    <br>
    <h4 v-if="error"> {{ error }}</h4> 
    
    </div>`,
    data(){ 
        return {
            requests: [],
            error: null ,
        }   
    },
    methods: {
        async delete_(cat_id){ 
          alert(cat_id) ;
          const res = await fetch(`/apply-delete/${cat_id}`,{ 
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'), 
            }
          }) 
          const data = res.json() 
          if (res.ok){
            alert("Deleted Successfully");   
            this.$router.go(0);
          }
          else{
            alert(data.message); 
          }

        }

    },
    async mounted(){
        const res = await fetch('/category-deletes',{ 
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'),
            }
        })
        const data = await res.json()
        if (res.ok){
            this.requests = data;
        }
        else{
            this.error = data.message; 
        }
    }
}