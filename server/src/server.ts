import { app } from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Authorization Server running on port ${PORT}`);
});
