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
  Select,
  Option,
  Input,
  Badge
} from "@material-tailwind/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  PlusIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import ProductService from "@/services/product/ProductService";

export function Profile() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const location = useLocation();

  // ✅ Fetch products (paginated)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProductsPaginated(page, size);
      setProducts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, size]);

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
    return text?.length > length ? text.substring(0, length) + '...' : text;
  };

  // ✅ Lọc sản phẩm theo search và status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || 
                         (statusFilter === "ACTIVE" && product.active) ||
                         (statusFilter === "INACTIVE" && !product.active);
    return matchesSearch && matchesStatus;
  });

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
            <Button color="blue" onClick={fetchProducts} className="flex items-center gap-2 mx-auto">
              <ArrowPathIcon className="h-4 w-4" />
              Thử lại
            </Button>
          </CardBody>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-xl border-0 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
          <CardBody className="p-6 lg:p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <Typography variant="h3" className="text-white font-bold mb-2">
                    Quản lý Sản phẩm
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100">
                    Quản lý {totalElements} sản phẩm trong cửa hàng của bạn
                  </Typography>
                </div>
              </div>
              <Link to="create">
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                    Tổng sản phẩm
                  </Typography>
                  <Typography variant="h4" className="text-blue-600 font-bold">
                    {totalElements}
                  </Typography>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                    Đang hoạt động
                  </Typography>
                  <Typography variant="h4" className="text-green-600 font-bold">
                    {products.filter(p => p.active).length}
                  </Typography>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <EyeIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                    Ngừng bán
                  </Typography>
                  <Typography variant="h4" className="text-red-600 font-bold">
                    {products.filter(p => !p.active).length}
                  </Typography>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                    Tổng giá trị
                  </Typography>
                  <Typography variant="h5" className="text-purple-600 font-bold">
                    {formatCurrency(products.reduce((sum, p) => sum + (p.price || 0), 0))}
                  </Typography>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Typography variant="h6" className="text-purple-600 font-bold">₫</Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="shadow-lg border-0 mb-6">
          <CardBody className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  label="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!border-t-blue-gray-200"
                />
              </div>
              <div className="flex gap-3 w-full lg:w-auto">
                <Select 
                  value={statusFilter} 
                  onChange={(value) => setStatusFilter(value)}
                  label="Trạng thái"
                  className="min-w-[150px]"
                  icon={<FunnelIcon className="h-4 w-4" />}
                >
                  <Option value="ALL">Tất cả</Option>
                  <Option value="ACTIVE">Đang bán</Option>
                  <Option value="INACTIVE">Ngừng bán</Option>
                </Select>
                
                <Select 
                  value={size} 
                  onChange={(value) => setSize(Number(value))} 
                  label="Hiển thị"
                  className="min-w-[120px]"
                >
                  <Option value={5}>5 / trang</Option>
                  <Option value={10}>10 / trang</Option>
                  {/* <Option value={20}>20 / trang</Option>
                  <Option value={50}>50 / trang</Option> */}
                </Select>

                <Tooltip content="Làm mới">
                  <IconButton variant="outlined" onClick={fetchProducts} className="h-10 w-10">
                    <ArrowPathIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Product Table */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardBody className="p-0">
            <div className="p-4 lg:p-6 bg-white border-b border-blue-gray-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <Typography variant="h5" color="blue-gray" className="font-semibold">
                  Danh sách sản phẩm
                </Typography>
                <Typography variant="small" color="gray">
                  Hiển thị {filteredProducts.length} sản phẩm
                </Typography>
              </div>
              
              {/* <Badge content={filteredProducts.length} withBorder>
                <Typography variant="small" color="blue-gray" className="font-medium">
                  Kết quả tìm kiếm
                </Typography>
              </Badge> */}
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
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 lg:p-12 text-center">
                        <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <Typography variant="h6" color="gray" className="mb-2">
                          {searchTerm || statusFilter !== "ALL" ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
                        </Typography>
                        <Typography color="gray" className="mb-4 max-w-md mx-auto">
                          {searchTerm || statusFilter !== "ALL" 
                            ? "Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc của bạn" 
                            : "Hãy thêm sản phẩm đầu tiên của bạn để bắt đầu kinh doanh"
                          }
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
                    filteredProducts.map((product, index) => (
                      <tr 
                        key={product.id}
                        className={`border-b border-blue-gray-50 transition-all duration-200 hover:bg-blue-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-gray-50/30"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={product.mainImageUrl || "/img/placeholder.png"}
                              alt={product.name}
                              size="lg"
                              className="rounded-lg border-2 border-white shadow-md"
                              variant="rounded"
                            />
                            <div className="min-w-0 flex-1">
                              <Typography variant="h6" color="blue-gray" className="font-semibold truncate">
                                {product.name}
                              </Typography>
                              <Typography variant="small" color="gray" className="flex items-center gap-1">
                                <span>ID:</span>
                                <span className="font-mono">{product.id}</span>
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Typography variant="paragraph" color="blue-gray" className="max-w-xs leading-relaxed">
                            {truncateText(product.description || 'Chưa có mô tả', 80)}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography variant="h6" color="green" className="font-bold">
                            {formatCurrency(product.price)}
                          </Typography>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <Typography variant="small" color="red" className="line-through">
                              {formatCurrency(product.originalPrice)}
                            </Typography>
                          )}
                        </td>
                        <td className="p-4">
                          <Chip
                            value={product.active ? "Đang bán" : "Ngừng bán"}
                            size="sm"
                            color={product.active ? "green" : "red"}
                            variant="gradient"
                            className="rounded-full font-medium"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-1">
                            <Tooltip content="Xem chi tiết">
                              <Link to={`${product.id}`}>
                                <IconButton variant="text" color="blue" className="hover:bg-blue-50">
                                  <EyeIcon className="h-4 w-4" />
                                </IconButton>
                              </Link>
                            </Tooltip>
                            <Tooltip content="Chỉnh sửa">
                              <Link to={`update/${product.id}`}>
                                <IconButton variant="text" color="green" className="hover:bg-green-50">
                                  <PencilIcon className="h-4 w-4" />
                                </IconButton>
                              </Link>
                            </Tooltip>
                            <Tooltip content="Xóa">
                              <IconButton
                                variant="text"
                                color="red"
                                onClick={() => setDeleteDialog({ open: true, product })}
                                className="hover:bg-red-50"
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

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 p-4 lg:p-6 bg-gray-50 border-t">
                <Typography variant="small" color="gray">
                  Hiển thị {page * size + 1}-{Math.min((page + 1) * size, totalElements)} của {totalElements} sản phẩm
                </Typography>
                <div className="flex gap-2">
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page === 0} 
                    onClick={() => setPage(0)}
                    className="flex items-center gap-1"
                  >
                    Đầu tiên
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page === 0} 
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center px-3 bg-white rounded border">
                    <Typography variant="small" className="font-medium">
                      {page + 1} / {totalPages}
                    </Typography>
                  </div>
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page + 1 >= totalPages} 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                  >
                    Sau
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page + 1 >= totalPages} 
                    onClick={() => setPage(totalPages - 1)}
                    className="flex items-center gap-1"
                  >
                    Cuối cùng
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        handler={() => setDeleteDialog({ open: false, product: null })}
        size="sm"
      >
        <DialogHeader className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 bg-red-50 rounded-full">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <Typography variant="h5" color="red">
            Xác nhận xóa
          </Typography>
        </DialogHeader>
        <DialogBody className="pt-6">
          <Typography variant="paragraph" color="blue-gray" className="mb-4">
            Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deleteDialog.product?.name}"</strong> không?
          </Typography>
          <Typography variant="small" color="red" className="flex items-center gap-1">
            <ExclamationTriangleIcon className="h-4 w-4" />
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-3 border-t pt-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialog({ open: false, product: null })}
            className="mr-auto"
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