export default{
    template:`<div class="container">
  <div class="row m-5">
    <div class="col-12">
      <div class="card text mb-2">
        <div class="card-body">
          <h5 class="card-title" style="color:navy">Statistics</h5>
          <p class="card-text">Number of Sections: {{section}}</p>
          <p class="card-text">Number of E-books: {{books}}</p>
          <p class="card-text">Number of Pending Requests: {{req}}</p>
          <p class="card-text">Number of Active E-books Issued: {{issue}}</p>
          <p class="card-text">Number of E-books Issued:{{history}}</p>
          <p class="card-text">Number of Active Users: {{users}}</p>
          <p class="card-text">Total Revenue: <span class="bi bi-currency-rupee">{{revenue}}</span></p>
        </div>
      </div>
    </div>
  </div>  
  <div class="row m-5">
    <div class="col-md-6">
      <canvas id="doughnut" width="300" height="300" style="display: block; margin: 0 auto;"></canvas>
    </div>
    <div class="col-md-6 mt-3">
     <canvas id="bar" width="300" height="300" style="display: block; margin: 0 auto;"></canvas>
    </div>
  </div>
</div>
`,
    data() {
        return {
            
            token:sessionStorage.getItem("token"),
            chart1:null,
            chart2:null,
            books:null,
            section:null,
            req:null,
            users:null,
            issue:null,
            history:null,
            revenue:null
        }
    },
    methods: {
        chart(){            
            const sectionNames = this.chart1.map(item => item[0]);
            const bookCounts = this.chart1.map(item => item[1]);
            new Chart("doughnut",{
                type:"doughnut",
                data:{
                    labels:sectionNames,
                    datasets:[{
                        data:bookCounts,
                        backgroundColor: ["crimson", "deepskyblue", "gold", "limegreen", "mediumorchid", "tomato", "dodgerblue"],
                    }]
                },
                options:{
                    plugins:{
                    title:{
                        display:true,
                        text:"Proportion of Books in sections"
                    }
                }
                }
            })
            let booknames = this.chart2.map(item => item[0])
            let feedback = this.chart2.map(item => item[1])
            new Chart("bar",{
                type:"bar",
                data:{
                    labels:booknames,
                    datasets:[{
                        label:"Book V/S Ratings",
                        data:feedback,
                        backgroundColor: ["mediumorchid", "deepskyblue", "crimson", "limegreen", "gold", "mediumorchid", "tomato"],
                    }]
                },
                options:{
                    scales:{                        
                        y:{
                            beginAtZero: true,
                        }
                    }
                }
            })
        },
        async stats(){
            const response = await fetch("/statistics",{
                headers:{
                    'Content-Type':'application/json',
                    'Authentication-Token':this.token
                }
            })
            const data = await response.json()
            if(response.ok){
                this.chart1 = data.Chart1
                this.chart2 = data.Chart2
                this.books = data.Book
                this.section = data.Section
                this.req = data.Request
                this.issue = data.Issue
                this.users = data.Users
                this.history = data.history
                this.revenue = data.Revenue
                this.chart()
            }else{
                console.error("Something went wrong!!");
            }           
        },
    },
    created() {
        this.stats()        
    },
}