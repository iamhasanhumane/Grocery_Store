export default {
    template: `<div> 
    <div v-if="error"> No new Managers &nbsp {{error}}</div>
    <div v-for="manager in allManagers">
    {{manager.username}} 
    {{manager.email}}  
    <button class="btn btn-primary" v-if='!manager.active' @click="approve(manager.id)"> Approve </button> 
    </div> 
    </div>`,
    data() {   
      return {
        allManagers: [],
        token: localStorage.getItem('auth-token'), 
        error: null,
      }
    },
    methods: {
      async approve(mgId) {
        const res = await fetch(`/activate/manager/${mgId}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message);
          this.$router.go(0); 
        }
      },
    },
    async mounted(){
      const res = await fetch('/managers',{ 
        headers: {
          "Authentication-Token": this.token,
        }
      })
      const data = await res.json().catch((e) => {})
      if (res.ok){
        this.allManagers = data  
       } 
       else{
        this.error = res.status
       } 
    }
    
  }