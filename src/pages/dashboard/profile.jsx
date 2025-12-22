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
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
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
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // ✅ When adding new from Create page
  useEffect(() => {
    if (location.state?.newProduct) {
      setProducts((prev) => [location.state.newProduct, ...prev]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Delete product function
  const handleDelete = async (id) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteDialog({ open: false, product: null });
    } catch (err) {
      alert("Error deleting product: " + err);
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

  // ✅ Filter products by search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || 
                         (statusFilter === "ACTIVE" && product.active) ||
                         (statusFilter === "INACTIVE" && !product.active);
    return matchesSearch && matchesStatus;
  });

  // ✅ When clicking Edit or Create → render Outlet
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
            Loading products...
          </Typography>
          <Typography variant="small" color="gray">
            Please wait a moment
          </Typography>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-11/12 sm:w-96 shadow-xl border border-red-200">
          <CardBody className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Typography variant="h5" color="red" className="mb-2">
              An error occurred
            </Typography>
            <Typography color="gray" className="mb-4">
              {error}
            </Typography>
            <Button color="blue" onClick={fetchProducts} className="flex items-center gap-2 mx-auto">
              <ArrowPathIcon className="h-4 w-4" />
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-xl border-0 mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
          <CardBody className="p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6 relative z-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                  <ShoppingBagIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <Typography variant="h4" className="text-white font-bold mb-1 sm:mb-2 text-lg sm:text-2xl lg:text-3xl">
                    Product Management
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100 text-xs sm:text-sm">
                    Manage {totalElements} products in your store
                  </Typography>
                </div>
              </div>
              <Link to="create" className="w-full sm:w-auto">
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold shadow-md w-full sm:w-auto"
                  size={isMobile ? "md" : "lg"}
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Add Product</span>
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1 text-xs sm:text-sm">
                    Total Products
                  </Typography>
                  <Typography variant="h4" className="text-blue-600 font-bold text-lg sm:text-xl lg:text-2xl">
                    {totalElements}
                  </Typography>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                  <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1 text-xs sm:text-sm">
                    Active
                  </Typography>
                  <Typography variant="h4" className="text-green-600 font-bold text-lg sm:text-xl lg:text-2xl">
                    {products.filter(p => p.active).length}
                  </Typography>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                  <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1 text-xs sm:text-sm">
                    Inactive
                  </Typography>
                  <Typography variant="h4" className="text-red-600 font-bold text-lg sm:text-xl lg:text-2xl">
                    {products.filter(p => !p.active).length}
                  </Typography>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
                  <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
            <CardBody className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" color="blue-gray" className="font-medium mb-1 text-xs sm:text-sm">
                    Total Value
                  </Typography>
                  <Typography variant="h5" className="text-purple-600 font-bold text-base sm:text-lg lg:text-xl">
                    {formatCurrency(products.reduce((sum, p) => sum + (p.price || 0), 0))}
                  </Typography>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                  <Typography variant="h6" className="text-purple-600 font-bold text-sm sm:text-base">₫</Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="shadow-lg border-0 mb-4 sm:mb-6">
          <CardBody className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Input
                  icon={<MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!border-t-blue-gray-200 text-sm sm:text-base"
                  size={isMobile ? "md" : "lg"}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Select 
                  value={statusFilter} 
                  onChange={(value) => setStatusFilter(value)}
                  label="Status"
                  className="min-w-full sm:min-w-[150px]"
                  icon={<FunnelIcon className="h-4 w-4" />}
                  size={isMobile ? "md" : "lg"}
                >
                  <Option value="ALL">All</Option>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                </Select>
                
                <Select 
                  value={size} 
                  onChange={(value) => setSize(Number(value))} 
                  label="Show"
                  className="min-w-full sm:min-w-[120px]"
                  size={isMobile ? "md" : "lg"}
                >
                  <Option value={5}>5 per page</Option>
                  <Option value={10}>10 per page</Option>
                  <Option value={20}>20 per page</Option>
                  <Option value={50}>50 per page</Option>
                </Select>

                <div className="flex justify-center sm:justify-start">
                  <Tooltip content="Refresh">
                    <IconButton 
                      variant="outlined" 
                      onClick={fetchProducts} 
                      className="h-10 w-10 sm:h-12 sm:w-12"
                      size={isMobile ? "md" : "lg"}
                    >
                      <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Product Table/Grid */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardBody className="p-0">
            <div className="p-3 sm:p-4 lg:p-6 bg-white border-b border-blue-gray-50 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              <div>
                <Typography variant="h5" color="blue-gray" className="font-semibold text-lg sm:text-xl">
                  Product List
                </Typography>
                <Typography variant="small" color="gray" className="text-xs sm:text-sm">
                  Showing {filteredProducts.length} products
                </Typography>
              </div>
            </div>
            
            {/* Mobile View - Card Layout */}
            {isMobile && (
              <div className="p-3 sm:p-4 space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <Typography variant="h6" color="gray" className="mb-2 text-sm">
                      {searchTerm || statusFilter !== "ALL" ? "No matching products found" : "No products yet"}
                    </Typography>
                    <Typography color="gray" className="mb-4 text-xs">
                      {searchTerm || statusFilter !== "ALL" 
                        ? "Try adjusting your search keyword or filter" 
                        : "Add your first product to start your business"
                      }
                    </Typography>
                    <Link to="create">
                      <Button color="blue" size="sm" className="flex items-center gap-2 mx-auto">
                        <PlusIcon className="h-3 w-3" />
                        Add Product
                      </Button>
                    </Link>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Card key={product.id} className="border border-blue-gray-100 shadow-sm">
                      <CardBody className="p-3">
                        <div className="flex gap-3">
                          <Avatar
                            src={product.mainImageUrl || "/img/placeholder.png"}
                            alt={product.name}
                            size="lg"
                            className="rounded-lg border border-white shadow-sm flex-shrink-0"
                            variant="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <Typography variant="h6" color="blue-gray" className="font-semibold text-sm truncate">
                                {product.name}
                              </Typography>
                              <Chip
                                value={product.active ? "Active" : "Inactive"}
                                size="sm"
                                color={product.active ? "green" : "red"}
                                className="rounded-full text-xs"
                              />
                            </div>
                            <Typography variant="small" color="gray" className="mb-2 text-xs line-clamp-2">
                              {truncateText(product.description || 'No description', 60)}
                            </Typography>
                            <div className="flex justify-between items-center">
                              <Typography variant="h6" color="green" className="font-bold text-sm">
                                {formatCurrency(product.price)}
                              </Typography>
                              <div className="flex gap-1">
                                <Tooltip content="View details">
                                  <Link to={`${product.id}`}>
                                    <IconButton variant="text" color="blue" size="sm">
                                      <EyeIcon className="h-3.5 w-3.5" />
                                    </IconButton>
                                  </Link>
                                </Tooltip>
                                <Tooltip content="Edit">
                                  <Link to={`update/${product.id}`}>
                                    <IconButton variant="text" color="green" size="sm">
                                      <PencilIcon className="h-3.5 w-3.5" />
                                    </IconButton>
                                  </Link>
                                </Tooltip>
                                <Tooltip content="Delete">
                                  <IconButton
                                    variant="text"
                                    color="red"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ open: true, product })}
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Desktop View - Table Layout */}
            {!isMobile && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <th className="p-3 sm:p-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          PRODUCT
                        </Typography>
                      </th>
                      <th className="p-3 sm:p-4 text-left hidden lg:table-cell">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          DESCRIPTION
                        </Typography>
                      </th>
                      <th className="p-3 sm:p-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          PRICE
                        </Typography>
                      </th>
                      <th className="p-3 sm:p-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          STATUS
                        </Typography>
                      </th>
                      <th className="p-3 sm:p-4 text-center">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          ACTIONS
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 lg:p-8 text-center">
                          <ShoppingBagIcon className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-3" />
                          <Typography variant="h6" color="gray" className="mb-2">
                            {searchTerm || statusFilter !== "ALL" ? "No matching products found" : "No products yet"}
                          </Typography>
                          <Typography color="gray" className="mb-4 max-w-md mx-auto">
                            {searchTerm || statusFilter !== "ALL" 
                              ? "Try adjusting your search keyword or filter" 
                              : "Add your first product to start your business"
                            }
                          </Typography>
                          <Link to="create">
                            <Button color="blue" className="flex items-center gap-2 mx-auto">
                              <PlusIcon className="h-4 w-4" />
                              Add Product
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
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={product.mainImageUrl || "/img/placeholder.png"}
                                alt={product.name}
                                size="md"
                                className="rounded-lg border border-white shadow-sm"
                                variant="rounded"
                              />
                              <div className="min-w-0 flex-1">
                                <Typography variant="h6" color="blue-gray" className="font-semibold truncate text-sm">
                                  {product.name}
                                </Typography>
                                <Typography variant="small" color="gray" className="flex items-center gap-1 text-xs">
                                  <span>ID:</span>
                                  <span className="font-mono">{product.id}</span>
                                </Typography>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 hidden lg:table-cell">
                            <Typography variant="paragraph" color="blue-gray" className="max-w-xs line-clamp-2 text-sm">
                              {product.description || 'No description'}
                            </Typography>
                          </td>
                          <td className="p-3 sm:p-4">
                            <Typography variant="h6" color="green" className="font-bold text-sm">
                              {formatCurrency(product.price)}
                            </Typography>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <Typography variant="small" color="red" className="line-through text-xs">
                                {formatCurrency(product.originalPrice)}
                              </Typography>
                            )}
                          </td>
                          <td className="p-3 sm:p-4">
                            <Chip
                              value={product.active ? "Active" : "Inactive"}
                              size="sm"
                              color={product.active ? "green" : "red"}
                              variant="gradient"
                              className="rounded-full font-medium text-xs"
                            />
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex justify-center gap-1">
                              <Tooltip content="View details">
                                <Link to={`${product.id}`}>
                                  <IconButton variant="text" color="blue" size="sm" className="hover:bg-blue-50">
                                    <EyeIcon className="h-4 w-4" />
                                  </IconButton>
                                </Link>
                              </Tooltip>
                              <Tooltip content="Edit">
                                <Link to={`update/${product.id}`}>
                                  <IconButton variant="text" color="green" size="sm" className="hover:bg-green-50">
                                    <PencilIcon className="h-4 w-4" />
                                  </IconButton>
                                </Link>
                              </Tooltip>
                              <Tooltip content="Delete">
                                <IconButton
                                  variant="text"
                                  color="red"
                                  size="sm"
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
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 sm:p-4 lg:p-6 bg-gray-50 border-t">
                <Typography variant="small" color="gray" className="text-xs sm:text-sm">
                  Showing {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of {totalElements} products
                </Typography>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page === 0} 
                    onClick={() => setPage(0)}
                    className="flex items-center gap-1 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <ChevronDoubleLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    {!isMobile && "First"}
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page === 0} 
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    className="px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    {!isMobile && "Previous"}
                  </Button>
                  <div className="flex items-center px-2 sm:px-3 bg-white rounded border">
                    <Typography variant="small" className="font-medium text-xs sm:text-sm">
                      {page + 1} / {totalPages}
                    </Typography>
                  </div>
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page + 1 >= totalPages} 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                    className="px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    {!isMobile && "Next"}
                    <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="sm"
                    disabled={page + 1 >= totalPages} 
                    onClick={() => setPage(totalPages - 1)}
                    className="flex items-center gap-1 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    {!isMobile && "Last"}
                    <ChevronDoubleRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
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
        size={isMobile ? "xs" : "sm"}
      >
        <DialogHeader className="flex items-center gap-2 sm:gap-3 border-b pb-3 sm:pb-4">
          <div className="p-1.5 sm:p-2 bg-red-50 rounded-full">
            <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          </div>
          <Typography variant="h5" color="red" className="text-lg sm:text-xl">
            Confirm Deletion
          </Typography>
        </DialogHeader>
        <DialogBody className="pt-4 sm:pt-6">
          <Typography variant="paragraph" color="blue-gray" className="mb-3 sm:mb-4 text-sm sm:text-base">
            Are you sure you want to delete the product <strong>"{deleteDialog.product?.name}"</strong>?
          </Typography>
          <Typography variant="small" color="red" className="flex items-center gap-1 text-xs sm:text-sm">
            <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            This action cannot be undone.
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-2 sm:gap-3 border-t pt-3 sm:pt-4">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialog({ open: false, product: null })}
            className="mr-auto text-xs sm:text-sm"
            size={isMobile ? "sm" : "md"}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDelete(deleteDialog.product?.id)}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            size={isMobile ? "sm" : "md"}
          >
            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            Delete Product
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Profile;