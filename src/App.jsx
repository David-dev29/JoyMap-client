// App.jsx
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HeaderUnifiedLayout from "../src/Layouts/UnifiedLayout.jsx";
import Home from "./Pages/Home.jsx";
import Tienda from "./Pages/Store.jsx";
import CartScreen from "./Components/Store/CartScreen.jsx";
import AddressScreen from "./Components/Store/AdressScreen.jsx";
import DeliveryTrackingScreen from "./Components/Store/DeliveryTrackingScreen.jsx";
import NewAddressScreen from "./Components/Store/NewAddressScreen.jsx";
import AddUserInfo from "./Components/Store/AddUserInfo.jsx";
import Favorites from "./Components/Store/Favorites.jsx";
import DeliveryOrder from "./Components/Store/DeliveryOrder.jsx";
import AccountSummary from "./Components/Store/AccountSummary.jsx";
import Profile from "./Pages/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HeaderUnifiedLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "home",
        element: <Home />,
      },
      // ✅ RUTA DINÁMICA PARA NEGOCIOS EN HOME
      {
        path: "home/:businessSlug",
        element: <Home />,
      },
      {
        path: "tienda",
        element: <Tienda />,
      },
      // ✅ RUTA DINÁMICA PARA NEGOCIOS EN TIENDA
      {
        path: "tienda/:businessSlug",
        element: <Tienda />,
      },
      {
        path: "cart",
        element: <CartScreen />,
      },
      {
        path: "address",
        element: <AddressScreen />,
      },
      {
        path: "deliveryOrder",
        element: <DeliveryOrder />,
      },
      {
        path: "deliveryScreen",
        element: <DeliveryTrackingScreen />,
      },
      {
        path: "accountSummary",
        element: <AccountSummary />,
      },
      {
        path: "new-address",
        element: <NewAddressScreen />,
      },
      {
        path: "new-user-info",
        element: <AddUserInfo />,
      },
      {
        path: "favoritos",
        element: <Favorites />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}