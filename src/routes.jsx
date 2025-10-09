import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import ProductCreate from "./pages/product/ProductCreate";
import ProductDetail from "./pages/product/ProductDetail";
import UpdateProduct from "./pages/product/UpdateProduct";
import { SignIn } from "@/pages/auth";
import { element } from "prop-types";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Home",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Product Management",
        path: "/products", 
        element: <Profile />,
        children: [
          {
            name: "Add Product",
            path: "create",
            element: <ProductCreate />,
          },
          {
            name: "Product Detail",
            path: ":id", 
            element: <ProductDetail />,
          },
          { name: "Edit Product",
            path: "update/:id",
            element: <UpdateProduct />,
          }
        ],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Notifications",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },

  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
