export default {
  template: `<div>
    <h2 style=" color: purple;" class="m-4">Create Section:</h2>
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-6">
        <div class='text-danger'>{{error}}</div>
          <form @submit.prevent="create_Section">
            <div>
              <label class="form-label">Section Name:</label>
              <input type="text" v-model="Name" class="form-control mt-1" required />
            </div>
            <div>
              <label class="form-label mt-4">Section Description:</label>
              <textarea type="text" v-model="Description" class="form-control mt-1" required></textarea>
            </div>
            <button type="submit" class="btn btn-success mt-4">Create Section</button>
          </form>
        </div>
      </div>
    </div>
    </div>`,
  data() {
    return {
      token: sessionStorage.getItem("token"),
      Name: null,
      Description: null,
      error: null
    }
  },
  methods: {
    async create_Section() {
      try {
        const data = { "Name": this.Name, "Description": this.Description }
        const response = await fetch("/section", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
          body: JSON.stringify(data)
        })
        const response_data = await response.json()
        if (response.ok) {
          alert(response_data.message)
          this.$router.push("/librarian")
        } else {
          this.error = response_data.message
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
}