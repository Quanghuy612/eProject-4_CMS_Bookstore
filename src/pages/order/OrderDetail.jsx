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
      setError(err.response?.data?.message || err.message || "Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Chờ xác nhận', color: 'amber' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' }
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
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy"
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
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    if (order.status === newStatus) return;
    
    try {
      setUpdatingStatus(true);
      console.log(`Updating order ${id} status to ${newStatus}`);
      
      await OrderService.updateOrderStatus(id, newStatus);
      
      setOrder(prev => ({
        ...prev,
        status: newStatus
      }));
      
      console.log('Status updated successfully');
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Lỗi khi cập nhật trạng thái: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const renderStatusActions = () => {
    if (!order) return null;
    
    const { status } = order;
    
    switch(status) {
      case 'PENDING':
        return (
          <div className="space-y-2">
            <Button
              color="blue"
              fullWidth
              onClick={() => handleUpdateStatus('CONFIRMED')}
              disabled={updatingStatus}
              className="flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Xác nhận đơn hàng
            </Button>
            <Button
              color="red"
              variant="outlined"
              fullWidth
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                  handleUpdateStatus('CANCELLED');
                }
              }}
              disabled={updatingStatus}
              className="flex items-center justify-center gap-2"
            >
              <XCircleIcon className="h-5 w-5" />
              Hủy đơn hàng
            </Button>
          </div>
        );
      
      case 'CONFIRMED':
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
              Đánh dấu đã hoàn thành
            </Button>
            <Button
              color="red"
              variant="outlined"
              fullWidth
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                  handleUpdateStatus('CANCELLED');
                }
              }}
              disabled={updatingStatus}
              className="flex items-center justify-center gap-2"
            >
              <XCircleIcon className="h-5 w-5" />
              Hủy đơn hàng
            </Button>
          </div>
        );
      
      case 'COMPLETED':
        return (
          <div className="text-center py-4">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <Typography variant="h6" color="green">
              Đơn hàng đã hoàn thành
            </Typography>
            <Typography variant="small" color="gray">
              Không thể thay đổi trạng thái
            </Typography>
          </div>
        );
      
      case 'CANCELLED':
        return (
          <div className="text-center py-4">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <Typography variant="h6" color="red">
              Đơn hàng đã hủy
            </Typography>
            <Typography variant="small" color="gray">
              Không thể thay đổi trạng thái
            </Typography>
          </div>
        );
      
      default:
        return null;
    }
  };


  const handleBack = () => {
    navigate("/dashboard/orders"); 
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner className="h-12 w-12 text-blue-500" />
        <Typography variant="h6" color="blue-gray" className="mt-4">
          Đang tải chi tiết đơn hàng...
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
            Lỗi khi tải dữ liệu
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
              Thử lại
            </Button>
            <Button 
              color="blue" 
              variant="text"
              onClick={handleBack} 
            >
              Quay lại danh sách đơn hàng
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
            Không tìm thấy đơn hàng
          </Typography>
          <Typography color="amber" className="mt-2">
            Đơn hàng với ID {id} không tồn tại hoặc đã bị xóa.
          </Typography>
          <Button 
            color="amber" 
            variant="text"
            className="mt-4"
            onClick={handleBack} 
          >
            Quay lại danh sách đơn hàng
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8">
      {/* Header với nút quay lại */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-2 rounded-full"
            onClick={handleBack} 
          >
            <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
            Quay lại danh sách
          </Button>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            Chi tiết đơn hàng #{order.orderId || id}
          </Typography>
        </div>
        
        <div className="flex items-center gap-2">
          <Tooltip content="Làm mới">
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
        {/* Cột trái: Thông tin chính */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card thông tin đơn hàng */}
          <Card className="shadow-lg">
            <CardHeader 
              variant="gradient" 
              color="blue" 
              className="p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  Thông tin đơn hàng
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
                      Mã đơn hàng
                    </Typography>
                    <Typography variant="h6" className="font-bold">
                      {order.orderCode || `DH-${order.orderId || id}`}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-semibold">
                      Ngày đặt
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
                      Tổng tiền
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
                      Số sản phẩm
                    </Typography>
                    <Typography variant="h6" className="font-bold">
                      {order.orderDetails?.length || 0} sản phẩm
                    </Typography>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card thông tin khách hàng */}
          <Card className="shadow-lg">
            <CardHeader 
              color="blue" 
              variant="gradient"
              className="p-6"
            >
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  Thông tin khách hàng
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
                    {order.fullName || "Khách hàng ẩn danh"}
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
                          {order.email || "Không có email"}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-blue-gray-400" />
                      <div>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          Số điện thoại
                        </Typography>
                        <Typography variant="paragraph">
                          {order.phone || "Không có số điện thoại"}
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
                    Địa chỉ giao hàng
                  </Typography>
                </div>
                <div className="p-4 bg-blue-gray-50/50 rounded-lg border border-blue-gray-100">
                  <Typography variant="paragraph" className="font-medium">
                    {order.address || "Chưa có thông tin địa chỉ"}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Card sản phẩm trong đơn hàng */}
          <Card className="shadow-lg">
            <CardHeader 
              color="blue" 
              variant="gradient"
              className="p-6"
            >
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
                <Typography variant="h5" color="white" className="font-bold">
                  Sản phẩm đã đặt
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
                            Sản phẩm
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Đơn giá
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Số lượng
                          </Typography>
                        </th>
                        <th className="py-4 px-6 text-left">
                          <Typography variant="small" className="font-bold uppercase">
                            Thành tiền
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
                                  {item.productName || `Sản phẩm ${index + 1}`}
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
                    Không có sản phẩm trong đơn hàng
                  </Typography>
                  <Typography color="gray">
                    Đơn hàng này chưa có sản phẩm nào
                  </Typography>
                </div>
              )}
              
              {/* Tổng kết */}
              <div className="p-6 border-t border-blue-gray-100">
                <div className="flex justify-end">
                  <div className="w-80">
                    <div className="border-t border-blue-gray-200 pt-3">
                      <div className="flex justify-between">
                        <Typography variant="h6" color="blue-gray" className="font-bold">
                          Tổng cộng:
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

        {/* Cột phải: Hành động */}
        <div className="space-y-8">
          {/* Card cập nhật trạng thái */}
          <Card className="shadow-lg">
            <CardHeader color="blue" className="p-6">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Cập nhật trạng thái
              </Typography>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="space-y-2">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Trạng thái hiện tại:
                </Typography>
                <div className="flex items-center gap-2 p-3 bg-blue-gray-50 rounded-lg">
                  <div className={`h-3 w-3 rounded-full bg-${getStatusColor(order.status)}-500`}></div>
                  <Typography variant="h6" className={`font-bold text-${getStatusColor(order.status)}-700`}>
                    {getStatusText(order.status)}
                  </Typography>
                </div>
              </div>
              
              <div className="space-y-2">
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Hành động nhanh:
                </Typography>
                {renderStatusActions()}
              </div>
              
              {/* Tất cả trạng thái để chọn */}
              <div className="pt-4 border-t border-blue-gray-100">
                <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
                  Chọn trạng thái khác:
                </Typography>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      variant="outlined"
                      color={option.color}
                      size="sm"
                      fullWidth
                      onClick={() => handleUpdateStatus(option.value)}
                      disabled={order.status === option.value || updatingStatus}
                      className="flex items-center justify-center gap-1"
                    >
                      {getStatusIcon(option.value)}
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {updatingStatus && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Spinner className="h-4 w-4" />
                  <Typography variant="small" color="blue-gray">
                    Đang cập nhật trạng thái...
                  </Typography>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Card thông tin thêm */}
          <Card className="shadow-lg">
            <CardHeader color="blue-gray" className="p-6">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                Thông tin thêm
              </Typography>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Ghi chú của khách hàng:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 mt-1">
                  {order.notes || "Không có ghi chú"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Phương thức thanh toán:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600 mt-1">
                  {order.paymentMethod || "Chưa xác định"}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Thời gian cập nhật cuối:
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