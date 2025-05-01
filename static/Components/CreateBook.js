export default {
  template: `<div>
    <h2 style="color:purple;" class="m-4">Create Book:</h2>
    <div class="container">
        <div class="row justify-content-center mt-4">
            <div class="col-6">
                <div class='text-danger'>{{error}}</div>
                <form @submit.prevent="create_book">
                    <div>
                        <label class="form-label">Book Name:</label>
                        <input type="text" v-model="Name" class="form-control" required />
                    </div>
                    <div>
                        <label class="form-label">Book Content:</label>
                        <textarea type="text" v-model="Content" class="form-control" required></textarea>
                    </div>
                    <div>
                        <label class="form-label">Pages:</label>
                        <input type="number" v-model="Pages" class="form-control" required />
                    </div>
                    <div>
                        <label class="form-label">Copies:</label>
                        <input type="number" v-model="Copies" class="form-control" required />
                    </div>
                    <div>
                        <label class="form-label">Authors:</label>
                        <input type="text" v-model="Authors" class="form-control" placeholder="Enter values separated by comma" required />
                    </div>
                    <div>
                        <label class="form-label">Section:</label>
                        <select class="form-control" v-model="Section">
                            <option v-for="section in section_all" :value="section.Name">{{ section.Name }}</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-success" style="margin-top:10px">Create Book</button>
                </form>
            </div>
        </div>
    </div>
</div>`,
  data() {
    return {
      token: sessionStorage.getItem("token"),
      Name: null,
      Content: null,
      Pages: null,
      Authors: null,
      Section: null,
      error: null,
      section_all: null,
      Copies: null
    }
  },

  methods: {
    async create_book() {
      try {
        const temp = this.Authors.split(",")
        const data = { "Name": this.Name, "Content": this.Content, "Pages": this.Pages, "Authors": temp, "Section": this.Section, "Copies": this.Copies }
        const response = await fetch("/book", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
          body: JSON.stringify(data)
        })
        const data_response = await response.json()
        if (response.ok) {
          alert(data_response.message)
          this.$router.push("/librarian")
        } else {
          this.error = data_response.message
        }
      } catch (error) {
        console.error(error);
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
    }
  },
  mounted() {
    this.sections()
  },
}