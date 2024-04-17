import CategoryDisplay from "./CategoryDisplay.js";



export default{
    template: `<div> 

    <h1 align="center">User Dashboard </h1> 
    <div align="right">
    <form @submit.prevent="searchProducts">
        <label for="searchKeyword">Search:</label>
        <input type="text" v-model="searchKeyword" id="searchKeyword">
        <button type="submit">Search</button>
    </form> 
    </div> 

    <div v-if="filteredCategories.length > 0">
         <CategoryDisplay v-for="(category, index) in filteredCategories" :key="index" :category="category" />
         <br>
    </div>

    <div v-else-if="allCategories.length>0">  
         <CategoryDisplay v-for="(category,index) in allCategories" :key="index"  :category = "category"/>
         <br>
         <br>
    </div>
    
    
    <div v-else>
       <p>No categories found.</p>
    </div> 
 
    </div>`,  
    
    data(){
        return {
            allCategories: [],
            error: null,
            searchKeyword: '',  
            filteredCategories: [],
        }
    },
    components: {
        CategoryDisplay, 
    },
    methods: {
        async searchProducts() {
            const res = await fetch('/search-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({
                    keyword: this.searchKeyword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                this.filteredCategories = data;  // Update the filteredCategories array
            } else {
                this.error = data.message;
            }
        },
    }, 
    async mounted(){
        const res = await fetch('/api/categorielist',{  
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'),
            }
        })
        const data = await res.json();

        if (res.ok){
            this.allCategories = data; 
        }
        else{
            this.error = data.message;
        }
    }

}


