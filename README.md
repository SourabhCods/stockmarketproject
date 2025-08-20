# Stock Market Project

![](https://i.postimg.cc/XN8H9K39/Screenshot-1113.png)
![](https://i.postimg.cc/CLxv7ZLX/Screenshot-1114.png)
## Development Approach

* First, I started by finding a dataset for displaying charts because that’s the core of the project. While researching, I came across an API called **Twelve Data API**, which provides extensive stock market data at different time intervals. It was also easy to integrate.

* Next, I moved to the frontend part, which involved rendering and displaying stock charts. For this, I used the **react-chartjs-2** npm package (a wrapper around Chart.js). It provides various chart styles with source code and required attributes, making it easy to embed into my project. I chose it because it’s one of the most widely used chart libraries in the developer community.

* For storing data, I used **Supabase**, a free cloud database built specifically for Postgres. This reduces the hassle of manually hosting a database and handling related setups. Along with that, I used Prisma for querying the database. Prisma Client provides built-in methods for performing queries, which makes the work much easier without writing raw query logic. This combination worked really well.

* Lastly, for the backend, I used **Express with TypeScript**. TypeScript ensures type checking and type safety, reducing the chances of runtime errors in production.

## Technologies Used

* Frontend (Client-side): React.js + TypeScript

* Backend (Server-side): Node.js + Express + TypeScript

* Database: Supabase + Prisma

## Challenges encountered 

* The first challenge was finding a dataset that was suitable for Chart.js.

* Setting up Supabase with Prisma took a lot of time due to errors in the Supabase direct connection string.

* The **react-chartjs-2** package doesn’t provide direct code examples for all chart styles. Instead, I had to check the examples section, open the sandbox, extract the code, and then use it. This was slow and not very efficient.

* Setting up all components to render seamlessly was also tricky since each component depended on others. TypeScript’s strict type checking added extra steps, though I consider this more as good practice in writing better code rather than a challenge.
