export default {
  template: `<div>
    <h4 class="text-danger">{{error}}</h4>
    <div v-if="result.length > 0">
        <div v-for="book in result">
            <div class="row ms-5 mt-3">
                <div class="col-12 col-md-3 fs-4">
                    <div class="bi bi-bookmark-star-fill" style="color:orange">
                        <span class="fs-3 ms-2" style="color: brown;">{{ book.Name }}</span>
                    </div>
                </div>
                <div class="col-md-2 col-12 m-2">
                    <strong>Authors: </strong>
                    <span v-for="(author, index) in book.Authors">
                        <span class="ms-1">{{ author }}</span>
                    </span><br>
                    <strong>Pages: {{ book.Pages }}</strong><br>
                </div>
                <div class="col-md-2 col-4">
                        <div v-if="requested_books.includes(book.ID)">
                            <button class="btn btn-warning disabled">Book Requested</button>
                        </div>
                        <div v-else-if="issued_books.includes(book.ID)">
                          <button class="btn btn-danger disabled">Book Issued</button>
                        </div>
                        <div v-else>
                            <button class="btn btn-success" @click="requestbook(book.ID)">Request Book</button>
                        </div>
                    </div>
                <div class="col-md-2 col-4">
                    <button class="btn btn-success" @click="feedback(book.ID)">Give Feedback</button>
                </div>
                <div class="col-md-2 col-2">
                    <div v-if="id !== book.ID ">
                        <button class="btn btn-dark" @click="ratings(book.ID)">Ratings</button>
                    </div>
                    <div v-if="id === book.ID && rating!==0">
                         <span v-for="i in Math.round(rating)"><span class="bi bi-star-fill ms-1" style="color:darkorange"></span></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <span class="fs-3 m-5">Nothing Found in Search... <span class="bi bi-search"></span></span>
    </div>
    </div>
</div>`,
  data() {
    return {
      query: null,
      error: null,
      result: [],
      user_details: null,
      token: sessionStorage.getItem("token"),
      id:null,
      rating:null,
      requested_books:[],
      issued_books:[]
    };
  },
  methods: {
    async user() {
      try {
        const response = await fetch("/current/user", {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          this.user_details = data;
          this.check()
        } else {
          console.error("Something went wrong");
        }
        this.search();
      } catch (error) {
        console.error(error);
      }
    },
    async search() {
      try {
        const data = { Query: this.query };
        const response = await fetch("/search", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
          body: JSON.stringify(data),
        });
        const response_data = await response.json();
        if (response.ok) {
          this.result = response_data;
        } else {
          this.error = response_data.message;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async requestbook(book_id) {
      try {
        const response = await fetch(`/book/request/${book_id}/${this.user_details.ID}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token,
          },
        });
        const data = await response.json();
        alert(data.message);
        this.$router.go(0)
      } catch (error) {
        console.error(error);
      }
    },
    async ratings(book_id) {
      try {
          const response = await fetch(`/book/rating/${book_id}`, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': this.token
              }
          });
          const data = await response.json();
          if (response.ok) {
              this.rating = data.Rating
              this.id = data.ID
          } else {
              alert(data.message)
          }
      } catch (error) {
          console.error(error);
      }
  },
  feedback(book_id) {
      const user_id = this.user_details.ID
      this.$router.push({ name: 'Feedback', params: { book_id, user_id } })
  },
  async check(){
    try{
        const response = await fetch(`/book/status/${this.user_details.ID}`,{
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': this.token
            }
        })
        const data = await response.json()
        if(response.ok){
            this.requested_books=data.Request
            this.issued_books=data.Issue
        }
    }catch(error){
        console.error(error)
    }
  },
},
  mounted() {
    this.query = this.$route.params.param;
    this.user();

  },
  watch: {
    $route(to, from) {
      window.location.reload()
    }
  }
}
