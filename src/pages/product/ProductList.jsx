// src/pages/products/ProductList.jsx
import React from "react";
import { Link } from "react-router-dom";

export function ProductList() {
  // ví dụ dữ liệu mock
  const products = [
    { id: 1, name: "iPhone 15", price: 1200 },
    { id: 2, name: "Samsung Galaxy S24", price: 1000 },
    { id: 3, name: "Xiaomi 14 Pro", price: 800 },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Product List</h2>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="border p-3 rounded-md flex justify-between">
            <span>
              {p.name} - ${p.price}
            </span>
            <Link
              to={`/home/products/${p.id}`}
              className="text-blue-500 hover:underline"
            >
              View
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/home/products/create"
        className="inline-block mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
      >
        Add Product
      </Link>
    </div>
  );
}

export default ProductList;
