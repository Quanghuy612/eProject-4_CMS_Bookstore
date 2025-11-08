import React, { useEffect, useState } from "react";
import categoryService from "@/services/category/CategoryService";
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlusIcon,
  EyeIcon,
  InformationCircleIcon,
  TrashIcon,
  PencilIcon,
  FolderIcon,
  CubeIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

// Component hiển thị cây con
const CategoryChildren = ({ node, onDelete, onEdit }) => {
  if (!node.children || node.children.length === 0) return null;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-6 mt-2 border-l border-gray-200 pl-4">
      <button
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 w-full"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDownIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
        <span className="font-medium">
          {expanded ? "Ẩn danh mục con" : `Hiện ${node.children.length} danh mục con`}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <div key={child.id} className="group">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <FolderIcon className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">{child.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Cấp {child.categoryLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 font-mono">
                    ID: {child.id}
                  </div>
                  <button
                    onClick={() => onEdit(child)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(child.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CategoryChildren node={child} onDelete={onDelete} onEdit={onEdit} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Node trong cây chính
const CategoryNode = ({ node, onSelect, isSelected, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="mb-2">
      <div 
        className={`
          flex justify-between items-center p-4 rounded-xl border transition-all duration-200
          ${isSelected 
            ? "border-blue-500 bg-blue-50 shadow-md" 
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }
        `}
      >
        <div className="flex items-center gap-3 flex-1">
          {hasChildren && (
            <button
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && (
            <div className="w-6"></div>
          )}
          
          <button
            className="flex items-center gap-3 flex-1 text-left group"
            onClick={() => onSelect(node)}
          >
            <FolderIcon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            <div>
              <span className={`font-semibold block ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                {node.name}
              </span>
              <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                Cấp {node.categoryLevel}
              </span>
            </div>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 font-mono">
            ID: {node.id}
          </div>
          {hasChildren && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {node.children.length} con
            </span>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(node)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(node.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="ml-8 mt-2">
          {node.children.map((child) => (
            <CategoryNode 
              key={child.id} 
              node={child} 
              onSelect={onSelect}
              isSelected={isSelected?.id === child.id}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryManager = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentId, setParentId] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("tree");
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      setAllCategories(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage("Lỗi khi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setMessage("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      let payload = {
        name: newCategoryName.trim(),
      };

      if (parentId) {
        const parentCategory = allCategories.find(cat => cat.id === Number(parentId));
        if (parentCategory) {
          payload.parentId = Number(parentId);
          payload.categoryLevel = parentCategory.categoryLevel + 1;
          
          if (payload.categoryLevel > 3) {
            setMessage("Không thể tạo danh mục cấp 4 trở lên!");
            return;
          }
        }
      } else {
        payload.categoryLevel = 1;
        payload.parentId = null;
      }

      await categoryService.createCategory(payload);
      
      setMessage("Tạo danh mục thành công!");
      setNewCategoryName("");
      setParentId("");
      
      setTimeout(() => {
        fetchCategories();
        setMessage("");
      }, 2000);

    } catch (error) {
      console.error("Error creating category:", error);
      setMessage(error.response?.data?.message || "Tạo danh mục thất bại!");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      setMessage("Xóa danh mục thành công!");
      
      fetchCategories();
      
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }

      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage("Xóa danh mục thất bại! Có thể danh mục đang được sử dụng.");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setParentId(category.parentId || "");
    setActiveTab("create");
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim() || !editingCategory) {
      setMessage("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      let payload = {
        name: newCategoryName.trim(),
      };

      if (parentId) {
        const parentCategory = allCategories.find(cat => cat.id === Number(parentId));
        if (parentCategory) {
          payload.parentId = Number(parentId);
          payload.categoryLevel = parentCategory.categoryLevel + 1;
          
          if (payload.categoryLevel > 3) {
            setMessage("Không thể chuyển danh mục lên cấp 4!");
            return;
          }
        }
      } else {
        payload.categoryLevel = 1;
        payload.parentId = null;
      }

      await categoryService.updateCategory(editingCategory.id, payload);
      
      setMessage("Cập nhật danh mục thành công!");
      setNewCategoryName("");
      setParentId("");
      setEditingCategory(null);
      
      fetchCategories();

      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error updating category:", error);
      setMessage(error.response?.data?.message || "Cập nhật danh mục thất bại!");
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setParentId("");
  };

  // Calculate statistics
  const stats = {
    total: allCategories.length,
    level1: allCategories.filter(cat => cat.categoryLevel === 1).length,
    level2: allCategories.filter(cat => cat.categoryLevel === 2).length,
    level3: allCategories.filter(cat => cat.categoryLevel === 3).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500 rounded-xl">
              <FolderIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
              <p className="text-gray-600">Tổ chức hệ thống danh mục sản phẩm</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-gray-600 text-sm">Tổng danh mục</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CubeIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.level1}</div>
                <div className="text-gray-600 text-sm">Danh mục cấp 1</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CubeIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.level2}</div>
                <div className="text-gray-600 text-sm">Danh mục cấp 2</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CubeIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.level3}</div>
                <div className="text-gray-600 text-sm">Danh mục cấp 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("tree")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tree"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <EyeIcon className="w-4 h-4 inline mr-2" />
                Xem dạng cây
              </button>
              <button
                onClick={() => {
                  setActiveTab("create");
                  setEditingCategory(null);
                  setNewCategoryName("");
                  setParentId("");
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "create"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <PlusIcon className="w-4 h-4 inline mr-2" />
                {editingCategory ? "Chỉnh sửa" : "Tạo mới"}
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Tree View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Cấu trúc danh mục</h2>
                <div className="text-sm text-gray-500">
                  Tổng: {stats.total} danh mục
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {allCategories.length > 0 ? (
                  allCategories
                    .filter((cat) => !cat.parentId)
                    .map((node) => (
                      <CategoryNode 
                        key={node.id} 
                        node={node} 
                        onSelect={setSelectedCategory}
                        isSelected={selectedCategory?.id === node.id}
                        onDelete={handleDeleteCategory}
                        onEdit={handleEditCategory}
                      />
                    ))
                ) : (
                  <div className="text-center py-12">
                    <InformationCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có danh mục nào</p>
                    <p className="text-gray-400 text-sm mt-2">Hãy tạo danh mục đầu tiên của bạn</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Details & Create */}
          <div className="space-y-6">
            {/* Category Details */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                Chi tiết danh mục
              </h2>
              
              {selectedCategory ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">ID</div>
                      <div className="font-semibold text-gray-900">{selectedCategory.id}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Cấp độ</div>
                      <div className="font-semibold">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          Cấp {selectedCategory.categoryLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Tên danh mục</div>
                    <div className="font-semibold text-gray-900 text-lg">{selectedCategory.name}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">Danh mục cha</div>
                    <div className="font-semibold text-gray-900">
                      {selectedCategory.parentId 
                        ? allCategories.find(cat => cat.id === selectedCategory.parentId)?.name || "Đang tải..."
                        : "Không có (Danh mục gốc)"
                      }
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Danh mục con</h3>
                    <CategoryChildren node={selectedCategory} onDelete={handleDeleteCategory} onEdit={handleEditCategory} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <InformationCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn một danh mục để xem chi tiết</p>
                </div>
              )}
            </div>

            {/* Create/Edit Category Form */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-green-500" />
                {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
              </h2>
              
              <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục cha
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">-- Không có (Tạo danh mục gốc) --</option>
                    {allCategories
                      .filter((cat) => cat.categoryLevel < 3)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (Cấp {cat.categoryLevel})
                        </option>
                      ))
                    }
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Để trống để tạo danh mục gốc (cấp 1)
                  </p>
                </div>
                
                <div className="flex gap-3">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`${editingCategory ? 'flex-1' : 'w-full'} bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2`}
                  >
                    <PlusIcon className="w-5 h-5" />
                    {editingCategory ? "Cập nhật" : "Tạo danh mục"}
                  </button>
                </div>
              </form>
              
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
                  message.includes("thành công") 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;