import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import ProductService from "@/services/product/ProductService";

export function Profile() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // ✅ Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Khi thêm mới từ trang Create
  useEffect(() => {
    if (location.state?.newProduct) {
      setProducts((prev) => [location.state.newProduct, ...prev]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Khi bấm Edit hoặc Create → render Outlet
  if (
    location.pathname.includes("/products/create") ||
    location.pathname.match(/\/products\/\d+$/) ||
    location.pathname.includes("/products/update")
  ) {
    return <Outlet />;
  }

  // ✅ Hàm xóa sản phẩm
  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa sản phẩm này không?");
    if (!confirm) return;

    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Đã xóa sản phẩm thành công!");
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm: " + err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12 text-blue-500" />
      </div>
    );

  if (error)
    return (
      <p className="p-6 text-red-500 font-medium text-lg">Error: {error}</p>
    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" color="blue-gray" className="font-bold">
          Product Management
        </Typography>
        <Link to="create">
          <Button color="blue">+ Create Product</Button>
        </Link>
      </div>

      {/* Product Table */}
      <Card className="shadow-lg border border-blue-gray-100">
        <CardBody className="overflow-x-auto p-0">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr className="bg-blue-gray-50">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map(
                  ({ id, mainImageUrl, name, description, price }, index) => (
                    <tr
                      key={id}
                      className={`border-b border-blue-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-blue-gray-50/30"
                      }`}
                    >
                      <td className="p-4">
                        <img
                          src={mainImageUrl || "/img/placeholder.png"}
                          alt={name}
                          className="h-14 w-14 object-cover rounded-lg border"
                        />
                      </td>
                      <td className="p-4 font-semibold">{name}</td>
                      <td className="p-4 text-sm text-blue-gray-600 max-w-xs truncate">
                        {description}
                      </td>
                      <td className="p-4 text-green-600 font-bold">{price} ₫</td>
                      <td className="p-4 text-center flex justify-center gap-3">
                        <Tooltip content="View Details">
                          <Link to={`${id}`}>
                            <IconButton variant="text" color="blue">
                              <EyeIcon className="h-5 w-5" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip content="Edit">
                          <Link to={`update/${id}`}>
                            <IconButton variant="text" color="green">
                              <PencilIcon className="h-5 w-5" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() => handleDelete(id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Profile;
