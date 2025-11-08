import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  TagIcon,
  CubeIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid"; 
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import ProductCreate from "./pages/product/ProductCreate";
import ProductDetail from "./pages/product/ProductDetail";
import UpdateProduct from "./pages/product/UpdateProduct";
import CategoryManager from "./pages/category/CategoryManager";
import TagManager from "./pages/tag/TagManager";
import { OrderList, OrderDetail, OrderCreate, OrdersWrapper } from "./pages/order";
import { SignIn } from "@/pages/auth";

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
        icon: <CubeIcon {...icon} />,
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
          { 
            name: "Edit Product",
            path: "update/:id",
            element: <UpdateProduct />,
          }
        ],
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Category Management",
        path: "/category",
        element: <CategoryManager />,
      },
      {
        icon: <TagIcon {...icon} />,
        name: "Tag Management",
        path: "/tag",
        element: <TagManager />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Order Management",
        path: "/orders",
        element: <OrdersWrapper />,
        children: [
          {
            name: "Order List",
            path: "",
            element: <OrderList />,
          },
          {
            name: "Create Order",
            path: "create",
            element: <OrderCreate />,
          },
          {
            name: "Order Detail",
            path: ":id",
            element: <OrderDetail />,
          },
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
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
