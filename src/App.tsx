import React from "react";

import AppRoutes from "./routes";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

const App: React.FC = () => (
  <BrowserRouter basename="/">
    <Toaster richColors theme="light" />
    <AppRoutes />
  </BrowserRouter>
);

export default App;
