// RoutesPage.js

import React, { Fragment, createContext } from "react";
import { Routes, Route } from "react-router-dom";
import UploadPlanogramPage from "./UploadPlanogramPage";
import PlanogramModifierPage from "./PlanogramModifierPage";
import Navbar from "../components/Navbar";
import { ContextProvider } from "../providers/ContextProvider";


export const Context = createContext();

function RoutesPage() {
  return (
    <Fragment>
      <ContextProvider>
        <Routes>
          <Route path="/" element={<UploadPlanogramPage />} />
          <Route path="/planogram" element={<PlanogramModifierPage />} />
        </Routes>
      </ContextProvider>
    </Fragment>
  );
}

export default RoutesPage;