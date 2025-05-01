import Home from './Components/Home.js'
import Register from './Components/Register.js'
import Dashboard from './Components/Dashboard.js'
import Feedback from './Components/Feedback.js'
import Issuedbooks from './Components/Issuedbooks.js'
import Read from './Components/Bookread.js'
import Librarian_dashboard from './Components/Librarian_dashboard.js'
import EditSection from './Components/EditSection.js'
import CreateSection from './Components/CreateSection.js'
import EditBook from './Components/EditBook.js'
import CreateBook from './Components/CreateBook.js'
import Manage from './Components/Manage.js'
import Profile from './Components/Profile.js'
import Search from './Components/Search.js'
import SearchLib from './Components/SearchLib.js'
import SearchSection from './Components/SearchSection.js'
import Users from './Components/Users.js'
import Statistics from './Components/Statistics.js'
import Downloads from './Components/Downloads.js'

const routes=[
    {path:'/',component:Home},
    {path:'/register',component:Register},
    {path:'/dashboard',component:Dashboard},
    {path:'/issuedbooks',component:Issuedbooks},
    {path:'/feedback/:book_id/:user_id',name:'Feedback',component:Feedback},    
    {path:'/read/:book_id/:user_id',name:'Read',component:Read},
    {path:'/librarian',component:Librarian_dashboard},
    {path:'/edit_section/:section_name',name:'EditSection',component:EditSection}, 
    {path:'/create_section',component:CreateSection}, 
    {path:'/edit_book/:book_id',name:'EditBook',component:EditBook},
    {path:'/create_book',component:CreateBook}, 
    {path:'/manage',component:Manage},
    {path:'/profile',component:Profile},
    {path:'/search/:param',name:'Search',component:Search},
    {path:'/search/lib/:param',name:'SearchLib',component:SearchLib},
    {path:'/search/section/:id',name:'SearchSection',component:SearchSection},
    {path:'/users',component:Users},
    {path:'/statistics',component:Statistics},
    {path:'/downloads',component:Downloads}
]

export default new VueRouter({
    routes,   
})
