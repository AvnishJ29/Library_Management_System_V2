export default {
  template: `   
    <div><nav class="navbar navbar-expand-lg  bg-body-tertiary bg-dark border-bottom border-body" data-bs-theme="dark">
    <div class="container-fluid">
    <span class="navbar-brand"><span style="color:red;font-size: large;">R</span>ead-a-Thon</span>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
    </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">          
        
          <li class="nav-item" v-if="!this.token">
            <router-link class="nav-link active" aria-current="page" to="/" :style="{ color: path === '/' ? 'red' : 'white' }">Home</router-link>
          </li>   
          <li class="nav-item" v-if="!this.token">
            <router-link class="nav-link active" aria-current="page" to="/register" :style="{ color: path === '/register' ? 'red' : 'white' }">Register</router-link>
          </li>   


          <li class="nav-item" v-if="this.token && this.role==='General'">
            <router-link class="nav-link active" aria-current="page" to="/dashboard" :style="{ color: path === '/dashboard' ? 'red' : 'white' }">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="this.token && this.role==='General'">
            <router-link class="nav-link active" aria-current="page" to="/issuedbooks" :style="{ color: path === '/issuedbooks' ? 'red' : 'white' }">Issued Books</router-link>
          </li> 
          <li class="nav-item" v-if="this.token && this.role==='General'">
            <router-link class="nav-link active" aria-current="page" to="/profile" :style="{ color: path === '/profile' ? 'red' : 'white' }">Profile</router-link>
          </li> 
          <li class="nav-item" v-if="this.token && this.role==='General'">
            <router-link class="nav-link active" aria-current="page" to="/downloads" :style="{ color: path === '/downloads' ? 'red' : 'white' }">Your Downloads</router-link>
          </li> 

          
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <router-link class="nav-link active" aria-current="page" to="/librarian" :style="{ color: path === '/librarian' ? 'red' : 'white' }">Workspace</router-link>
          </li>
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <router-link class="nav-link active" aria-current="page" to="/manage" :style="{ color: path === '/manage' ? 'red' : 'white' }">Issue Management</router-link>
          </li>
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <router-link class="nav-link active" aria-current="page" to="/create_section" :style="{ color: path === '/create_section' ? 'red' : 'white' }">Create Section</router-link>
          </li>
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <router-link class="nav-link active" aria-current="page" to="/create_book" :style="{ color: path === '/create_book' ? 'red' : 'white' }">Create Book</router-link>
          </li>
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <router-link class="nav-link active" aria-current="page" to="/users" :style="{ color: path === '/users' ? 'red' : 'white' }">Users</router-link>
          </li>
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <router-link class="nav-link active" aria-current="page" to="/statistics" :style="{ color: path === '/statistics' ? 'red' : 'white' }">Statistics</router-link>
          </li>  
          <li class="nav-item" v-if="this.token && this.role==='Librarian'">
            <button class="nav-link active" @click="csv">Download CSV</button>
          </li>

          <li class="nav-item dropdown" v-if="this.token && this.role==='General'">
          <span class="nav-link active dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Sections
          </span>
          <ul class="dropdown-menu ">
            <li v-for="x in section_all" >                    
              <button class="dropdown-item" @click="search_section(x.ID)">{{x.Name}}</button>
          </li>
          </ul>
        </li>

          <li class="nav-item" v-if="this.token">
            <button class="nav-link active" @click="logout">Logout</button>
          </li> 
        </ul>   
      <form class="d-flex" v-if="token" @submit.prevent="search">
          <input class="form-control me-2" v-model="query" placeholder="Search">
          <button class="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>
    </div>
  </nav> 
  </div>
  `,
  data() {
    return {
      role: sessionStorage.getItem("role"),
      token: sessionStorage.getItem("token"),
      path: this.$route.path,
      query: null,
      section_all: null,
      Section: null
    }
  },
  methods: {
    async logout() {
      const response = await fetch("/logout",{
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.token
        },
      })
      if(response.ok){
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("role")
        this.$router.push('/')
      }else{
        console.error("Something went wromg")
      }
    },
    search() {
      const param = this.query
      if (this.role === "General") {
        this.$router.push({ name: 'Search', params: { param } })
      } else {
        this.$router.push({ name: 'SearchLib', params: { param } })
      }
    },
    async sections() {
      const response = await fetch("/section/all", {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.token
        },
      })
      const data = await response.json()
      this.section_all = data
    },
    search_section(id) {
      if (this.role === "General") 
        this.$router.push({ name: 'SearchSection', params: {id} })  
    },
    async csv(){
      try{
        const url = '/csv'
        const response = await fetch(url,{
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
        })
        if (response.ok){
          alert("CSV file will be made available")
          window.location.href = url
        }else{
          console.error("Something went wrong")
        }
      }catch(error){
        console.error(error)
      }
    }
  },
  mounted() {
    if(this.token)
      this.sections()
  },
}
