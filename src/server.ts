import app from "./app";
import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

// const port = process.env.PORT;

const boosTrap = () => {
  try {
    // seedSuperAdmin();
    seedSuperAdmin();
    app.listen(envVars.PORT, () => {
      console.log(`Server is running on ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

boosTrap();
