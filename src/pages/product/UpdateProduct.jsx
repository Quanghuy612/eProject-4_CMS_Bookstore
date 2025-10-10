import React, { useEffect, useState } from "react";
import ProductService from "@/services/product/ProductService";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProduct = ({ onUpdated }) => {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    mainImageUrl: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await ProductService.updateProduct(productId);
        const data = res?.data || res; 

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          quantity: data.quantity || "",
          mainImageUrl: data.mainImageUrl || "",
          active: data.active ?? true,
        });
      } catch (error) {
        setMessage(` Lỗi tải sản phẩm: ${error.message}`);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await ProductService.updateProduct(productId, formData);
      setMessage("✅ Cập nhật sản phẩm thành công!");
      navigate("/dashboard/products", { replace: true });
      setTimeout(() => window.location.reload(), 300);
      
      if (onUpdated) onUpdated();
    } catch (error) {
      setMessage(`❌ Lỗi cập nhật: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        ✏️ Cập nhật sản phẩm
      </h2>

      {message && (
        <div
          className={`mb-4 p-2 text-sm rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên sản phẩm
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giá (VND)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số lượng
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ảnh chính (URL)
          </label>
          <input
            type="text"
            name="mainImageUrl"
            value={formData.mainImageUrl}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
          <label className="text-sm text-gray-700">Kích hoạt sản phẩm</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 transition"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
