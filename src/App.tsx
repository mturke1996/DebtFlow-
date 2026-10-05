import { CssBaseline, ThemeProvider } from "@mui/material";
import { createAppTheme } from "./theme";
import { SiteClosedPage } from "./pages/SiteClosedPage";

const closedTheme = createAppTheme("light");

function App() {
  return (
    <ThemeProvider theme={closedTheme}>
      <CssBaseline />
      <SiteClosedPage />
    </ThemeProvider>
  );
}

export default App;
