import Userhome from "./Userhome.js" 
import StoreManagerhome from "./StoreManagerhome.js"
import Adminhome from "./Adminhome.js" 


export default {
    template : `<div>
    <Userhome v-if="userRole=='user' "/>
    <Adminhome v-if="userRole=='admin'  "/>
    <StoreManagerhome v-if="userRole=='store_manager' "/>  
    </div>`,

    data(){
        return {
            userRole: localStorage.getItem('role'),
            resources: [],
            token: localStorage.getItem('auth-token'),
        }
    },

    components: {
        Userhome, 
        StoreManagerhome, 
        Adminhome,
    },
}