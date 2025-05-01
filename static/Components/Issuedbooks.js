export default {
    template: `<div>
    <h4 style="color:red" class="mb-4 ms-2 mt-2">{{error}}</h4>
    <div v-for="book in issued_books">
        <div class="row ms-md-4">
        <div class="col-md-3 col-12">
            <h2 style="color: brown;">{{book.book_name}}</h2>
        </div>
        <div class="col-md-3 col-12">            
            <strong>Authors: </strong>
            <span v-for="author in book.authors">
                    <span class="ms-1">{{author}}</span>
            </span><br>
            <strong>Pages : {{book.book_pages}}</strong><br>
            <strong>Return Date: {{book.return_date}}</strong>
        </div>
        <div class="col-md-1 col-2">
            <button class="btn btn-outline-success" @click="read(book.book_id)">Read</button>
        </div>
        <div class="col-md-1 col-3">
            <button class="btn btn-outline-success" @click="bookreturn(book.book_id)">Return</button>
        </div>
        <div class="col-md-2 col-5">
            <button class="btn btn-outline-success" @click="feedback(book.book_id)">Give Feedback</button>
        </div>
        <div class="col-md-2 col-1">
        <span class="bi bi-file-earmark-pdf fs-2" style="color:red;cursor:pointer" @click="pdf(book.book_id)"></span>
        </div>
    </div>
    </div>       
    </div>
    </div>`,
    data() {
        return {
            issued_books: null,
            error: null,
            user_details: null,
            token: sessionStorage.getItem("token")
        }
    },
    methods: {
        async issuedbooks() {
            try {
                const id = this.user_details.ID
                const response = await fetch(`/book/issued/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                if (response.ok) {
                    this.issued_books = data
                } else {
                    this.error = data.message
                }
            } catch (error) {
                console.error(error);
            }
        },
        async user() {
            try {
                const response = await fetch("/current/user", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                this.user_details = data
                this.issuedbooks()
            } catch (error) {
                console.error(error);
            }
        },
        read(book_id) {
            const user_id = this.user_details.ID
            this.$router.push({ name: 'Read', params: { book_id, user_id } })
        },
        async bookreturn(book_id) {
            try {
                const user_id = this.user_details.ID
                const response = await fetch(`/book/return/${book_id}/${user_id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                if (response.ok) {
                    alert(data.message)
                    this.$router.push("/dashboard")
                }
            } catch (error) {
                console.error(error);
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
                const temp = await fetch(`/book/payment/status/${book_id}/${user_id}`,{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                }) 
                const status = await temp.json()
                alert("Pdf will be made available."+status.message)
                window.location.href = url
            } else {
                this.error = 'Error fetching PDF'
            }
        },
    },
    created() {
        this.user()
    },
}
