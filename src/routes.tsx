import { Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Config from "./pages/equipments/Config";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="" element={<Config />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
