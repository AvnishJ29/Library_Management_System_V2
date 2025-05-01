export default {
  template: `<div>
    <div>
        <h4 class="text-danger m-3">{{error}}</h4>
        <div v-for="(books, section) in library">
        <div class="alert alert-warning">
        <div class="row">  
          <div class="col-12 col-md-5">      
            <span style="color:brown" class="fs-2">{{section}} </span>
            <span class="bi bi-info-circle" @click="section_detail(section)" style="cursor:pointer"></span> 
          </div>
            <div class="col-6 col-md-3">
                <button class="btn btn-success" @click="edit_section(section)">Edit Section</button>
            </div>
            <div class="col-6 col-md-3">
                <button class="btn btn-danger" @click="delete_section(section)">Delete Section</button>
            </div>   
        </div>
          <div class="row">     
            <div class="col-12">
                <div v-if="section_details && section_details.section_name === section">
                    <strong>Description: {{section_details.section_description}}</strong><br>
                    <i class="ms-2">Date Created: {{section_details.section_date}}</i>
                </div>
            </div>            
        </div>
        </div>
        <div v-if="books.length > 0">
            <div v-for="book in books">
                <li class="list-unstyled">
                    <div class="row align-items-center offset-md-1 mt-3">
                        <div class="col-12 col-md-3 fs-5">
                        <div class="bi bi-bookmark-star-fill" style="color:orange">
                            <span class="fs-3 ms-2" style="color: brown;">{{book.Name}}</span>
                        </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div v-if="book.Authors && book.Authors.length > 0">
                                <b>Authors:</b>
                                <span v-for="author in book.Authors">
                                    <span class="ms-1">{{author}}</span>
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
            <h5 class="row offset-md-1 row offset-1  text-danger ">No books Added to this Section Yet!</h5>
            <div class="row offset-md-2 row offset-1">
                <h4>Add One Now <span class="bi bi-journal-arrow-up" @click="createbook" style="cursor:pointer"></span>
                </h4>
            </div>
        </div>
    </div>
</div>
</div>`,
  data() {
    return {
      token: sessionStorage.getItem("token"),
      role: sessionStorage.getItem("role"),
      library: null,
      error: null,
      section_details: null,

    }
  },
  methods: {
    async fetchbooks() {
      try {
        const response = await fetch("/book", {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
        })
        const data = await response.json()
        this.library = data
      } catch (error) {
        console.error(error);
      }
    },
    async section_detail(section_name) {
      try {
        const response = await fetch(`/section/${section_name}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          }
        })
        const data = await response.json()
        if (response.ok) {
          this.section_details = data
        } else {
          alert(data.message)
        }
      } catch (error) {
        console.error(error);
      }
    },
    edit_section(section_name) {
      this.$router.push({ name: 'EditSection', params: { section_name } })
    },
    async delete_section(section_name) {
      try {
        const response = await fetch(`/section/${section_name}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          }
        })
        console.log(response)
        const data = await response.json()
        if (response.ok) {
          alert(data.message)
          this.$router.go(0)
        } else {
          alert(data.message)
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
      } catch (error) {
        console.error(error);
      }
    },
    createbook() {
      this.$router.push("/create_book")
    }

  },
  mounted() {
    this.fetchbooks()
  },
}