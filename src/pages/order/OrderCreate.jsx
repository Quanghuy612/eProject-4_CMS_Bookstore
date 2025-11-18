import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import OrderService from "@/services/order/OrderService";
import ProductService from "@/services/product/ProductService";

export function OrderCreate() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState([
    { id: "", quantity: 1, productName: "", price: 0 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await ProductService.getAllProducts();
      console.log("Products data from API:", data);
      console.log("Is array?", Array.isArray(data));
      // Đảm bảo data là array
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]); // Set empty array on error
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { id: "", quantity: 1, productName: "", price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems.length > 0 ? newItems : [{ id: "", quantity: 1, productName: "", price: 0 }]);
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      id: parseInt(productId),
      productName: product?.name || "",
      price: product?.salePrice || product?.price || 0,
    };
    setOrderItems(newItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...orderItems];
    newItems[index].quantity = parseInt(quantity) || 1;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const validItems = orderItems.filter(item => item.id && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Please add at least one product to the order");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        items: validItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
        paymentMethod,
        paymentStatus,
      };

      const result = await OrderService.createOrder(payload);
      
      if (result) {
        alert("Order created successfully!");
        navigate("/dashboard/orders");
      } else {
        alert("Order creation failed - no response from server");
      }
    } catch (err) {
      alert(`Error creating order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
          <Typography variant="h6" color="white">
            Create New Order
          </Typography>
        </CardHeader>
        <CardBody className="px-6 pt-0 pb-6">
          <form onSubmit={handleSubmit}>
            {/* Order Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="h6" color="blue-gray">
                  Order Items
                </Typography>
                <Button
                  size="sm"
                  color="blue"
                  className="flex items-center gap-2"
                  onClick={handleAddItem}
                  type="button"
                >
                  <PlusIcon strokeWidth={2} className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-end">
                  <div className="col-span-5">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Product
                    </Typography>
                    <Select
                      value={item.id?.toString() || ""}
                      onChange={(value) => handleProductChange(index, value)}
                      label="Select Product"
                    >
                      {products.map((product) => (
                        <Option key={product.id} value={product.id.toString()}>
                          {product.name} - ${product.salePrice || product.price}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Quantity
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      label="Quantity"
                    />
                  </div>
                  <div className="col-span-2">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Price
                    </Typography>
                    <Input
                      type="text"
                      value={`$${item.price.toFixed(2)}`}
                      disabled
                      label="Price"
                    />
                  </div>
                  <div className="col-span-2">
                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                      Subtotal
                    </Typography>
                    <Input
                      type="text"
                      value={`$${(item.price * item.quantity).toFixed(2)}`}
                      disabled
                      label="Subtotal"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      color="red"
                      variant="text"
                      onClick={() => handleRemoveItem(index)}
                      type="button"
                      disabled={orderItems.length === 1}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <Typography variant="h6" color="blue-gray" className="mb-3">
                Payment Information
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Payment Method
                  </Typography>
                  <Select
                    value={paymentMethod}
                    onChange={(value) => setPaymentMethod(value)}
                    label="Payment Method"
                  >
                    <Option value="CASH">Cash</Option>
                    <Option value="CREDIT_CARD">Credit Card</Option>
                    <Option value="BANK_TRANSFER">Bank Transfer</Option>
                    <Option value="E_WALLET">E-Wallet</Option>
                  </Select>
                </div>
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                    Payment Status
                  </Typography>
                  <Select
                    value={paymentStatus}
                    onChange={(value) => setPaymentStatus(value)}
                    label="Payment Status"
                  >
                    <Option value="PENDING">Pending</Option>
                    <Option value="PAID">Paid</Option>
                    <Option value="CANCELLED">Cancelled</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between border-t border-blue-gray-50 pt-4">
                  <Typography variant="h6" color="blue-gray">
                    Total:
                  </Typography>
                  <Typography variant="h6" color="blue-gray">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                variant="text"
                color="red"
                onClick={() => navigate("/dashboard/orders")}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                color="blue"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default OrderCreate;