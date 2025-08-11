const app = require("./app");
const config = require("./config");

const port = process.env.PORT || app.get("port");
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
});