export default {
  template: `
    <div class="container">    
      <div class="row justify-content-left" style="margin-top: 100px;">
        <div class="col-6">
        <div class='text-danger'>{{error}}</div>
          <form @submit.prevent="login">
            <div>
              <label class="form-label">Email:</label>
              <input type="email" v-model="Email" class="form-control" required >
            </div>
            <div>
              <label class="form-label">Password:</label>
              <input type="password" v-model="Password" class="form-control"  minlength=5 required >
            </div>
            <button type="submit" class="btn btn-success mt-3">LOGIN</button>
          </form>
        </div>
      </div>
    </div>`,
  data() {
    return {
      Email: null,
      Password: null,
      error: null
    }
  },
  methods: {
    async login() {
      try {
        const data = { "Email": this.Email, "Password": this.Password }
        const response = await fetch("/userlogin", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        const responsedata = await response.json()
        if (response.ok) {
          sessionStorage.setItem("token", responsedata.token)
          sessionStorage.setItem("role", responsedata.role)
          if (responsedata.role === 'Librarian') {
            this.$router.push('/librarian')
          } else {
            this.$router.push('/dashboard')
          }
        } else {
          this.error = responsedata.message
        }
      } catch (error) {
        console.error(error);
      }
    },
  }
}