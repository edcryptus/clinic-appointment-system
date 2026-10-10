import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import About from "./pages/About";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import FindAppointment from "./pages/FindAppointment";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "services", element: <Services /> },
      { path: "services/:slug", element: <ServiceDetail /> },
      { path: "doctors", element: <Doctors /> },
      { path: "doctors/:slug", element: <DoctorDetail /> },
      { path: "about", element: <About /> },
      { path: "book", element: <Booking /> },
      { path: "book/confirmation/:reference", element: <Confirmation /> },
      { path: "find-appointment", element: <FindAppointment /> },
      { path: "contact", element: <Contact /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
