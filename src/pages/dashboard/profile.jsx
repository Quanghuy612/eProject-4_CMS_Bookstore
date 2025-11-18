import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  PlusIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import ProductService from "@/services/product/ProductService";

export function Profile() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
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

  // ✅ Hàm xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteDialog({ open: false, product: null });
      // alert("Xóa sản phẩm thành công!");
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm: " + err);
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // ✅ Truncate text
  const truncateText = (text, length = 50) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // ✅ Khi bấm Edit hoặc Create → render Outlet
  if (
    location.pathname.includes("/products/create") ||
    location.pathname.match(/\/products\/\d+$/) ||
    location.pathname.includes("/products/update")
  ) {
    return <Outlet />;
  }

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spinner className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <Typography variant="h5" color="blue-gray" className="mb-2">
            Đang tải sản phẩm...
          </Typography>
          <Typography variant="small" color="gray">
            Vui lòng chờ trong giây lát
          </Typography>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96 shadow-xl border border-red-200">
          <CardBody className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Typography variant="h5" color="red" className="mb-2">
              Đã xảy ra lỗi
            </Typography>
            <Typography color="gray" className="mb-4">
              {error}
            </Typography>
            <Button color="blue" onClick={fetchProducts}>
              Thử lại
            </Button>
          </CardBody>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-xl border-0 mb-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <CardBody className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <Typography variant="h2" className="text-white font-bold mb-2">
                    Quản lý Sản phẩm
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100">
                    Quản lý và theo dõi tất cả sản phẩm trong cửa hàng của bạn
                  </Typography>
                </div>
              </div>
              <Link to="create">
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
                  size="lg"
                >
                  <PlusIcon className="h-5 w-5" />
                  Thêm sản phẩm
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Tổng sản phẩm
                  </Typography>
                  <Typography variant="h3" className="text-blue-600 font-bold">
                    {products.length}
                  </Typography>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h3" className="text-green-600 font-bold">
                    {products.filter(p => p.active).length}
                  </Typography>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <EyeIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Tổng giá trị
                  </Typography>
                  <Typography variant="h4" className="text-purple-600 font-bold">
                    {formatCurrency(products.reduce((sum, p) => sum + (p.price || 0), 0))}
                  </Typography>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Typography variant="h6" className="text-purple-600">₫</Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Product Table */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardBody className="p-0">
            <div className="p-6 bg-white border-b border-blue-gray-50">
              <Typography variant="h5" color="blue-gray" className="font-semibold">
                Danh sách sản phẩm
              </Typography>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="p-4 text-left">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        SẢN PHẨM
                      </Typography>
                    </th>
                    <th className="p-4 text-left">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        MÔ TẢ
                      </Typography>
                    </th>
                    <th className="p-4 text-left">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        GIÁ
                      </Typography>
                    </th>
                    <th className="p-4 text-left">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        TRẠNG THÁI
                      </Typography>
                    </th>
                    <th className="p-4 text-center">
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        THAO TÁC
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h6" color="gray" className="mb-2">
                          Chưa có sản phẩm nào
                        </Typography>
                        <Typography color="gray" className="mb-4">
                          Hãy thêm sản phẩm đầu tiên của bạn
                        </Typography>
                        <Link to="create">
                          <Button color="blue" className="flex items-center gap-2 mx-auto">
                            <PlusIcon className="h-4 w-4" />
                            Thêm sản phẩm
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <tr 
                        key={product.id}
                        className={`border-b border-blue-gray-50 transition-colors hover:bg-blue-gray-50/50 ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-gray-50/30"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar
                              src={product.mainImageUrl || "/img/placeholder.png"}
                              alt={product.name}
                              size="lg"
                              className="rounded-lg border-2 border-white shadow"
                            />
                            <div>
                              <Typography variant="h6" color="blue-gray" className="font-semibold">
                                {product.name}
                              </Typography>
                              <Typography variant="small" color="gray">
                                ID: {product.id}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Typography variant="paragraph" color="blue-gray" className="max-w-xs">
                            {truncateText(product.description || 'Chưa có mô tả', 80)}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography variant="h6" color="green" className="font-bold">
                            {formatCurrency(product.price)}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Chip
                            value={product.active ? "Đang bán" : "Ngừng bán"}
                            size="sm"
                            color={product.active ? "green" : "red"}
                            variant="gradient"
                            className="rounded-full"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Tooltip content="Xem chi tiết">
                              <Link to={`${product.id}`}>
                                <IconButton 
                                  variant="gradient" 
                                  color="blue"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </IconButton>
                              </Link>
                            </Tooltip>
                            <Tooltip content="Chỉnh sửa">
                              <Link to={`update/${product.id}`}>
                                <IconButton variant="gradient" color="green">
                                  <PencilIcon className="h-4 w-4" />
                                </IconButton>
                              </Link>
                            </Tooltip>
                            <Tooltip content="Xóa">
                              <IconButton
                                variant="gradient"
                                color="red"
                                onClick={() => setDeleteDialog({ open: true, product })}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} handler={() => setDeleteDialog({ open: false, product: null })}>
        <DialogHeader className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          <Typography variant="h5" color="red">
            Xác nhận xóa
          </Typography>
        </DialogHeader>
        <DialogBody>
          <Typography variant="paragraph" color="blue-gray">
            Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deleteDialog.product?.name}"</strong> không?
          </Typography>
          <Typography variant="small" color="red" className="mt-2">
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialog({ open: false, product: null })}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDelete(deleteDialog.product?.id)}
            className="flex items-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Xóa sản phẩm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profile;