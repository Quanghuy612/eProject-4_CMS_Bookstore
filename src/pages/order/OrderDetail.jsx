import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Spinner,
  Alert,
  Avatar,
  IconButton,
  Tooltip
} from "@material-tailwind/react";
import { 
  ArrowLeftIcon, 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import OrderService from "@/services/order/OrderService";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    console.log("Fetching order detail for ID:", id);
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrderDetail(id);
      console.log("Order detail received:", data);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError(err.response?.data?.message || err.message || "Unable to load order details");
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra logic chuyển đổi trạng thái
  const canChangeStatus = (currentStatus, newStatus) => {
    const allowedTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    };
    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending confirmation', color: 'amber' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
    { value: 'COMPLETED', label: 'Completed', color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
  ];

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
      PENDING: <ClockIcon className="h-5 w-5" />,
      CONFIRMED: <CheckCircleIcon className="h-5 w-5" />,
      COMPLETED: <CheckCircleIcon className="h-5 w-5" />,
      CANCELLED: <XCircleIcon className="h-5 w-5" />
    };
    return icons[status] || <ClockIcon className="h-5 w-5" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!order) return;
    
    // Kiểm tra nếu trạng thái hiện tại giống trạng thái mới
    if (order.status === newStatus) {
      alert(`Order status is already "${getStatusText(newStatus)}"`);
      return;
    }

    // Kiểm tra logic chuyển đổi
    if (!canChangeStatus(order.status, newStatus)) {
      const currentStatusText = getStatusText(order.status);
      const newStatusText = getStatusText(newStatus);
      alert(
        `❌ Cannot change order status from "${currentStatusText}" to "${newStatusText}"\n\n` +
        `Valid transitions:\n` +
        `• PENDING → CONFIRMED, CANCELLED\n` +
        `• CONFIRMED → COMPLETED, CANCELLED\n` +
        `• COMPLETED → (No further changes)\n` +
        `• CANCELLED → (No further changes)`
      );
      return;
    }

    // Xác nhận trước khi thay đổi
    const confirmMessage = `Are you sure you want to change order status from "${getStatusText(order.status)}" to "${getStatusText(newStatus)}"?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setUpdatingStatus(true);
      console.log(`Updating order ${id} status to ${newStatus}`);
      
      await OrderService.updateOrderStatus(id, newStatus);
      
      // Cập nhật state
      setOrder(prev => ({
        ...prev,
        status: newStatus
      }));
      
      // Hiển thị thông báo thành công
      alert(`✅ Order status updated successfully!\nFrom: ${getStatusText(order.status)}\nTo: ${getStatusText(newStatus)}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`❌ Update status failed: ${err.response?.data?.message || err.message || "Unknown error"}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderStatusActions = () => {
    if (!order) return null;
    
    const { status } = order;
    
    // Nếu đã hoàn thành hoặc đã hủy, hiển thị thông báo
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      const isCompleted = status === 'COMPLETED';
      return (
        <div className="text-center py-4">
          {isCompleted ? (
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
          ) : (
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
          )}
          <Typography variant="h6" color={isCompleted ? "green" : "red"}>
            Order {isCompleted ? "completed" : "cancelled"}
          </Typography>
          <Typography variant="small" color="gray">
            Status cannot be changed
          </Typography>
        </div>
      );
    }

    // Hiển thị nút hành động hợp lệ
    if (status === 'PENDING') {
      return (
        <div className="space-y-2">
          <Button
            color="green"
            fullWidth
            onClick={() => handleUpdateStatus('CONFIRMED')}
            disabled={updatingStatus}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Confirm order
          </Button>
          <Button
            color="red"
            variant="outlined"
            fullWidth
            onClick={() => handleUpdateStatus('CANCELLED')}
            disabled={updatingStatus}
            className="flex items-center justify-center gap-2"
          >
            <XCircleIcon className="h-5 w-5" />
            Cancel order
          </Button>
        </div>
      );
    }
    
    if (status === 'CONFIRMED') {
      return (
        <div className="space-y-2">
          <Button
            color="green"
            fullWidth
            onClick={() => handleUpdateStatus('COMPLETED')}
            disabled={updatingStatus}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Mark as completed
          </Button>
          <Button
            color="red"
            variant="outlined"
            fullWidth
            onClick={() => handleUpdateStatus('CANCELLED')}
            disabled={updatingStatus}
            className="flex items-center justify-center gap-2"
          >
            <XCircleIcon className="h-5 w-5" />
            Cancel order
          </Button>
        </div>
      );
    }
    
    return null;
  };

  const handleBack = () => {
    navigate("/dashboard/orders"); 
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-12 w-12 text-blue-500" />
        <Typography variant="h6" color="blue-gray" className="mt-4">
          Loading order details...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
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
          <div className="flex gap-2 mt-4">
            <Button 
              color="red" 
              variant="text"
              onClick={fetchOrderDetail}
            >
              Try again
            </Button>
            <Button 
              color="blue" 
              variant="text"
              onClick={handleBack} 
            >
              Back to order list
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-8">
        <Alert 
          color="amber" 
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          className="mb-4"
        >
          <Typography variant="h6" color="amber">
            Order not found
          </Typography>
          <Typography color="amber" className="mt-2">
            Order with ID {id} does not exist or has been deleted.
          </Typography>
          <Button 
            color="amber" 
            variant="text"
            className="mt-4"
            onClick={handleBack} 
          >
            Back to order list
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-2 rounded-full"
            onClick={handleBack} 
          >
            <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
            Back to list
          </Button>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Order details #{order.orderId || id}
          </Typography>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content="Refresh">
            <IconButton 
              color="blue" 
              variant="text" 
              onClick={fetchOrderDetail}
              disabled={updatingStatus}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Main information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order information card */}
          <Card className="shadow-lg">
            <CardHeader 
              variant="gradient" 
              color="blue" 
              className="p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  Order Information
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <Chip
                  variant="filled"
                  color={getStatusColor(order.status)}
                  value={getStatusText(order.status)}
                  className="py-2 px-4 font-bold"
                />
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ReceiptPercentIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Order code
                    </Typography>
                    <Typography variant="h6" className="font-bold">
                      {order.orderCode || `ORD-${order.orderId || id}`}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Order date
                    </Typography>
                    <Typography variant="h6" className="font-bold">
                      {formatDateTime(order.createdAt)}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Total amount
                    </Typography>
                    <Typography variant="h6" className="font-bold text-green-700">
                      {formatCurrency(order.totalPrice)}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <ReceiptPercentIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Number of items
                    </Typography>
                    <Typography variant="h6" className="font-bold">
                      {order.orderDetails?.length || 0} items
                    </Typography>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Customer information card */}
          <Card className="shadow-lg">
            <CardHeader 
              color="blue" 
              variant="gradient"
              className="p-6"
            >
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  Customer Information
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(order.fullName || 'Customer')}&background=random`}
                  alt={order.fullName}
                  size="xl"
                  className="border-4 border-blue-50"
                />
                <div className="flex-1">
                  <Typography variant="h4" color="blue-gray" className="font-bold mb-2">
                    {order.fullName || "Anonymous customer"}
                  </Typography>
                  {order.username && (
                    <Typography variant="small" color="blue-gray" className="mb-1">
                      <span className="font-semibold">Username:</span> @{order.username}
                    </Typography>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-blue-gray-400" />
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          Email
                        </Typography>
                        <Typography variant="paragraph">
                          {order.email || "No email"}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-blue-gray-400" />
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          Phone number
                        </Typography>
                        <Typography variant="paragraph">
                          {order.phone || "No phone number"}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <HomeIcon className="h-5 w-5 text-blue-gray-400" />
                  <Typography variant="h6" color="blue-gray" className="font-semibold">
                    Shipping address
                  </Typography>
                </div>
                <div className="p-4 bg-blue-gray-50/50 rounded-lg border border-blue-gray-100">
                  <Typography variant="paragraph" className="font-medium">
                    {order.address || "No address information"}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Order items card */}
          <Card className="shadow-lg">
            <CardHeader 
              color="blue" 
              variant="gradient"
              className="p-6"
            >
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  Order Items
                </Typography>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {order.orderDetails && order.orderDetails.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-blue-gray-50/50">
                      <tr>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Product
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Unit Price
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Quantity
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Subtotal
                          </Typography>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderDetails.map((item, index) => (
                        <tr 
                          key={item.productId || index} 
                          className="border-b border-blue-gray-100 hover:bg-blue-gray-50/30"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {item.productImage ? (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-blue-gray-100 rounded-lg flex items-center justify-center">
                                  <Typography variant="small" className="font-bold">
                                    {index + 1}
                                  </Typography>
                                </div>
                              )}
                              <div>
                                <Typography variant="small" className="font-bold">
                                  {item.productName || `Product ${index + 1}`}
                                </Typography>
                                {item.productId && (
                                  <Typography variant="small" color="blue-gray" className="text-xs">
                                    SKU: {item.productId}
                                  </Typography>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Typography variant="small" className="font-bold">
                              {formatCurrency(item.price || 0)}
                            </Typography>
                          </td>
                          <td className="py-4 px-6">
                            <div className="w-12">
                              <Typography 
                                variant="small" 
                                className="font-bold text-center bg-blue-50 py-1 rounded"
                              >
                                {item.quantity || 1}
                              </Typography>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Typography variant="small" className="font-bold text-green-700">
                              {formatCurrency((item.price || 0) * (item.quantity || 1))}
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    No items in this order
                  </Typography>
                  <Typography color="gray">
                    This order doesn't contain any items
                  </Typography>
                </div>
              )}
              
              {/* Summary */}
              <div className="p-6 border-t border-blue-gray-100">
                <div className="flex justify-end">
                  <div className="w-80">
                    <div className="border-t border-blue-gray-200 pt-3">
                      <div className="flex justify-between">
                        <Typography variant="h6" color="blue-gray" className="font-bold">
                          Total:
                        </Typography>
                        <Typography variant="h5" className="font-bold text-green-700">
                          {formatCurrency(order.totalPrice)}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right column: Actions */}
        <div className="space-y-8">
          {/* Status update card */}
          <Card className="shadow-lg">
            <CardHeader color="blue" className="p-6">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Update Status
              </Typography>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="space-y-2">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Current status:
                </Typography>
                <div className="flex items-center gap-2 p-3 bg-blue-gray-50 rounded-lg">
                  <div className={`h-3 w-3 rounded-full bg-${getStatusColor(order.status)}-500`}></div>
                  <Typography variant="h6" className={getStatusTextColor(order.status)}>
                    {getStatusText(order.status)}
                  </Typography>
                </div>
              </div>
              
              <div className="space-y-2">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Quick actions:
                </Typography>
                {renderStatusActions()}
              </div>
              
              {/* All status options to choose from */}
              <div className="pt-4 border-t border-blue-gray-100">
                <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                  Select other status:
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(option => {
                    const isCurrentStatus = order.status === option.value;
                    const canChange = canChangeStatus(order.status, option.value);
                    const isDisabled = isCurrentStatus || !canChange || updatingStatus;
                    
                    return (
                      <Tooltip 
                        key={option.value}
                        content={
                          isCurrentStatus 
                            ? `Current status` 
                            : !canChange 
                            ? `Cannot change from ${getStatusText(order.status)} to ${option.label}`
                            : `Change to ${option.label}`
                        }
                      >
                        <div>
                          <Button
                            variant="outlined"
                            color={option.color}
                            size="sm"
                            fullWidth
                            onClick={() => handleUpdateStatus(option.value)}
                            disabled={isDisabled}
                            className="flex items-center justify-center gap-1"
                          >
                            {getStatusIcon(option.value)}
                            {option.label}
                            {isCurrentStatus && (
                              <span className="ml-1 text-xs">(Current)</span>
                            )}
                          </Button>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
              
              {updatingStatus && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Spinner className="h-4 w-4" />
                  <Typography variant="small" color="blue-gray">
                    Updating status...
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Additional information card */}
          <Card className="shadow-lg">
            <CardHeader color="blue-gray" className="p-6">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Additional Information
              </Typography>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Customer notes:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 mt-1">
                  {order.notes || "No notes"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Payment method:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 mt-1">
                  {order.paymentMethod || "Not specified"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Last updated:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 mt-1">
                  {formatDateTime(order.updatedAt || order.createdAt)}
                </Typography>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;