export default {
  template: `<div>    
    <h3 style="color: brown;" class="m-2">Your Feedback is Valuable To Us:</h3>
    <div class="container">
      <div class="row justify-content-center" style="margin-top: 50px;">
      <div class="col-md-4">
        <span style="color:darkorange" class="fs-4">Book Details: </span>
        <p class="fs-5 ms-3">Name : {{book_data.Name}}<br>
                            Pages : {{book_data.Pages}}<br>             
        </p>       
      </div>
        <div class="col-md-8">
        <div class="text-danger">{{error}}</div>
          <form @submit.prevent="feedback">
            <div>            
              <label class="form-label fs-4">Rating:</label><br>
              <span :class="{'bi bi-emoji-angry-fill': Rating === 1, 'bi bi-emoji-angry': Rating !== 1}"  class="fs-1 ms-2" style="color:red;cursor:pointer;"  @click="Rating=1" ></span>
              <span :class="{'bi bi-emoji-frown-fill': Rating === 2, 'bi bi-emoji-frown': Rating !== 2}"  class="fs-1 ms-3" style="color:darkorange;cursor:pointer;"  @click="Rating=2" ></span>
              <span :class="{'bi bi-emoji-neutral-fill': Rating === 3, 'bi bi-emoji-neutral': Rating !== 3}"  class="fs-1 ms-3" style="color:navy;cursor:pointer;"  @click="Rating=3" ></span>
              <span :class="{'bi bi-emoji-smile-fill': Rating === 4, 'bi bi-emoji-smile': Rating !== 4}"  class="fs-1 ms-3" style="color:greenyellow;cursor:pointer;"  @click="Rating=4" ></span>
              <span :class="{'bi bi-emoji-heart-eyes-fill': Rating === 5, 'bi bi-emoji-heart-eyes': Rating !== 5}"  class="fs-1 ms-3" style="color:green;cursor:pointer;"  @click="Rating=5" ></span>
            </div>
            <div>
              <label class="form-label mt-4 fs-4">Comments:</label>
              <textarea type="text" v-model="Comments" class="form-control" required/></textarea>
            </div>
            <button type="submit" class="btn btn-success mt-3">Submit</button>
          </form>
        </div>
      </div>
    </div>    
    </div>`,
  data() {
    return {
      Rating: null,
      status:false,
      error: null,
      Comments: null,
      user_id: null,
      book_id: null,
      book_data:"",
      token: sessionStorage.getItem("token")
    }
  },
  methods: {
    async feedback() {
      try {
        const data = { "Rating": this.Rating, "Comments": this.Comments }
        const response = await fetch(`/book/feedback/${this.book_id}/${this.user_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
          body: JSON.stringify(data)
        })
        const responsedata = await response.json()
        if (response.ok) {
          alert(responsedata.message)
          this.$router.push('/dashboard')
        } else {
          this.error = responsedata.message
        }
      } catch (error) {
        console.error(error);
      }
    },
    async book_detail(){
      try{
        const response = await fetch(`/book/detail/${this.book_id}`,{
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.token
          },
        })
        this.book_data = await response.json()
      }catch(error){
        console.error(error)
      }
    }
  },
  mounted() {
    this.user_id = this.$route.params.user_id
    this.book_id = this.$route.params.book_id
    this.book_detail()
  },
}