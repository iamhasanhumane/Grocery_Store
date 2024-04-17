export default{
    template: `<div>
    
    <h1 align="center">My Cart View </h1>
    <br>
    <br>
    <div v-if="error">{{error}}</div>
    <div v-if="cart.length > 0" style="display: flex; justify-content: center; ">
    <table v-if="cart.length > 0" border="1">
      <thead >
        <tr>
          <th style="border: 1px solid ;padding: 8px;text-align: center;">Product Name</th>
          <th style="border: 1px solid ;padding: 8px;text-align: center;">Product Price</th>
          <th style="border: 1px solid ;padding: 8px;text-align: center;">Quantity</th>
          <th style="border: 1px solid ;padding: 8px;text-align: center;">Total</th> 
          <th style="border: 1px solid ;padding: 8px;text-align: center;">Actions</th> 
        </tr> 
      </thead> 
      <tbody>
        <tr v-for="(item, index) in cart" :key="index">
          <td>{{ item.product_name }}</td>
          <td>{{ item.product_price }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ formatCurrency(item.total) }}</td> 
          <td>
            <button class="btn btn-danger" @click="remove(item.id)">Remove</button> 
            <button class="btn btn-info" @click="review(item.id,item.product_id)">Review</button>  
          </td> 
        </tr>
      </tbody>
    </table>
    </div> 

    <div v-if="cart.length > 0" style="text-align: center; margin-top: 20px;">
      <strong>Total Amount: {{ calculateTotalAmount() }}</strong>
    </div> 
    <br>
    <br>
    <div style="text-align: center;" v-if="cart.length > 0"> 
      <button class="btn btn-success" @click="place_order">Place the Order</button> 
    </div>

    <div v-if="showOrderConfirmation" style=" position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);text-align: center;background-color: #ffffff;padding: 20px;border: 1px solid #dddddd;box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);z-index: 1000;">
        <img src="static/components/download.png" alt="Order Placed Logo"> 
        <p>Order placed successfully!</p>  
    </div>  
    
    </div>`,
    data(){
        return {
            cart: [],
            error: null, 
            showOrderConfirmation: false,
        }
    },
    methods: {
        formatCurrency(value) {
          return Number(value).toLocaleString('en-US', {
            style: 'currency',
            currency: 'INR', 
          });
        },
        calculateTotalAmount() {
            return this.formatCurrency(
              this.cart.reduce((total, item) => total + item.total, 0)
            );
        },
        async place_order(){
            const res = await fetch('/place-order', {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('auth-token'),
                }, 
                body: JSON.stringify({ cart: this.cart }),
            });  
            const data = await res.json();
            if (res.ok){
                alert(data.message);
                this.cart = []; 
                this.showOrderConfirmation = true;
                setTimeout(() => { this.$router.push('/order-view') }, 5000);       
            } 
            else{
                alert(data.message);
            }
        },
        async review(id , product_id){ 
            alert(product_id);  
            this.$router.push({name: 'review-form', params: {cartId: id, productId: product_id}})    
        },
        async remove(id){  
            alert('remove'); 
            alert(id);
            const res = await fetch(`/delete-cart/${id}`,{
                headers: {
                    "Authentication-Token": localStorage.getItem('auth-token')
                }
            })
            const data = await res.json()
            if (res.ok){
                alert(data.message);
                this.$router.go(0);
            }
            else{  
                alert('something went wrong');
            }
        }
    },  
    async mounted(){
        const res = await fetch('/api/cart',{
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token') 
            }
        }) 
        const data = await res.json()
        if (res.ok){
            this.cart = data
        }
        else{
            this.error = data.message;
            alert('You have not added any product in the cart'); 
        }
    } 
}