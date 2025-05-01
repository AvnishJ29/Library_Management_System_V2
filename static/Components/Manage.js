export default {
    template: `<div>
    <div v-if="issued_books.length>0">
        <div class="alert alert-warning text-center fs-4" style="color: brown;">ISSUED  BOOKS</div>
        <div v-for="item in issued_books">
            <div class="row m-4">
                <div class="col-12 col-md-4">
                    <h5 style="color: brown;">{{item.book_name}}</h5>
                    <i>Current Stock:{{item.book_copies}}</i>
                </div>
                <div class="col-12 col-md-3">
                    <h5 style="color: darkorange;">User Details:</h5>
                        Name : {{item.user_name}}<br>
                        Email: {{item.user_email}}<br>
                        Wallet: <span class="bi bi-currency-rupee">{{item.user_wallet}}</span>
                </div>
                <div class="col-12 col-md-3">
                    <button class="btn btn-success" @click="access_revoke(item.book_id,item.user_id)">Revoke</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="pending_books.length>0">
        <div class="alert alert-warning text-center fs-4" style="color: brown;">PENDING  REQUESTS</div>
        <div v-for="item in pending_books">
            <div class="row m-4">
                <div class="col-12 col-md-4">
                    <h5 style="color: brown;">{{item.book_name}}</h5>
                    <i>Current Stock:{{item.book_copies}}</i>
                </div>
                <div class="col-12 col-md-3">
                    <h5 style="color: darkorange;">User Details</h5>
                        Name : {{item.user_name}}<br>
                        Email: {{item.user_email}}<br>
                        Wallet: <span class="bi bi-currency-rupee">{{item.user_wallet}}</span>             
                </div>
                <div class="col-6 col-md-2">
                    <button class="btn btn-success" @click="access_grant(item.book_id,item.user_id)">Grant</button>
                </div>
                <div class="col-6 col-md-3">
                    <button class="btn btn-success" @click="access_deny(item.book_id,item.user_id)">Deny</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="nonissued_books.length>0">
        <div class="alert alert-warning text-center fs-4" style="color: brown;">NON-ISSUED  BOOKS</div>
        <div v-for="item in nonissued_books">
            <div class="row m-4">
                <div class="col-12 col-md-3">
                    <h5 style="color: brown;">{{item.book_name}}</h5>
                    <i>Current Stock:{{item.book_copies}}</i>
                </div>
            </div>
        </div>
    </div>
</div>`,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            issued_books: [],
            pending_books: [],
            nonissued_books: [],
        }
    },
    methods: {
        async manage() {
            try {
                const response = await fetch("/book/issue_management", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                if (response.ok) {
                    this.issued_books = data.Issued
                    this.pending_books = data.Pending
                    this.nonissued_books = data.Non_Issued
                } else {
                    console.error("Something went wrong");
                }
            } catch (error) {
                console.error(error);
            }
        },
        async access_revoke(book_id, user_id) {
            try {
                const response = await fetch(`/book/access_revoke/${book_id}/${user_id}`, {
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
                    console.error("Something went wrong")
                }
            } catch (error) {
                console.error(error);
            }
        },
        async access_grant(book_id, user_id) {
            try {
                const response = await fetch(`/book/access_grant/${book_id}/${user_id}`, {
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
                    console.error("Something went wrong")
                }
            } catch (error) {
                console.error(error);
            }
        },
        async access_deny(book_id, user_id) {
            try {
                const response = await fetch(`/book/access_deny/${book_id}/${user_id}`, {
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
                    console.error("Something went wrong")
                }
            } catch (error) {
                console.error(error);
            }
        },        
    },
    mounted() {
        this.manage()
    },
}