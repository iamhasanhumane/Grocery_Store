export default{
    template: `<div>
    
    <h2>New Edit Requests : </h2>

    <br>
    <div v-for="request in requests"> 
       <h4>{{request.category_name}}</h4>
       <button type="button" v-if="!request.is_edited" class="btn btn-info" @click="edit(request.category_id)">Edit</button> 
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
        async edit(cat_id){
          alert(cat_id) ;
          const res = await fetch(`/apply-edit/${cat_id}`,{ 
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'), 
            }
          }) 
          const data = res.json() 
          if (res.ok){
            alert("Edited Successfully");  
            this.$router.go(0);
          }
          else{
            alert(data.message); 
          }

        }

    },
    async mounted(){
        const res = await fetch('/category-edits',{ 
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