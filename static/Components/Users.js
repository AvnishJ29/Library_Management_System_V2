export default {
    template: `<div>
    <div class="container">
        <div class="row m-5">
          <div class="col-6">
          <div class='text-danger'>{{error}}</div>          
          </div>
          <div v-if="users">
            <div v-for="user in users">
                <div class="row m-4">
                    <div class="col">
                        <h5 style="color: navy;">{{user.Name}}</h5>
                         Email:<i>{{user.Email}}</i><br>
                         Wallet:<span class="bi bi-currency-rupee">{{user.Wallet}}</span><br>
                         Last Login:{{user.Last_login}}
                    </div>
                    <div class="col">
                        <div v-if="user.Status">
                            <button @click="deactivate(user.ID)" class="btn btn-success">Deactivate User</button>
                        </div>
                        <div v-else>
                            <button @click="activate(user.ID)" class="btn btn-success">Activate User</button>
                        </div>
                        </div>
                    </div>
                </div>
          </div>
        </div>
        </div>
    </div>
    </div>
</div>
</div> `,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            users: null,
            error: null
        }
    },
    methods: {
        async find_user() {
            try {
                const response = await fetch("/users", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                })
                const data = await response.json()
                if (response.ok) {
                    this.users = data
                } else {
                    this.error = data.message
                }
            } catch {
                console.error("Something went wrong")
            }
        },
        async activate(id) {
            try {
                const response = await fetch(`/activate/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                })
                const data = await response.json()
                if (response.ok) {
                    alert(data.message)
                    window.location.reload()
                } else {
                    this.error = data.message
                }
            } catch (error) {
                console.error(error);
            }
        },
        async deactivate(id) {
            try {
                const response = await fetch(`/deactivate/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                })
                const data = await response.json()
                if (response.ok) {
                    alert(data.message)
                    window.location.reload()
                } else {
                    this.error = data.message
                }
            } catch (error) {
                console.error(error);
            }
        }
    },
    mounted() {
        this.find_user()
    },
}