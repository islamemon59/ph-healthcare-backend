import app from "./app";

// const port = process.env.PORT;

const boosTrap = () => {
  try {
    app.listen(5000, () => {
      console.log(`Server is running on 5000`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

boosTrap();
