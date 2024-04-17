export default{
    template: `<div class="p-2" style="border: 1px solid #ddd; padding: 10px ; margin: 10px;">
    <h4> {{ category.category_name}} </h4>
    <div>Creator: {{ category.creator }} </div> 
    <br>
    <div v-if="error">{{error}}</div> 

    <div>
    <div v-for="product in products"> 
    <h6>{{ product.product_name }}  &nbsp 
        Quantity present {{product.quantity}} 
        {{product.unit}} {{product.price}} /- per unit    
    <div align="right"> 
        <button class="btn btn-warning" @click="edit_product(product.product_name)">Edit Product</button>
        <button class="btn btn-danger" @click="delete_product(product.product_name)">Delete Product</button>
    </div>
    </h6>
    
    
    </div> 

    </div>

    <div align="center">
     <button @click="addproduct" class="btn btn-primary" style="border-radius: 50%;">+</button>
    </div>

    
    <br>
    <button class="btn btn-warning" @click="showform">Edit</button> 
    <button class="btn btn-danger" @click="delete_category">Delete</button> 

    <br>
    <div v-if="showForm"> 
    <form @submit.prevent="edit_category"> 
       <label for="category">Category Name: </label>
       <input  id="category" v-model="resource.category_name" placeholder = "Enter Category Name" required>
       <br><br>
       <button type="submit" class="btn btn-primary">Edit Category</button>
    </form> 
    </div>
    
    </div>`,
    props: ['category'],
    data(){
        return {
            products: [],
            token: localStorage.getItem('auth-token'),
            error: null,  
            showForm: false,
            resource : {category_name: null,},
        }

    },
    methods: {
        async addproduct(){
            this.$router.push(`/create-product/${this.category.id}`);  
        }, 
        async showform(){
            this.showForm = true;
        },
        async edit_category(){
            alert('cliked category');
            const res = await fetch(`/edit-category/${this.category.id}`,{
                method: 'POST', 
                headers: {
                    "Authentication-Token": this.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.resource) , 
            })
            const data = await res.json()
            if (res.ok){
                alert(data.message);
                this.showForm = false;
            } else {
                alert(data.message);
            }
        },
        async delete_category(){
            alert(this.category.id);   
            const res = await fetch(`/delete-category/${this.category.id}`,{ 
                headers: {
                    "Authentication-Token": this.token,
                }
            })
            const data = await res.json()
            if (res.ok){
                alert(data.message)
                this.$router.go(0);
            }
            else{ 
                alert(data.message);   
            } 

        },
        async edit_product(product_name){
            this.$router.push(`/edit-product/${product_name}/${this.category.id}`) ;   
        }, 
        async delete_product(product_name){
            alert('clicked delete') 
            const res = await fetch(`/api/products/${product_name}`,{
                headers: {
                    "Authentication-Token": this.token,
                },
                method: 'DELETE'
            }) 
            const data = await res.json()
            if (res.ok){
                alert(data.message);
                this.$router.go(0);
            } else{
                alert(data.message);
            }

        }

    },
    async mounted(){
        console.log(this.token);
        const res = await fetch(`/products/${this.category.id}`,{
            headers: {
                "Authentication-Token": this.token, 
            }
        })
        const data = await res.json()
        if (res.ok){
            this.products = data 
            console.log(data); 
        }
        else{
            this.error = data.message;
            alert(data.message);
            console.log(data.message);
        }
    },

}