import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Spinner,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  Select,
  Option,
  Input,
  Tabs,
  TabsHeader,
  Tab
} from "@material-tailwind/react";
import { 
  EyeIcon, 
  ArrowPathIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import OrderService from "@/services/order/OrderService";

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Danh sách trạng thái
  const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả', color: 'gray' },
    { value: 'PENDING', label: 'Chờ xác nhận', color: 'amber' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' }
  ];

  useEffect(() => {
    console.log("OrderList mounted");
    fetchOrders();
  }, []);

  // Tính toán số lượng đơn hàng theo trạng thái
  useEffect(() => {
    if (orders.length > 0) {
      const counts = {
        ALL: orders.length,
        PENDING: orders.filter(order => order.status === 'PENDING').length,
        CONFIRMED: orders.filter(order => order.status === 'CONFIRMED').length,
        COMPLETED: orders.filter(order => order.status === 'COMPLETED').length,
        CANCELLED: orders.filter(order => order.status === 'CANCELLED').length
      };
      setStatusCounts(counts);
    }
  }, [orders]);

  // Lọc đơn hàng khi searchTerm hoặc selectedStatus thay đổi
  useEffect(() => {
    let filtered = [...orders];

    // Lọc theo trạng thái
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderCode.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        order.customerPhone.toLowerCase().includes(term) ||
        order.address.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders...");
      const data = await OrderService.getAllOrders();
      console.log("Orders received:", data);
      
      const formattedOrders = Array.isArray(data) ? data.map(order => ({
        id: order.orderId,
        orderCode: `DH-${order.orderId}`,
        totalPrice: order.totalPrice || 0,
        status: order.status || 'PENDING',
        customerName: order.fullName || 'N/A',
        customerEmail: order.email || '',
        customerPhone: order.phone || '',
        address: order.address || '',
        createdAt: order.createdAt,
        orderDetails: order.orderDetails || [],
        username: order.username
      })) : [];
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || err.message || "Không thể tải danh sách đơn hàng");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      PENDING: "amber",
      CONFIRMED: "blue",
      COMPLETED: "green",
      CANCELLED: "red"
    };
    return statusMap[status] || "gray";
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy"
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <ClockIcon className="h-4 w-4" />,
      CONFIRMED: <CheckCircleIcon className="h-4 w-4" />,
      COMPLETED: <CheckCircleIcon className="h-4 w-4" />,
      CANCELLED: <XCircleIcon className="h-4 w-4" />
    };
    return icons[status] || <ClockIcon className="h-4 w-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hàm cập nhật trạng thái
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      
      console.log(`Updating order ${orderId} status to ${newStatus}`);
      await OrderService.updateOrderStatus(orderId, newStatus);
      
      // Cập nhật trạng thái trong state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      console.log('Status updated successfully');
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    setSelectedStatus("ALL");
    setSearchTerm("");
  };

  // Render nút cập nhật nhanh theo trạng thái hiện tại
  const renderQuickActionButtons = (order) => {
    const { id, status } = order;
    
    switch(status) {
      case 'PENDING':
        return (
          <div className="flex gap-1">
            <Tooltip content="Xác nhận đơn hàng">
              <IconButton
                color="blue"
                size="sm"
                variant="gradient"
                onClick={() => handleUpdateStatus(id, 'CONFIRMED')}
                disabled={updatingId === id}
              >
                <CheckCircleIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Hủy đơn hàng">
              <IconButton
                color="red"
                size="sm"
                variant="gradient"
                onClick={() => handleUpdateStatus(id, 'CANCELLED')}
                disabled={updatingId === id}
              >
                <XCircleIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
        );
      
      case 'CONFIRMED':
        return (
          <div className="flex gap-1">
            <Tooltip content="Hoàn thành đơn hàng">
              <IconButton
                color="green"
                size="sm"
                variant="gradient"
                onClick={() => handleUpdateStatus(id, 'COMPLETED')}
                disabled={updatingId === id}
              >
                <CheckCircleIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Hủy đơn hàng">
              <IconButton
                color="red"
                size="sm"
                variant="gradient"
                onClick={() => handleUpdateStatus(id, 'CANCELLED')}
                disabled={updatingId === id}
              >
                <XCircleIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
          </div>
        );
      
      case 'COMPLETED':
        return (
          <Chip
            color="green"
            value="Đã hoàn thành"
            className="px-3 py-1"
          />
        );
      
      case 'CANCELLED':
        return (
          <Chip
            color="red"
            value="Đã hủy"
            className="px-3 py-1"
          />
        );
      
      default:
        return null;
    }
  };

  // ✅ Nếu route là /create hoặc /:id → render Outlet (child routes)
  if (location.pathname.includes("/create") || location.pathname.match(/\/\d+$/)) {
    console.log("Rendering outlet for:", location.pathname);
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-12 w-12 text-blue-500" />
        <Typography variant="h6" color="blue-gray" className="mt-4">
          Đang tải danh sách đơn hàng...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <Alert 
          color="red" 
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          className="mb-4"
        >
          <Typography variant="h6" color="red">
            Lỗi khi tải dữ liệu
          </Typography>
          <Typography color="red" className="mt-2">
            {error}
          </Typography>
          <Button 
            color="red" 
            variant="text" 
            className="mt-4"
            onClick={fetchOrders}
          >
            Thử lại
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8">
      <Card className="shadow-lg">
        <CardHeader 
          variant="gradient" 
          color="blue" 
          className="mb-8 p-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingCartIcon className="h-7 w-7 text-white" />
              <div>
                <Typography variant="h4" color="white" className="font-bold">
                  Quản lý Đơn hàng
                </Typography>
                <Typography variant="small" color="white" className="opacity-90 mt-1">
                  Tổng cộng: <span className="font-semibold">{statusCounts.ALL}</span> đơn hàng
                  {selectedStatus !== 'ALL' && ` • Đang xem: ${getStatusText(selectedStatus)} (${statusCounts[selectedStatus]})`}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip content="Làm mới dữ liệu">
                <IconButton
                  color="white"
                  variant="text"
                  onClick={fetchOrders}
                  className="rounded-full hover:bg-white/20"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="px-6 pt-0 pb-2">
          {/* Bộ lọc và tìm kiếm */}
          <div className="mb-8 bg-white rounded-lg p-4 shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Tabs lọc theo trạng thái */}
              <div className="w-full md:w-auto">
                <Tabs value={selectedStatus} className="overflow-x-auto">
                  <TabsHeader className="flex flex-nowrap">
                    {STATUS_OPTIONS.map(({ value, label, color }) => (
                      <Tab 
                        key={value} 
                        value={value}
                        onClick={() => setSelectedStatus(value)}
                        className="whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          {value !== 'ALL' && (
                            <div className={`h-2 w-2 rounded-full bg-${color}-500`}></div>
                          )}
                          <span>{label}</span>
                          <Chip
                            value={statusCounts[value] || 0}
                            size="sm"
                            variant="ghost"
                            color={value === selectedStatus ? color : "gray"}
                            className="h-5 min-w-5 p-0 px-1 text-xs flex items-center justify-center"
                          />
                        </div>
                      </Tab>
                    ))}
                  </TabsHeader>
                </Tabs>
              </div>

              {/* Tìm kiếm */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <Input
                    label="Tìm kiếm mã đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<FunnelIcon className="h-5 w-5" />}
                    className="pr-10"
                  />
                  {searchTerm && (
                    <IconButton
                      variant="text"
                      size="sm"
                      className="!absolute right-1 top-1.5"
                      onClick={() => setSearchTerm("")}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              </div>

              {/* Nút reset bộ lọc */}
              {(selectedStatus !== 'ALL' || searchTerm) && (
                <Button
                  variant="outlined"
                  color="gray"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Thống kê chi tiết theo trạng thái */}
            <div className="mt-6">
              <Typography variant="small" color="blue-gray" className="font-semibold mb-3">
                📊 Thống kê đơn hàng:
              </Typography>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Tất cả
                      </Typography>
                      <Typography variant="h5" className="font-bold text-gray-800">
                        {statusCounts.ALL}
                      </Typography>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Typography variant="small" className="font-bold">
                        Σ
                      </Typography>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Chờ xác nhận
                      </Typography>
                      <Typography variant="h5" className="font-bold text-amber-700">
                        {statusCounts.PENDING}
                      </Typography>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <Typography variant="small" color="amber" className="mt-1">
                    {statusCounts.ALL > 0 ? `${((statusCounts.PENDING / statusCounts.ALL) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Đã xác nhận
                      </Typography>
                      <Typography variant="h5" className="font-bold text-blue-700">
                        {statusCounts.CONFIRMED}
                      </Typography>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <Typography variant="small" color="blue" className="mt-1">
                    {statusCounts.ALL > 0 ? `${((statusCounts.CONFIRMED / statusCounts.ALL) * 100).toFixed(1)}` : '0'}%
                  </Typography>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Hoàn thành
                      </Typography>
                      <Typography variant="h5" className="font-bold text-green-700">
                        {statusCounts.COMPLETED}
                      </Typography>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <Typography variant="small" color="green" className="mt-1">
                    {statusCounts.ALL > 0 ? `${((statusCounts.COMPLETED / statusCounts.ALL) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </div>

                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        Đã hủy
                      </Typography>
                      <Typography variant="h5" className="font-bold text-red-700">
                        {statusCounts.CANCELLED}
                      </Typography>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircleIcon className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <Typography variant="small" color="red" className="mt-1">
                    {statusCounts.ALL > 0 ? `${((statusCounts.CANCELLED / statusCounts.ALL) * 100).toFixed(1)}%` : '0%'}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCartIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <Typography variant="h5" color="blue-gray" className="mb-2">
                {selectedStatus !== 'ALL' || searchTerm ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng nào"}
              </Typography>
              <Typography color="gray" className="mb-6 max-w-md mx-auto">
                {selectedStatus !== 'ALL' || searchTerm 
                  ? "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  : "Hiện tại chưa có đơn hàng nào được tạo trong hệ thống"}
              </Typography>
              {(selectedStatus !== 'ALL' || searchTerm) && (
                <Button
                  color="blue"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 mx-auto"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Xem tất cả đơn hàng
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Tóm tắt nhanh */}
              <div className="mb-8">
                <Typography variant="h6" color="blue-gray" className="font-bold mb-4">
                  📋 Danh sách đơn hàng ({filteredOrders.length}/{orders.length})
                </Typography>
                
                <div className="flex flex-wrap gap-3">
                  {STATUS_OPTIONS.filter(option => option.value !== 'ALL').map(({ value, label, color }) => (
                    <Chip 
                      key={value}
                      color={color}
                      className="px-4 py-2"
                      value={
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full bg-${color}-500`}></div>
                          <span>{label}: {statusCounts[value]}</span>
                          {statusCounts.ALL > 0 && (
                            <span className="text-xs opacity-75">
                              ({((statusCounts[value] / statusCounts.ALL) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] table-auto">
                  <thead>
                    <tr className="border-b border-blue-gray-100 bg-blue-gray-50/50">
                      {["Mã đơn", "Khách hàng", "Ngày đặt", "Tổng tiền", "Trạng thái", "Thao tác", "Chi tiết"].map((el) => (
                        <th key={el} className="py-4 px-6 text-left">
                          <Typography 
                            variant="small" 
                            className="text-xs font-bold uppercase text-blue-gray-700"
                          >
                            {el}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => {
                      const isUpdating = updatingId === order.id;
                      
                      return (
                        <tr 
                          key={order.id} 
                          className={`
                            border-b border-blue-gray-50 
                            hover:bg-blue-50/30 
                            transition-all duration-200
                            ${index % 2 === 0 ? 'bg-blue-gray-50/30' : 'bg-white'}
                            ${isUpdating ? 'opacity-50' : ''}
                          `}
                        >
                          {/* Mã đơn hàng */}
                          <td className="py-5 px-6">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-700">
                                  <ShoppingCartIcon className="h-4 w-4" />
                                </div>
                                <Typography variant="small" className="font-bold text-blue-gray-900">
                                  {order.orderCode}
                                </Typography>
                              </div>
                              <Typography variant="small" className="text-xs text-blue-gray-500 mt-1">
                                ID: {order.id}
                              </Typography>
                            </div>
                          </td>
                          
                          {/* Thông tin khách hàng */}
                          <td className="py-5 px-6">
                            <div className="flex items-start gap-3">
                              <Avatar
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.customerName)}&background=random`}
                                alt={order.customerName}
                                size="sm"
                                className="border border-blue-gray-100"
                              />
                              <div className="flex flex-col">
                                <Typography variant="small" className="font-semibold text-blue-gray-900">
                                  {order.customerName}
                                </Typography>
                                <Typography variant="small" className="text-xs text-blue-gray-600">
                                  {order.customerEmail}
                                </Typography>
                                <div className="flex items-center gap-1 mt-1">
                                  <Typography variant="small" className="text-xs text-blue-gray-500">
                                    📞 {order.customerPhone}
                                  </Typography>
                                </div>
                                {order.username && (
                                  <Typography variant="small" className="text-xs text-blue-gray-400 mt-1">
                                    @{order.username}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Ngày đặt */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4 text-blue-gray-400" />
                              <div className="flex flex-col">
                                <Typography variant="small" className="font-medium text-blue-gray-900">
                                  {formatDate(order.createdAt)}
                                </Typography>
                                {order.createdAt && (
                                  <Typography variant="small" className="text-xs text-blue-gray-500">
                                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Tổng tiền */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                              <Typography 
                                variant="small" 
                                className="font-bold text-green-700 text-base"
                              >
                                {formatCurrency(order.totalPrice)}
                              </Typography>
                            </div>
                            {order.orderDetails && order.orderDetails.length > 0 && (
                              <Typography variant="small" className="text-xs text-blue-gray-500 mt-1">
                                {order.orderDetails.length} sản phẩm
                              </Typography>
                            )}
                          </td>
                          
                          {/* Trạng thái */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full bg-${getStatusColor(order.status)}-500`}></div>
                              <Typography 
                                variant="small" 
                                className={`font-medium text-${getStatusColor(order.status)}-700`}
                              >
                                {getStatusText(order.status)}
                              </Typography>
                            </div>
                          </td>
                          
                          {/* Thao tác cập nhật trạng thái */}
                          <td className="py-5 px-6">
                            <div className="flex flex-col gap-2">
                              {isUpdating ? (
                                <div className="flex items-center gap-2">
                                  <Spinner className="h-4 w-4" />
                                  <Typography variant="small" color="blue-gray">
                                    Đang cập nhật...
                                  </Typography>
                                </div>
                              ) : (
                                <>
                                  {renderQuickActionButtons(order)}
                                  
                                  {/* Dropdown chọn trạng thái */}
                                  <div className="mt-2">
                                    <Select
                                      size="sm"
                                      label="Chọn trạng thái"
                                      value={order.status}
                                      onChange={(value) => handleUpdateStatus(order.id, value)}
                                      disabled={isUpdating}
                                    >
                                      {STATUS_OPTIONS.filter(option => option.value !== 'ALL').map(option => (
                                        <Option 
                                          key={option.value} 
                                          value={option.value}
                                          className={`text-${option.color}-700`}
                                        >
                                          {option.label}
                                        </Option>
                                      ))}
                                    </Select>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          
                          {/* Link sang xem chi tiết */}
                          <td className="py-5 px-6">
                            <div className="flex justify-start">
                              <Link to={`${order.id}`}>
                                <Button
                                  color="blue"
                                  size="sm"
                                  variant="outlined"
                                  className="flex items-center gap-2"
                                  disabled={isUpdating}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  Xem chi tiết
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Footer với thống kê chi tiết */}
              <div className="px-6 py-4 border-t border-blue-gray-100 bg-blue-gray-50/50 mt-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                      📈 Tổng hợp:
                    </Typography>
                    <div className="flex flex-wrap gap-3">
                      <Chip
                        color="blue"
                        value={`Hiển thị: ${filteredOrders.length}/${orders.length} đơn hàng`}
                        className="px-3"
                      />
                      <Chip
                        color="green"
                        value={`Tổng doanh thu: ${formatCurrency(filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0))}`}
                        className="px-3"
                      />
                      {selectedStatus !== 'ALL' && (
                        <Chip
                          color="amber"
                          value={`Đang lọc: ${getStatusText(selectedStatus)}`}
                          className="px-3"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Tooltip content="Làm mới dữ liệu">
                      <IconButton
                        color="blue"
                        variant="text"
                        size="sm"
                        className="rounded-full"
                        onClick={fetchOrders}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                    {(selectedStatus !== 'ALL' || searchTerm) && (
                      <Button
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={handleResetFilters}
                        className="flex items-center gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Outlet để render OrderDetail */}
      <Outlet />
    </div>
  );
}

export default OrderList;