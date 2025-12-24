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
  Tab,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem
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
  XMarkIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
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
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Status list
  const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All', color: 'gray' },
    { value: 'PENDING', label: 'Pending confirmation', color: 'amber' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
    { value: 'COMPLETED', label: 'Completed', color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
  ];

  // Sort options
  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First', icon: <ArrowDownIcon className="h-4 w-4" /> },
    { value: 'oldest', label: 'Oldest First', icon: <ArrowUpIcon className="h-4 w-4" /> }
  ];

  useEffect(() => {
    console.log("OrderList mounted");
    fetchOrders();
  }, []);

  // Calculate order counts by status
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

  // Filter and sort orders when searchTerm, selectedStatus, or sortOrder changes
  useEffect(() => {
    let filtered = [...orders];

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Filter by search keyword
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

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchTerm, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching orders...");
      const data = await OrderService.getAllOrders();
      console.log("Orders received:", data);
      
      const formattedOrders = Array.isArray(data) ? data.map(order => ({
        id: order.orderId,
        orderCode: `ORD-${order.orderId}`,
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
      
      // Sort by newest first initially
      formattedOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || err.message || "Unable to load order list");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra logic chuyển đổi trạng thái
  const canChangeStatus = (currentStatus, newStatus) => {
    // Logic chuyển đổi trạng thái hợp lệ
    const allowedTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Không thể chuyển từ COMPLETED sang trạng thái khác
      CANCELLED: []  // Không thể chuyển từ CANCELLED sang trạng thái khác
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
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
      PENDING: "Pending confirmation",
      CONFIRMED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled"
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Function to update status
  const handleUpdateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      console.log("Order not found");
      return;
    }

    // Kiểm tra logic chuyển đổi
    if (!canChangeStatus(order.status, newStatus)) {
      const currentStatusText = getStatusText(order.status);
      const newStatusText = getStatusText(newStatus);
      console.log(
        `Cannot change order status from "${currentStatusText}" to "${newStatusText}"\n\n` +
        `Valid transitions:\n` +
        `• PENDING → CONFIRMED, CANCELLED\n` +
        `• CONFIRMED → COMPLETED, CANCELLED\n` +
        `• COMPLETED → (No further changes)\n` +
        `• CANCELLED → (No further changes)`
      );
      return;
    }

    // Xác nhận trước khi thay đổi
    if (!window.confirm(`Are you sure you want to change order status from "${getStatusText(order.status)}" to "${getStatusText(newStatus)}"?`)) {
      return;
    }

    try {
      setUpdatingId(orderId);
      await OrderService.updateOrderStatus(orderId, newStatus);

      // Cập nhật state
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );

      // Hiển thị thông báo thành công
      alert(`✅ Order status updated successfully!\nFrom: ${getStatusText(order.status)}\nTo: ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error("Update status failed:", err);
      alert(`❌ Update status failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedStatus("ALL");
    setSearchTerm("");
    setSortOrder("newest");
  };

  // Render quick update buttons based on current status
  const renderQuickActionButtons = (order) => {
    const { id, status } = order;

    // Chỉ hiển thị nút cho trạng thái có thể thay đổi
    if (status === "COMPLETED" || status === "CANCELLED") {
      return (
        <Chip 
          color={status === "COMPLETED" ? "green" : "red"} 
          value={status === "COMPLETED" ? "Completed" : "Cancelled"}
          icon={status === "COMPLETED" ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
        />
      );
    }

    // PENDING chỉ có thể chuyển sang CONFIRMED hoặc CANCELLED
    if (status === "PENDING") {
      return (
        <div className="flex gap-1">
          <Tooltip content="Confirm order">
            <IconButton
              color="green"
              size="sm"
              onClick={() => handleUpdateStatus(id, "CONFIRMED")}
            >
              <CheckCircleIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Cancel order">
            <IconButton
              color="red"
              size="sm"
              onClick={() => handleUpdateStatus(id, "CANCELLED")}
            >
              <XCircleIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      );
    }

    // CONFIRMED chỉ có thể chuyển sang COMPLETED hoặc CANCELLED
    if (status === "CONFIRMED") {
      return (
        <div className="flex gap-1">
          <Tooltip content="Mark as completed">
            <IconButton
              color="green"
              size="sm"
              onClick={() => handleUpdateStatus(id, "COMPLETED")}
            >
              <CheckCircleIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Cancel order">
            <IconButton
              color="red"
              size="sm"
              onClick={() => handleUpdateStatus(id, "CANCELLED")}
            >
              <XCircleIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      );
    }

    return null;
  };

  // Get current sort label
  const getCurrentSortLabel = () => {
    return SORT_OPTIONS.find(option => option.value === sortOrder)?.label || "Sort by";
  };

  // Get current sort icon
  const getCurrentSortIcon = () => {
    return SORT_OPTIONS.find(option => option.value === sortOrder)?.icon || <ChevronDownIcon className="h-4 w-4" />;
  };

  // Helper function for text colors
  const getStatusTextColor = (status) => {
    const colorMap = {
      PENDING: "text-amber-700",
      CONFIRMED: "text-blue-700",
      COMPLETED: "text-green-700",
      CANCELLED: "text-red-700"
    };
    return colorMap[status] || "text-gray-700";
  };

  // Helper function for disabled status style
  const getDisabledStatusStyle = (status) => {
    return status === "COMPLETED" || status === "CANCELLED" 
      ? "opacity-70 cursor-not-allowed" 
      : "";
  };

  // ✅ If route is /create or /:id → render Outlet (child routes)
  if (location.pathname.includes("/create") || location.pathname.match(/\/\d+$/)) {
    console.log("Rendering outlet for:", location.pathname);
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-12 w-12 text-blue-500" />
        <Typography variant="h6" color="blue-gray" className="mt-4">
          Loading order list...
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
            Error loading data
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
            Try again
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
                  Order Management
                </Typography>
                <Typography variant="small" color="white" className="opacity-90 mt-1">
                  Total: <span className="font-semibold">{statusCounts.ALL}</span> orders
                  {selectedStatus !== 'ALL' && ` • Viewing: ${getStatusText(selectedStatus)} (${statusCounts[selectedStatus]})`}
                  {sortOrder !== 'newest' && ` • Sorted: ${getCurrentSortLabel()}`}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip content="Refresh data">
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
          {/* Filter and search */}
          <div className="mb-8 bg-white rounded-lg p-4 shadow-md">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Status filter tabs */}
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

              {/* Search and Sort Controls */}
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* Sort Menu */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="outlined"
                      color="blue-gray"
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      {getCurrentSortIcon()}
                      {getCurrentSortLabel()}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </MenuHandler>
                  <MenuList>
                    {SORT_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => setSortOrder(option.value)}
                        className="flex items-center gap-2"
                      >
                        {option.icon}
                        {option.label}
                        {sortOrder === option.value && (
                          <CheckCircleIcon className="h-4 w-4 ml-auto text-green-500" />
                        )}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Search */}
                <div className="w-full md:w-64">
                  <div className="relative">
                    <Input
                      label="Search order code..."
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

                {/* Reset filter button */}
                {(selectedStatus !== 'ALL' || searchTerm || sortOrder !== 'newest') && (
                  <Button
                    variant="outlined"
                    color="gray"
                    size="sm"
                    onClick={handleResetFilters}
                    className="flex items-center gap-2"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            {/* Detailed statistics by status */}
            <div className="mt-6">
              <Typography variant="small" color="blue-gray" className="font-semibold mb-3">
                📊 Order statistics:
              </Typography>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-bold">
                        All
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
                        Pending confirmation
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
                        Confirmed
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
                        Completed
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
                        Cancelled
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

            {/* Sort indicator */}
            <div className="mt-4 flex items-center justify-between">
              <Typography variant="small" color="blue-gray" className="font-medium">
                Currently sorted: <span className="font-bold">{getCurrentSortLabel()}</span>
              </Typography>
              {sortOrder === 'newest' && (
                <Chip
                  value="Most Recent First"
                  color="blue"
                  size="sm"
                  className="flex items-center gap-1"
                  icon={<ArrowDownIcon className="h-4 w-4" />}
                />
              )}
              {sortOrder === 'oldest' && (
                <Chip
                  value="Oldest First"
                  color="amber"
                  size="sm"
                  className="flex items-center gap-1"
                  icon={<ArrowUpIcon className="h-4 w-4" />}
                />
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCartIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <Typography variant="h5" color="blue-gray" className="mb-2">
                {selectedStatus !== 'ALL' || searchTerm ? "No matching orders found" : "No orders yet"}
              </Typography>
              <Typography color="gray" className="mb-6 max-w-md mx-auto">
                {selectedStatus !== 'ALL' || searchTerm 
                  ? "Try changing filters or search keywords"
                  : "No orders have been created in the system yet"}
              </Typography>
              {(selectedStatus !== 'ALL' || searchTerm) && (
                <Button
                  color="blue"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 mx-auto"
                >
                  <XMarkIcon className="h-4 w-4" />
                  View all orders
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Quick summary */}
              <div className="mb-8">
                <Typography variant="h6" color="blue-gray" className="font-bold mb-4">
                  📋 Order list ({filteredOrders.length}/{orders.length})
                  {sortOrder !== 'newest' && (
                    <span className="ml-2 text-sm font-normal text-amber-600">
                      (Sorted: {getCurrentSortLabel()})
                    </span>
                  )}
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
                      {["Order Code", "Customer", "Order Date", "Total Amount", "Status", "Actions", "Details"].map((el) => (
                        <th key={el} className="py-4 px-6 text-left">
                          <Typography 
                            variant="small" 
                            className="text-xs font-bold uppercase text-blue-gray-700"
                          >
                            {el}
                            {el === "Order Date" && (
                              <div className="inline-block ml-2">
                                {sortOrder === 'newest' ? (
                                  <ArrowDownIcon className="h-3 w-3 text-blue-500 inline" />
                                ) : (
                                  <ArrowUpIcon className="h-3 w-3 text-amber-500 inline" />
                                )}
                              </div>
                            )}
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
                          {/* Order code */}
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
                          
                          {/* Customer information */}
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
                          
                          {/* Order date */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4 text-blue-gray-400" />
                              <div className="flex flex-col">
                                <Typography variant="small" className="font-medium text-blue-gray-900">
                                  {formatDate(order.createdAt)}
                                </Typography>
                                {order.createdAt && (
                                  <Typography variant="small" className="text-xs text-blue-gray-500">
                                    {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          {/* Total amount */}
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
                                {order.orderDetails.length} products
                              </Typography>
                            )}
                          </td>
                          
                          {/* Status */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full bg-${getStatusColor(order.status)}-500`}></div>
                              <Typography 
                                variant="small" 
                                className={getStatusTextColor(order.status)}
                              >
                                {getStatusText(order.status)}
                              </Typography>
                            </div>
                          </td>
                          
                          {/* Status update actions */}
                          <td className="py-5 px-6">
                            <div className="flex flex-col gap-2">
                              {isUpdating ? (
                                <div className="flex items-center gap-2">
                                  <Spinner className="h-4 w-4" />
                                  <Typography variant="small" color="blue-gray">
                                    Updating...
                                  </Typography>
                                </div>
                              ) : (
                                <>
                                  {renderQuickActionButtons(order)}
                                  
                                  {/* Status selection dropdown */}
                                  <div className="mt-2">
                                    <Select
                                      size="sm"
                                      label="Select status"
                                      value={order.status}
                                      onChange={(value) => handleUpdateStatus(order.id, value)}
                                      disabled={isUpdating || order.status === "COMPLETED" || order.status === "CANCELLED"}
                                    >
                                      <Option 
                                        value={order.status}
                                        className={getStatusTextColor(order.status)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`h-2 w-2 rounded-full bg-${getStatusColor(order.status)}-500`}></div>
                                          <span>Current: {getStatusText(order.status)}</span>
                                        </div>
                                      </Option>
                                      {STATUS_OPTIONS
                                        .filter(option => 
                                          option.value !== 'ALL' && 
                                          option.value !== order.status &&
                                          canChangeStatus(order.status, option.value)
                                        )
                                        .map(option => (
                                          <Option 
                                            key={option.value} 
                                            value={option.value}
                                            className={getStatusTextColor(option.value)}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className={`h-2 w-2 rounded-full bg-${option.color}-500`}></div>
                                              <span>Change to: {option.label}</span>
                                            </div>
                                          </Option>
                                      ))}
                                    </Select>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          
                          {/* Link to view details */}
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
                                  View details
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
              
              {/* Footer with detailed statistics */}
              <div className="px-6 py-4 border-t border-blue-gray-100 bg-blue-gray-50/50 mt-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                      📈 Summary:
                    </Typography>
                    <div className="flex flex-wrap gap-3">
                      <Chip
                        color="blue"
                        value={`Showing: ${filteredOrders.length}/${orders.length} orders`}
                        className="px-3"
                      />
                      <Chip
                        color="green"
                        value={`Total revenue: ${formatCurrency(filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0))}`}
                        className="px-3"
                      />
                      <Chip
                        color="purple"
                        value={`Sorted: ${getCurrentSortLabel()}`}
                        className="px-3"
                      />
                      {selectedStatus !== 'ALL' && (
                        <Chip
                          color="amber"
                          value={`Filtered: ${getStatusText(selectedStatus)}`}
                          className="px-3"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Menu>
                      <MenuHandler>
                        <Button
                          variant="outlined"
                          color="blue-gray"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {getCurrentSortIcon()}
                          Sort
                          <ChevronDownIcon className="h-4 w-4" />
                        </Button>
                      </MenuHandler>
                      <MenuList>
                        {SORT_OPTIONS.map((option) => (
                          <MenuItem
                            key={option.value}
                            onClick={() => setSortOrder(option.value)}
                            className="flex items-center gap-2"
                          >
                            {option.icon}
                            {option.label}
                            {sortOrder === option.value && (
                              <CheckCircleIcon className="h-4 w-4 ml-auto text-green-500" />
                            )}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>

                    <Tooltip content="Refresh data">
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
                    {(selectedStatus !== 'ALL' || searchTerm || sortOrder !== 'newest') && (
                      <Button
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={handleResetFilters}
                        className="flex items-center gap-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Clear filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Outlet to render OrderDetail */}
      <Outlet />
    </div>
  );
}

export default OrderList;