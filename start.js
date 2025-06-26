const app = require("./server");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`Server is running on port ${PORT}`);
  }
});
