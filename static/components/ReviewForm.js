export default{
    template: `<div>
    
    <div> Review form </div> 

    <h5 align="center">{{cart_obj.product_name}} </h5>

    <br>
    <div style="text-align: center;">

        <label>Price:    &nbsp; &nbsp; {{cart_obj.product_price}} /- </label> 
        <br>
        <br> 
        <label>Available:    &nbsp; &nbsp; {{product_obj.quantity}}  {{product_obj.unit}}</label>  
        <br>
        <br>  
        <label>Quantity: </label>
        <input type="number" v-model="cart_obj.quantity"/> 

        <br>
        <br>
        <label>Total: {{cart_obj.total}}</label>
    </div>  
 
    <br><br> 
    <div align="center">
       <button class="btn btn-primary" v-if="cart_obj.quantity<=product_obj.quantity" @click="add">Modify Cart</button> 
       <div v-else style="color: red;"> Enter the quantity within the Available stock</div> 
       <br><br>
       <button class="btn btn-info" @click="back">Back to Cart</button>
    </div>
    </div>`,
    data(){
        return {
            cart_obj: [],
            product_obj: [],
        }
    },
    methods: {
      async add(){
        alert('click'); 
        const res = await fetch(`/edit-cart/${this.cart_obj.id}`,{ 
            method: 'PUT', 
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quantity: this.cart_obj.quantity, 
                total: this.cart_obj.quantity * this.product_obj.price,  
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
        const cartId = this.$route.params.cartId; 
        const res = await fetch(`/cart/${cartId}`,{ 
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'),
            }
        })
        const data = await res.json()
        if (res.ok){
            this.cart_obj =  data;
        }
        else{
            alert(data.message);  
        }

        const productId = this.$route.params.productId; 
        const response = await fetch(`/product/${productId}`,{   
            headers: { 
                "Authentication-Token": localStorage.getItem('auth-token'), 
            }
        }); 
        const Data = await response.json() 
        if (response.ok){ 
            this.product_obj = Data; 
        }
        else{
            alert(Data.message); 
        }



    }

}