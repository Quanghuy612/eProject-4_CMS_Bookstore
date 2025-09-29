// src/pages/products/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductService from "@/services/product/ProductService";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await ProductService.getProductDetails(id);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;
  if (!product) return <p className="p-6">No product found.</p>;

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg border border-blue-gray-100">
        <CardHeader floated={false} className="h-72 flex justify-center bg-gray-50">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="h-full object-contain rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No Image
            </div>
          )}
        </CardHeader>

        <CardBody className="space-y-3">
          <Typography variant="h4" color="blue-gray">
            {product.name}
          </Typography>

          <Typography color="green" className="font-semibold text-lg">
            {product.price} ₫
          </Typography>

          <Typography variant="small" className="text-blue-gray-600">
            {product.description || "No description available"}
          </Typography>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <Typography className="font-medium">Quantity</Typography>
              <Typography variant="small">{product.quantity}</Typography>
            </div>
            <div>
              <Typography className="font-medium">Status</Typography>
              <Typography
                variant="small"
                className={product.active ? "text-green-600" : "text-red-600"}
              >
                {product.active ? "Active" : "Inactive"}
              </Typography>
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex justify-end">
          <Link to="/dashboard/products">
            <Button color="blue" variant="outlined">
              Back to List
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ProductDetail;
