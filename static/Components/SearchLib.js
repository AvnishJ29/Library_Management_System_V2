export default {
  template: `<div>
    <h4 class="text-danger">{{error}}</h4>    
    <div v-if="result.length>0">
            <div v-for="book in result">
                <li class="list-unstyled">
                    <div class="row align-items-center offset-md-1 mt-3">
                        <div class="col-12 col-md-3 fs-5">
                        <div class="bi bi-bookmark-star-fill" style="color:orange;">
                            <span class="fs-3 ms-2" style="color: brown;">{{book.Name}}</span>
                        </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div v-if="book.Authors && book.Authors.length > 0">
                                <b>Authors:</b>
                                <span v-for="author in book.Authors">
                                    <strong class="ms-1">{{author}}</strong>
                                </span>
                            </div>
                            <b>Pages: {{book.Pages}}</b><br>
                            <b>Current Stock: {{book.Copies}}</b>
                        </div>
                        <div class="col-6 col-md-1">
                            <span @click="edit_book(book.ID)" class="bi bi-pencil-square fs-3"
                                style="color: green; font-size: x-large; cursor: pointer;"></span>                       
                            <span @click="delete_book(book.ID)" class="bi bi-trash fs-3"
                                style="color: red; font-size: x-large; margin-left: 20px; cursor: pointer;"></span>
                        </div>
                    </div>
                </li>
            </div>
        </div>
    <div v-else>
      <span class="fs-3 m-5">Nothing Found in Search... <span class="bi bi-search"></span></span>
    </div>
  </div>`,
  data() {
    return {
      error: null,
      result: [],
      query: null,
      token:sessionStorage.getItem("token")
    }
  },
  methods: {
    async search() {
      try {
        const Query = { "Query": this.query }
        const response = await fetch("/search", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(Query)
        })
        const data = await response.json()
        if (response.ok) {
          this.result = data
        } else {
          this.error = data.message
        }
      } catch (error) {
        console.error(error);
      }
    },
    edit_book(book_id) {
      this.$router.push({ name: 'EditBook', params: { book_id } })
    },
    async delete_book(book_id) {
      try {
        const response = await fetch(`/book/${book_id}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          }
        })
        const data = await response.json()
        if (response.ok) {
          alert(data.message)
          this.$router.go(0)
        } else {
          this.error = data.message
        }
      } catch {
        console.error(error);
      }
    },
  },
  mounted() {
    this.query = this.$route.params.param
    this.search()
  },
  watch: {
    $route(to, from) {
      window.location.reload()
    }
  }
}