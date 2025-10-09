import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "@/services/product/ProductService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    active: true,
    mainImageUrl: "",
    categoryIds: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quantity: Number(form.quantity),
        active: form.active,
        mainImageUrl: form.mainImageUrl,
        categoryIds: form.categoryIds
          ? form.categoryIds.split(",").map((id) => Number(id.trim()))
          : [],
      };

      await ProductService.createProduct(payload);

      toast.success("✅ Thêm sản phẩm thành công!");

      // 👉 Quay lại trang /dashboard/products và reload danh sách
      navigate("/dashboard/products", { replace: true });
      setTimeout(() => window.location.reload(), 300);

    } catch (err) {
      console.error(err);
      toast.error("❌ Thêm sản phẩm thất bại! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-md">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b pb-3">
        ➕ Add New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter product description..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full h-28 resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        {/* Price + Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Price (VND)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Ex: 15000000"
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Ex: 20"
              className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Main Image */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Main Image URL</label>
          <input
            type="text"
            name="mainImageUrl"
            value={form.mainImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
            required
          />
        </div>

        {/* Category IDs */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            Category IDs (Ex: 1,2,3)
          </label>
          <input
            type="text"
            name="categoryIds"
            value={form.categoryIds}
            onChange={handleChange}
            placeholder="Enter category IDs, separated by commas"
            className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Active Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700 font-medium">Active</span>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-semibold text-white transition duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductCreate;
