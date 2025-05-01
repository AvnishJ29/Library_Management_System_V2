export default {
    template: `
    <div>
    <h4 class="text-danger">{{error}}</h4>
    <div v-if="book">
        <div class="d-flex justify-content-center">
            <h2 style="color:darkorange" class="m-3">{{book.book_name}}</h2>
        </div>
        <div class="m-4 container">{{book.book_content}}</div>
    </div>
    </div>`,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            book: null,
            error: null
        }
    },
    methods: {
        async read() {
            try {
                const response = await fetch(`/book/read/${this.book_id}/${this.user_id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                if (response.ok) {
                    this.book = data
                } else {
                    this.error = data.message
                }
            } catch (error) {
                console.error(error)
            }
        }
    },
    created() {
        this.book_id = this.$route.params.book_id
        this.user_id = this.$route.params.user_id
    },
    mounted() {
        this.read()
    },
}