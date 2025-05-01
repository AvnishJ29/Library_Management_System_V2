export default {
    template: `<div>
    <h4 class="text-danger">{{ error }}</h4>
    <div v-for="(books, section) in library" >
    <div class="alert alert-warning">
        <span style="color:brown" class="fs-2">{{ section }}</span>
        <span class="bi bi-info-circle" @click="section_detail(section)" style="cursor:pointer"></span>
        <div v-if="section_details && section_details.section_name === section">
            <strong>Description: {{ section_details.section_description }}</strong>
        </div>
    </div>
        <div v-if="books.length > 0">
            <div v-for="book in books">
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
                            <button class="btn btn-success" @click="requestbook(book.ID, user.ID)">Request Book</button>
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
            <div class="row">
                <h5 class="text-danger row offset-md-1 mt-2">No Books Available in this Section</h5>
            </div>
        </div>
    </div>
</div>

`,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            user: null,
            library:[],
            error: null,
            section_details: null,
            rating:0,
            id:null,
            requested_books:[],
            issued_books:[]
        }
    },
    methods: {
        async fetchbooks() {
            try {
                const response = await fetch("/book", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                if (response.status === 401)
                    this.error = "You are not Authorized"
                const data = await response.json()
                this.library = data
            } catch (error) {
                console.error(error);
            }
        },
        async User() {
            const response = await fetch("/current/user", {
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token
                }
            })
            const data = await response.json()
            this.user = data
            this.check()
        },
        async requestbook(book_id, user_id) {
            try {
                const response = await fetch(`/book/request/${book_id}/${user_id}`, {
                    methods: "POST",
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
                    alert(data.message)
                }
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
            const user_id = this.user.ID
            this.$router.push({ name: 'Feedback', params: { book_id, user_id } })
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
        async check(){
        try{
            const response = await fetch(`/book/status/${this.user.ID}`,{
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
    this.User()
    this.fetchbooks()
}
}
