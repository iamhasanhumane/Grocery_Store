export default{
    template: `<div class="p-2" style="border: 1px solid #ddd; padding: 10px ; margin: 10px; background-color: #f2f2f2;">
    <h4> {{ category.category_name}} </h4>
    <div>Owner: {{ category.creator }} </div> 
    <br>
    
    <h6>List of Products under this Category: </h6>
    <br>

    <div v-for="product in products"> 
        <h6>{{ product.product_name }}  &nbsp 
            Availabe Quantity - {{product.quantity}} {{product.unit}}  &nbsp; &nbsp;
            Price : {{product.price}} /- per  {{product.unit}}
            <div style="text-align: right;">
              <button v-if="product.quantity" class="btn btn-primary" @click="buy(product.id)">Buy</button>
              <span v-else style="color: red;">Not Available!</span> 
            </div>  
            <div > 
                
            </div>
            
        </h6>  
    </div>  

    </div>`,
    props: ['category'],
    data(){
        return {
            products: [],
            error: null,
            token: localStorage.getItem('auth-token'),
        }
    },
    methods: {
        buy(id){
          this.$router.push({ name: 'buy-form', params: { categoryId: this.category.id, productId: id } })
        }
    },
    async mounted(){
        const res = await fetch(`/api/products/${this.category.id}`,{  
            headers: {
                "Authentication-Token": this.token, 
            }
        }) 
        const data = await res.json()
        if (res.ok){
            this.products = data 
        }
        else{
            this.error = data.message;
            console.log(data.message); 
        }
    },

}