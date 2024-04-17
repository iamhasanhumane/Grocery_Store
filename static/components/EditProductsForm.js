export default{
    template: `<div>
    <label for="product"> Name of the Product: </label> &nbsp &nbsp
    <input type="text" placeholder="product name" id="product" v-model="product.product_name"/>
    <br>
    <br>
    <label for="unit"> Unit: </label> &nbsp &nbsp
    <input type="text" placeholder="Kg/Lit/Dozens/Grams" id="unit" v-model="product.unit"/>
    <br>
    <br>
    <label for="price"> Price : </label> &nbsp &nbsp
    <input type="number" placeholder="Price $" id="price" v-model="product.price"/>
    <br>
    <br>
    <label for="quantity"> Quantity : </label> &nbsp &nbsp
    <input type="number" placeholder="Quantity" id="quantity" v-model="product.quantity"/>

    <br><br>
    <button class="btn btn-primary" @click="editProduct">Update Product</button>  
    
    </div>`,
    props: ["p_name", "c_id"],  
    data(){
        return {
            product :{
                product_name: null,
                unit: null,
                price: null,
                quantity: null,
                category_id: this.c_id,
            },
            token: localStorage.getItem('auth-token'), 
        }   
    }, 
    methods: {
        async editProduct(){   
            console.log(this.product);
            console.log(this.p_name); 
            console.log(this.c_id);
            const res = await fetch(`/api/products/${this.p_name}/${this.c_id}`,{    
                method: 'PUT',
                headers: {
                    "Authentication-Token": this.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.product) ,
            })

            const data = await res.json()
            if (res.ok){
                alert(data.message) 
                this.$router.go(-1);
            } 
        },
    } 
}