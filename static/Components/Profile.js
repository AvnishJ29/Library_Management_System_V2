export default {
    template: `<div class="container-fluid mt-5"><div class="row">
    <div class="col-12 col-md-5 ms-md-5 fs-4">
        <h3 style="color: blue;">User Details:</h3>
        Name: {{Name}}<br>
        Email: {{Email}}<br>        
        Number of Books Issued: {{Issue}}<br>
        Number of Books Currently Requested: {{Request}}<br>
        <p><span v-if="Fav_book.length >0">
            Favourite Books:
            <span v-for="book in Fav_book">
                <span class="ms-1">{{book}}</span>
            </span>
        </span></p>   
        Current Wallet Balance: <span class="bi bi-currency-rupee">{{Wallet}}</span>
        <div v-if="Wallet<=500">
        <h4 style="color: red;cursor: pointer;" @click="recharge">Recharge Now</h4>        
        </div>  
        <div v-if="payment">
        <form class="row" @submit.prevent="pay">
        <div class="col-md-4 col-3">
            <input type="number" v-model="value" class="form-control" required />
        </div>
        <div class="col-md-2 col-3">
            <button class="btn btn-success" type="submit">Pay</button>
        </div>
    </form>
        <div class="row mt-3">   
            <div class="col-md-2 col-3">  
                <button class="btn btn-outline-info" @click="value=100"><span class="bi bi-currency-rupee">100</span></button>  
            </div>
            <div class="col-md-2 col-3">
                <button class="btn btn-outline-info" @click="value=200"><span class="bi bi-currency-rupee">200</span></button>  
            </div>
            <div class="col-md-2 col-3">
                <button class="btn btn-outline-info" @click="value=300"><span class="bi bi-currency-rupee">300</span></button>  
            </div>
        </div>
        </div>
    </div>
    <div class="col-12 col-md-6 mt-3">
    <div class="text-danger m-2">{{error}}</div>
      <h4 style="color: blue;">Update Profile:</h4>
        <form @submit.prevent="update">   
            <div>
                <label class="form-label">Name:</label>
                <input type=text v-model="name" class="form-control" required/>                
            </div>
            <div>
                <label class="form-label">E-mail:</label>
                <input type=email v-model="email" class="form-control" required/>                
            </div>
            <div>
                <label class="form-label"> New Password :</label>
                <p><input type="password" class="form-control"  v-model="Password" minlength=5 ></p>
            </div>
            <button class="btn btn-outline-primary" type="submit">Update Profile</button>         
        </form>    
    </div>
</div></div>`,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            Name:null,
            name:null,
            Email: null,
            email: null,
            Password: null,
            Issue: null,
            Request: null,
            Wallet: null,
            Fav_book: [],
            user_details: null,
            payment: false,
            value: 0,
            error:null
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
                this.user_details = data
                this.profile()
            } catch (error) {
                console.error(error);
            }
        },
        async profile() {
            try {
                const response = await fetch(`/profile/${this.user_details.ID}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                })
                const data = await response.json()
                this.Name = data.Name
                this.name = data.Name
                this.Email = data.Email
                this.Issue = data.Issue
                this.Request = data.Request
                this.Wallet = data.Wallet
                this.Fav_book = data.Fav_book
                this.email = data.Email
            } catch (error) {
                console.error(error);
            }
        },
        async update() {
            try {
                const data = { "Email": this.email, "Password": this.Password ,"Name":this.name}
                const response = await fetch(`/profile/${this.user_details.ID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify(data)
                })
                const response_data = await response.json()
                if (response.ok) {
                    alert(response_data.message)
                    this.$router.go(0)
                } else {
                    this.error = response_data.message
                }
            } catch (error) {
                console.error(error);
            }
        },
        recharge() {
            this.payment = !this.payment
        },
        async pay() {
            try {
                const val = { "Value": this.value }
                const response = await fetch(`/pay/${this.user_details.ID}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify(val)
                })
                const data = await response.json()
                if (response.ok) {
                    alert(data.message)
                    this.$router.go(0)
                } else {
                    console.error(data.message)
                }
            } catch (error) {
                console.error(error);
            }
        },        
    },
    mounted() {
        this.user()
    },
}