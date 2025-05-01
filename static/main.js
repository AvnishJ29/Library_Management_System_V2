import router from './router.js'
import Navbar from './Components/Navbar.js'

new Vue({
    el:'#app',    
    template:`
        <div>   
        <Navbar :key='change'/>      
        <router-view/>       
        </div>`,
        router,
        components:{
            Navbar,
        },
        data:{
            change:true
        },
        watch:{
            $route(to,from){
                this.change=!this.change
            }
        }
})