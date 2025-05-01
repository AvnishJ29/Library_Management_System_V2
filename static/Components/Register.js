export default {
  template: `
    <div>
    <h2 style="margin-left: 10px; color: brown;">New User Registration:</h2>
    <div class="container">
      <div class="row justify-content-center" style="margin-top: 100px;">
        <div class="col-6">
        <div class='text-danger'>{{Error}}</div>
          <form @submit.prevent="register">
            <div>
              <label class="form-label">Name:</label>
              <input type="text" v-model="Name" class="form-control" required />
            </div>
            <div>
              <label class="form-label">Email:</label>
              <input type="email" v-model="Email" class="form-control" required />
            </div>
            <div>
              <label class="form-label">Password:</label>
              <input type="password" v-model="Password" class="form-control" minlength=5 required />
            </div>
            <button type="submit" class="btn btn-success" style="margin-top:10px">REGISTER</button>
          </form>
        </div>
      </div>
    </div>
  </div>
   `,
  data() {
    return {
      Name: null,
      Email: null,
      Password: null,
      Error: null
    }
  },
  methods: {
    async register() {
      try {
        const data = { "Name": this.Name, "Email": this.Email, "Password": this.Password }
        const response = await fetch("/register", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        const responsedata = await response.json()
        if (response.ok) {
          alert(responsedata.message)
          this.$router.push('/')
        } else {
          this.Error = responsedata.message
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

