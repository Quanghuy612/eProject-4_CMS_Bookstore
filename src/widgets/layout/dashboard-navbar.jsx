import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";

import LoginService from "@/services/cmsAuth/LoginService";
import routes from "@/routes";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = LoginService.getToken();

  // 👉 Build map { path: name } từ routes
  const buildRouteMap = () => {
    const map = {};
    routes.forEach((group) => {
      if (group.pages) {
        group.pages.forEach((page) => {
          map[page.path] = page.name;
        });
      }
    });
    return map;
  };
  const routeMap = buildRouteMap();

  // 👉 Cắt path thành mảng
  const pathnames = pathname.split("/").filter((el) => el !== "");

  const handleLogout = () => {
    LoginService.logout();
    navigate("/auth/sign-in");
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            {/* <Link to="/home">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 hover:text-blue-500 hover:opacity-100"
              >
                Dashboard
              </Typography>
            </Link> */}

            {pathnames.map((_, index) => {
              const to = "/" + pathnames.slice(0, index + 1).join("/");
              const isLast = index === pathnames.length - 1;
              const name = routeMap[to] || pathnames[index];

              return isLast ? (
                <Typography
                  key={to}
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {name}
                </Typography>
              ) : (
                <Link to={to} key={to}>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal opacity-50 hover:text-blue-500 hover:opacity-100"
                  >
                    {name}
                  </Typography>
                </Link>
              );
            })}
          </Breadcrumbs>

          <Typography variant="h6" color="blue-gray">
            {routeMap[pathname] || pathnames[pathnames.length - 1] || "Home"}
          </Typography>
        </div>

        {/* Phần còn lại giữ nguyên */}
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            <Input label="Search" />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>

          {token ? (
            <Button
              variant="text"
              color="red"
              className="hidden items-center gap-1 px-4 xl:flex normal-case"
              onClick={handleLogout}
            >
              <UserCircleIcon className="h-5 w-5 text-red-500" />
              Logout
            </Button>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile */}
          {token ? (
            <IconButton
              variant="text"
              color="red"
              className="grid xl:hidden"
              onClick={handleLogout}
            >
              <UserCircleIcon className="h-5 w-5 text-red-500" />
            </IconButton>
          ) : (
            <Link to="/auth/sign-in">
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </Link>
          )}

          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              {/* ... giữ nguyên các MenuItem */}
            </MenuList>
          </Menu>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
