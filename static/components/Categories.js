export default {
    template: `<div>
    <div v-if="error"> {{error}}</div>
    <div v-for="category in allCategories">
    {{category.category_name}} <br>
    {{category.creator}} 
    <button class="btn btn-primary" v-if='!category.is_approved' @click="approve(category.id)"> Approve </button></div>
    </div>`,
    data() {
      return {
        allCategories: [],
        token: localStorage.getItem('auth-token'),
        error: null, 
      }
    },
    methods: {
      async approve(istId) {
        const res = await fetch(`/activate/category/${istId}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
          this.$router.go(0);
        }
      },
    },
    async mounted(){
      const res = await fetch('/categories',{
        headers: {
          "Authentication-Token": this.token,
        }
      })
      const data = await res.json().catch((e) => {})
      if (res.ok){
        this.allCategories = data 
       } 
       else{
        this.error = res.status
       }
    }
    
  }