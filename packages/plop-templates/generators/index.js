import componentGenerator from "./component.js";
import authPagesGenerator from "./auth-pages.js";
import dashboardGenerator from "./dashboard.js";
import dashboardPageGenerator from "./dashboard-page.js";

export default (plop) => {
  componentGenerator(plop);
  authPagesGenerator(plop);
  dashboardGenerator(plop);
  dashboardPageGenerator(plop);
  // Add more generators here
};
