import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import loginService from "../../services/cmsAuth/LoginService";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export function SignIn() {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigator = useNavigate();
  
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const userData = await loginService.login({
      username: Username,
      password: Password,
    });

    const decodedToken = loginService.decodeToken(userData.token);

    if (decodedToken?.role === "ROLE_ADMIN", "ROLE_ROOT") {
      navigator("/dashboard/home");
       toast.success("Login successful!");
    } else if (decodedToken?.role === "BASIC_USER") {
      setErrorMessage("You do not have permission to access this page.");
      loginService.logout(); 
      navigator("/auth/404");
    } else {
      setErrorMessage("Invalid role or no permission.");
      navigator("/auth/404");
      loginService.logout();
    }
  } catch (error) {
    setErrorMessage(error.message || "Login failed");
  }
};
  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Sign In
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your username and password to Sign In.
          </Typography>
        </div>
        <form
          onSubmit={handleSubmit} 
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Your username
            </Typography>
            <Input
              size="lg"
              placeholder="username"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={Password}
              onChange={(e) => setPassword(e.target.value)} 
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          {errorMessage && (
            <Typography
              variant="small"
              color="red"
              className="mt-2 text-center font-medium"
            >
              {errorMessage}
            </Typography>
          )}
          <Button type="submit" className="mt-6" fullWidth>
            Sign In
          </Button>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
        />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}

export default SignIn;