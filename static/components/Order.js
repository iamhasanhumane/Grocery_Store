export default{
    template: `<div>
      
    <h1 align="center">Orders </h1>

    <div v-if="error" style="text-color: red;">{{error}}</div>

    <div v-for="(order, index) in orders" :key="index">
            <h3>Order ID: {{ order.order_id }}</h3>
            <p>Order Date: {{ order.order_date }}</p>
            <p>Total Amount: {{ order.total_amount }}</p>

            <ul>
                <li v-for="(item, itemIndex) in order.order_items" :key="itemIndex">
                    {{ item.product_name }} - Quantity: {{ item.quantity }} - Price: {{ item.price }}
                </li>
            </ul>
        </div>
         
    
    </div>`,
    data(){
        return {
            orders: [],
            error: null
        }
    },
    async mounted(){
        const res = await fetch('/orders',{
            headers: {
                "Authentication-Token": localStorage.getItem('auth-token'),
            }
        })
        const data = await res.json()
        if (res.ok){
            this.orders = data ; 
        }
        else{
            alert('You have not placed any orders!');
            this.error = data.message;
        }
    }
}