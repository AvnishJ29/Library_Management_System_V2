export default {
    template: `
    <div>
        <h2 style="color: brown;" class="m-4">Edit Section:</h2>
        <div class="container">
            <div class="row justify-content-center mt-5">
                <div class="col-6">
                <div class='text-danger'>{{error}}</div>
                    <form @submit.prevent="edit_section">
                        <div>
                            <label class="form-label">Name:</label>
                            <input type="text" v-model="section_edit.Name" class="form-control" required />
                        </div>
                        <div>
                            <label class="form-label">Description:</label>
                            <input type="text" v-model="section_edit.Description" class="form-control" required />
                        </div>
                        <button type="submit" class="btn btn-success" style="margin-top:10px">Edit Section</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            token: sessionStorage.getItem("token"),
            section_edit: {
                Name: null,
                Description: null
            },
            section_name: null,
            error: null,
        };
    },
    methods: {
        async fetchsection() {
            try {
                const response = await fetch(`/section/${this.section_name}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    }
                });
                const data = await response.json();
                this.section_edit.Name = data.section_name;
                this.section_edit.Description = data.section_description;
            } catch (error) {
                console.error(error);
            }
        },
        async edit_section() {
            try {
                const data = this.section_edit;
                const response = await fetch(`/section/${this.section_name}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.token
                    },
                    body: JSON.stringify(data)
                });
                const response_data = await response.json()
                if (response.ok) {
                    alert(response_data.message)
                    this.$router.push('/librarian')
                } else {
                    this.error = response_data.message
                }
            } catch (error) {
                console.error(error);
            }

        },        
    },
    mounted() {
        this.section_name = this.$route.params.section_name;
        this.fetchsection();
    },
}
