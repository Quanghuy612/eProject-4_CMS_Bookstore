// src/pages/products/ProductCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "@/services/product/ProductService";

export function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    desciption: "",   // 👈 khớp backend
    price: "",
    quantity: "",
    active: true,
    mainImageUrl: "",
    categoryIds: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);

    try {
      const payload = {
        name: form.name,
        desciption: form.desciption,  // 👈 khớp backend
        price: Number(form.price),
        quantity: Number(form.quantity),
        active: form.active,
        mainImageUrl: form.mainImageUrl,
        categoryIds: form.categoryIds
          ? form.categoryIds.split(",").map((id) => Number(id.trim()))
          : [],
      };

      const created = await ProductService.createProduct(payload);

      alert(`✅ Created: ${created.name}`);
      navigate("/dashboard/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Product</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded-md"
        />

        <textarea
          name="desciption" // 👈 đổi từ description → desciption
          placeholder="Description"
          value={form.desciption}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded-md"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded-md"
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded-md"
        />

        <input
          type="text"
          name="mainImageUrl"
          placeholder="Main Image URL"
          value={form.mainImageUrl}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded-md"
        />

        <input
          type="text"
          name="categoryIds"
          placeholder="Category IDs (vd: 1,2,3)"
          value={form.categoryIds}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded-md"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          <span>Active</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

export default ProductCreate;
