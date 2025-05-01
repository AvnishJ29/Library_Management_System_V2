export default {
    template: `<div>
    <h4 style="color:red" class="mb-4 ms-2 mt-2">{{error}}</h4>
    <div v-for="book in books">
        <div class="row m-md-4">
        <div class="col-md-3 col-12">
            <h2 style="color: brown;">{{book.Name}}</h2>
        </div>
        <div class="col-md-3 col-12">            
            <strong>Authors: </strong>
            <span v-for="author in book.Authors">
                    <span class="ms-1">{{author}}</span>
            </span><br>
            <strong>Pages : {{book.Pages}}</strong><br>
            <strong>Issue Date: {{book.Issue_date}}</strong><br>
            <strong>Return Date: {{book.Return_date}}</strong>
        </div>        
        <div class="col-md-3 col-3">
            <button class="btn btn-success" @click="feedback(book.ID)">Give Feedback</button>
        </div>
        <div class="col-md-3 col-3">
        <button class="btn btn-success" @click="pdf(book.ID)">Download Pdf</button>
        </div>
    </div>
    </div>       
    </div>
    </div>`,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            user_details: null,
            books: null,
            error: null
        }
    },
    methods: {
        async user() {
            try {
                const response = await fetch("/current/user", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                if (response.ok)
                    this.user_details = data
                    this.history()
            } catch (error) {
                console.error(error)
            }
        },
        async history() {
            try {
                const response = await fetch(`/downloads/${this.user_details.ID}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                if (response.ok) {
                    this.books = data
                } else {
                    this.error = data.message
                }
            } catch (error) {
                console.error(error)
            }
        },
        feedback(book_id) {
            const user_id = this.user_details.ID
            this.$router.push({ name: 'Feedback', params: { book_id, user_id } })
        },
        async pdf(book_id) {
            const user_id = this.user_details.ID
            const url = `/book/download/${book_id}/${user_id}`
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            if (response.ok) {
                alert("Pdf will be made available")
                window.location.href = url
            } else {
                this.error = 'Error fetching PDF'
            }
        },
    },
    mounted() {
        this.user()
    }
}
