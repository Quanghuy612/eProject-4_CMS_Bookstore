// src/pages/dashboard/Profile.jsx
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductService from "@/services/product/ProductService";

export function Profile() {
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);     
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAllProducts();
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Nếu đang ở /products/create hoặc /products/:id -> render Outlet (ProductCreate hoặc ProductDetail)
  if (location.pathname.includes("/products/create") || location.pathname.match(/\/products\/\d+$/)) {
    return <Outlet />;
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      {/* Nút Create Product */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" color="blue-gray">
          Product List
        </Typography>
        <Link to="create">
          <Button color="blue">+ Create Product</Button>
        </Link>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(({ id, mainImageUrl, name, description, price }) => (
          <Card
            key={id}
            className="shadow-lg border border-blue-gray-100"
          >
            <CardHeader floated={false} className="h-48">
              <img
                src={mainImageUrl || "/img/placeholder.png"}
                alt={name}
                className="h-full w-full object-cover"
              />
            </CardHeader>
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                {name}
              </Typography>
              <Typography
                variant="small"
                className="font-normal text-blue-gray-600 mb-2"
              >
                {description}
              </Typography>
              <Typography color="green" className="font-semibold">
                {price} ₫
              </Typography>
            </CardBody>
            <CardFooter className="flex justify-end">
              <Link to={`${id}`}>
                <Button variant="outlined" size="sm">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Profile;
