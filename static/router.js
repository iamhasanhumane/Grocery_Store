import Home from "./components/Home.js"
import Login from "./components/Login.js"
import Signup from "./components/Signup.js" 
import Users from "./components/Users.js"
import Managers from "./components/Managers.js" 
import Categories from "./components/Categories.js" 
import ProductsForm from "./components/ProductsForm.js" 
import EditProductsForm from "./components/EditProductsForm.js"
import EditCategory from "./components/EditCategory.js" 
import DeleteCategory from "./components/DeleteCategory.js" 
import BuyForm from "./components/BuyForm.js"
import Cart from "./components/Cart.js" 
import ReviewForm from "./components/ReviewForm.js" 
import Order from "./components/Order.js" 

const routes = [
    {path:'/' , component: Home} ,
    {path:'/login' , component: Login , name : 'Login'}, 
    {path:'/signup', component: Signup , name: 'Signup'},  
    {path: '/users' , component: Users},  
    {path: '/managers' , component: Managers},  
    {path: '/categories' , component: Categories},
    {path: '/create-product/:c_id',props: true,component: ProductsForm},
    {path: '/edit-product/:p_name/:c_id',props: true,component: EditProductsForm} ,
    {path: '/categorie-edit' , component: EditCategory}, 
    {path: '/categorie-delete' , component: DeleteCategory} , 
    {path: '/buy/:categoryId/:productId', component: BuyForm, name: 'buy-form' },
    {path: "/cart-view", component: Cart , name: 'cart'} ,
    {path: '/review/:cartId/:productId', component: ReviewForm, name: 'review-form' }, 
    {path: "/order-view", component: Order , name: 'order'}  
]


export default new VueRouter({
    routes,
})

