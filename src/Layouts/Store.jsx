import { Outlet, useLocation } from "react-router-dom";
import HeaderUnified from "../Components/HeaderUnified.jsx";

export default function TiendaLayout() {
  const location = useLocation();
  const hideHeaderOnRoutes = ["/cart", "/address", "/deliveryScreen"];

  const shouldHideHeader = hideHeaderOnRoutes.includes(location.pathname);

  return (
    <div className="bg-white text-black">
      {!shouldHideHeader && <HeaderUnified />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

  

  