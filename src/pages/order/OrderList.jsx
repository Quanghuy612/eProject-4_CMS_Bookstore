import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Card, CardHeader, CardBody, Typography, Button, Chip } from "@material-tailwind/react";
import OrderService from "@/services/order/OrderService";

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setOrders([]);
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

  // ✅ Nếu route là /create hoặc /:id → render Outlet (child routes)
  if (location.pathname.includes("/create") || location.pathname.match(/\/\d+$/)) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="mt-12 flex justify-center">
        <Typography variant="h6">Loading...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <Typography color="red" variant="h6">
          Error: {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex items-center justify-between">
          <Typography variant="h6" color="white">
            Order Management
          </Typography>
          {/* Relative link → Outlet sẽ render */}
          <Link to="create">
            <Button color="white" size="sm">
              Create Order
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Order ID", "Total Price", "Status", "Customer", "Actions"].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-3 px-5 text-center">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      No orders found
                    </Typography>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const className = "py-3 px-5 border-b border-blue-gray-50";
                  return (
                    <tr key={order.id}>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          #{order.id}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="font-medium text-blue-gray-600">
                          ${order.totalPrice?.toFixed(2) || "0.00"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={getStatusColor(order.status)}
                          value={order.status}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <div className="flex flex-col">
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            {order.user?.fullName || "N/A"}
                          </Typography>
                          <Typography variant="small" className="text-xs font-normal text-blue-gray-500">
                            {order.user?.email || ""}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        {/* Relative link → Outlet sẽ render */}
                        <Link to={`${order.id}`}>
                          <Button color="blue" size="sm" variant="text">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Outlet để render OrderCreate hoặc OrderDetail */}
      <Outlet />
    </div>
  );
}

export default OrderList;
