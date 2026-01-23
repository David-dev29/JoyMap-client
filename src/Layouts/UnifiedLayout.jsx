// src/layouts/HeaderUnifiedLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import HeaderUnified from "../Components/HeaderUnified.jsx";
import { useState } from "react";

export default function HeaderUnifiedLayout() {
  const [searchComponent, setSearchComponent] = useState(null);
  const location = useLocation();
  const hideHeaderOnRoutes = ["/cart", "/checkout", "/address", "/deliveryScreen", "/new-address", "/new-user-info", "/favoritos", "/deliveryOrder", "/accountSummary", "/profile"];

  const shouldHideHeader = hideHeaderOnRoutes.includes(location.pathname);

  return (
    <div className="bg-white text-black">
      {!shouldHideHeader && <HeaderUnified searchComponent={searchComponent} />}
      <main>
        <Outlet context={{ setSearchComponent }} />
      </main>
    </div>
  );
}

