import app from "./app";
import { envVars } from "./config/env";

// const port = process.env.PORT;

const boosTrap = () => {
  try {
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

boosTrap();
