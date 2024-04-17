export default{
    template: `<div>
    <h2> Product Form </h2>

    <h5 align="center">{{product.product_name}} - {{category.category_name}}</h5>
    <hr>
    <div align="center">
          <div v-if="product.quantity===0">Out of Stock</div>
          <div v-else>Available: {{product.quantity}}  {{product.unit}}</div>
          <br>
          <br>
          <label for="quantity">Enter the  Quantity: </label> &nbsp &nbsp  
          <input type="text" placeholder="Enter Quantity" id="quantity" v-model="quantity"  :max="product.quantity"  min="1"/>

          <br>
          <br> 
          <label>Price of this Product:   &nbsp &nbsp &nbsp  {{ product.price}} /- </label>
          
          
          <br><br>
          <button class="btn btn-primary" v-if="quantity<=product.quantity" @click="add">Add To Cart</button> 
          <div v-else style="color: red;"> Enter the quantity within the Available stock</div> 
    </div>
          <br><br>
          <div align="center">
           <button align="center" class="btn btn-info" @click="back">Back</button>
          </div> 

    </div>`,
    data(){
        return{
            product: [],
            category: [],
            quantity: null, 
            cart: {},  
        }
    },
    methods: {
        async add(){
            alert('clicked'+this.quantity);
            alert(this.product.price*this.quantity); 
            alert(this.product.id) ;
            const res = await fetch('/api/cart',{
                method: "POST",
                headers: {
                    "Authentication-Token": localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: this.product.id,
                    category_id: this.category.id, 
                    product_name: this.product.product_name,
                    product_price: this.product.price, 
                    category_name: this.category.category_name,
                    quantity: this.quantity,
                    total: this.quantity * this.product.price,
                  }),    
            })
            const data = await res.json()
            if (res.ok){
                alert(data.message);
                this.$router.go(-1); 
            }
        },
        back(){
            this.$router.go(-1);
        }
    },
    async mounted(){
        const categoryId = this.$route.params.categoryId;
        const productId = this.$route.params.productId; 

        const res = await fetch(`/product/${productId}`,{
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'), 
            }
        }); 
        const data = await res.json()
        if (res.ok){
            this.product = data;
        }
        else{
            alert(data.message);
        }

        const response = await fetch(`/category/${categoryId}`,{
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'), 
            }
        })
        const Data = await response.json() 
        if (response.ok){
            this.category = Data;
        }
        else{
            alert(data.message);
        }
    },

}


