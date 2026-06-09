import mongoose from "mongoose";

const connectDb= async() => {
    try {
        mongoose.connection.on("connected", ()=>{console.log("Mongoose connected successfully")});

          let mongodbURL = process.env.MONGODB_URL;
          const projectName = 'ResumerBuilder';
          if(!mongodbURL) {
              throw new Error("MongoDB URL is not defined in environment variables"); 
          }

        // To avoid corrupting query options (which can produce warnings like
        // "majority/ResumerBuilder" in writeConcern), do NOT embed the
        // database name directly into the query string. Instead strip any
        // database path from the provided URL and pass the DB name via the
        // `dbName` option to mongoose.connect(). This is robust for URLs that
        // already include credentials, host(s) and query params.
        const [base, query] = mongodbURL.split('?');
        // extract protocol+authority part (no path)
        const authorityMatch = base.match(/^(mongodb(?:\+srv)?:\/\/[^/]+)/);
        const connector = authorityMatch ? authorityMatch[1] : base.replace(/\/$/, '');
        const urlWithQuery = query ? `${connector}?${query}` : connector;

        console.log('Connecting to MongoDB with connector:', urlWithQuery, 'dbName:', projectName);

        await mongoose.connect(urlWithQuery, {
            dbName: projectName,
            // timeout faster when server selection fails
            serverSelectionTimeoutMS: 10000,
        })

    }catch (error) {
        console.log("Error in connecting to MongoDB:", error);
    }
}

export default connectDb;