import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import OrderService from "@/services/order/OrderService";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching order detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "amber",
      PAID: "green",
      CANCELLED: "red",
      PROCESSING: "blue",
      DELIVERED: "green",
    };
    return statusColors[status] || "gray";
  };

  if (loading) {
    return (
      <div className="mt-12 flex justify-center">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mt-12">
        <Typography color="red" variant="h6">
          Error: {error || "Order not found"}
        </Typography>
        <Button className="mt-4" onClick={() => navigate("/dashboard/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="flex items-center gap-4">
        <Button
          variant="text"
          color="blue-gray"
          className="flex items-center gap-2"
          onClick={() => navigate("/dashboard/orders")}
        >
          <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <Typography variant="h6" color="white">
              Order Details - #{order.id}
            </Typography>
            <Chip
              variant="gradient"
              color={getStatusColor(order.status)}
              value={order.status}
              className="py-1 px-3"
            />
          </div>
        </CardHeader>
        <CardBody className="px-6 pt-0 pb-6">
          {/* Customer Information */}
          <div className="mb-6">
            <Typography variant="h6" color="blue-gray" className="mb-3">
              Customer Information
            </Typography>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Full Name:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600">
                  {order.user?.fullName || "N/A"}
                </Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Email:
                </Typography>
                <Typography variant="small" className="text-blue-gray-600">
                  {order.user?.email || "N/A"}
                </Typography>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <Typography variant="h6" color="blue-gray" className="mb-3">
              Order Items
            </Typography>
            <div className="overflow-x-scroll">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Product", "Image", "Price", "Quantity", "Subtotal"].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails?.map((item) => {
                    const className = "py-3 px-5 border-b border-blue-gray-50";
                    const subtotal = item.price * item.quantity;
                    return (
                      <tr key={item.id}>
                        <td className={className}>
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {item.name}
                          </Typography>
                        </td>
                        <td className={className}>
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-blue-gray-50 flex items-center justify-center">
                              <Typography variant="small" className="text-blue-gray-400">
                                N/A
                              </Typography>
                            </div>
                          )}
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            ${item.price?.toFixed(2)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium text-blue-gray-600">
                            {item.quantity}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-semibold text-blue-gray-600">
                            ${subtotal.toFixed(2)}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between border-t border-blue-gray-50 pt-4">
                <Typography variant="h6" color="blue-gray">
                  Total:
                </Typography>
                <Typography variant="h6" color="blue-gray">
                  ${order.totalPrice?.toFixed(2) || "0.00"}
                </Typography>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default OrderDetail;