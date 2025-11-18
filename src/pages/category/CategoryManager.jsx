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
  ChartBarIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Spinner,
  Alert,
  Chip,
  Badge,
} from "@material-tailwind/react";

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
                  <Chip
                    value={`Cấp ${child.categoryLevel}`}
                    color="green"
                    size="sm"
                    className="rounded-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Typography variant="small" color="gray" className="font-mono">
                    ID: {child.id}
                  </Typography>
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
              <Typography 
                variant="h6" 
                color={isSelected ? "blue" : "gray"} 
                className="font-semibold"
              >
                {node.name}
              </Typography>
              <Chip
                value={`Cấp ${node.categoryLevel}`}
                color="blue"
                size="sm"
                variant="outlined"
                className="rounded-full mt-1"
              />
            </div>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <Typography variant="small" color="gray" className="font-mono">
            ID: {node.id}
          </Typography>
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
  const [messageType, setMessageType] = useState("success");
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
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      setMessage("Vui lòng nhập tên danh mục!");
      setMessageType("error");
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
            setMessageType("error");
            return;
          }
        }
      } else {
        payload.categoryLevel = 1;
        payload.parentId = null;
      }

      await categoryService.createCategory(payload);
      
      setMessage("Tạo danh mục thành công!");
      setMessageType("success");
      setNewCategoryName("");
      setParentId("");
      
      setTimeout(() => {
        fetchCategories();
        setMessage("");
      }, 300);

    } catch (error) {
      console.error("Error creating category:", error);
      setMessage(error.response?.data?.message || "Tạo danh mục thất bại!");
      setMessageType("error");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      setMessage("Xóa danh mục thành công!");
      setMessageType("success");
      
      fetchCategories();
      
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }

      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage("Xóa danh mục thất bại! Có thể danh mục đang được sử dụng.");
      setMessageType("error");
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
      setMessageType("error");
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
            setMessageType("error");
            return;
          }
        }
      } else {
        payload.categoryLevel = 1;
        payload.parentId = null;
      }

      await categoryService.updateCategory(editingCategory.id, payload);
      
      setMessage("Cập nhật danh mục thành công!");
      setMessageType("success");
      setNewCategoryName("");
      setParentId("");
      setEditingCategory(null);
      
      fetchCategories();

      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error updating category:", error);
      setMessage(error.response?.data?.message || "Cập nhật danh mục thất bại!");
      setMessageType("error");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <Typography variant="h5" color="blue-gray" className="mb-2">
            Đang tải danh mục...
          </Typography>
          <Typography variant="small" color="gray">
            Vui lòng chờ trong giây lát
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-2xl border-0 mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardBody className="p-8 relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <FolderIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <Typography variant="h2" className="text-white font-bold mb-2">
                    Quản lý Danh mục
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100">
                    Tổ chức hệ thống danh mục sản phẩm
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Typography variant="h4" color="blue" className="font-bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Tổng danh mục
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CubeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Typography variant="h4" color="green" className="font-bold">
                    {stats.level1}
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Danh mục cấp 1
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <CubeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Typography variant="h4" color="orange" className="font-bold">
                    {stats.level2}
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Danh mục cấp 2
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <CubeIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Typography variant="h4" color="purple" className="font-bold">
                    {stats.level3}
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-medium">
                    Danh mục cấp 3
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="shadow-xl border-0 mb-6">
          <CardBody className="p-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("tree")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === "tree"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <EyeIcon className="h-4 w-4" />
                  Xem dạng cây
                </button>
                <button
                  onClick={() => {
                    setActiveTab("create");
                    setEditingCategory(null);
                    setNewCategoryName("");
                    setParentId("");
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === "create"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <PlusIcon className="h-4 w-4" />
                  {editingCategory ? "Chỉnh sửa" : "Tạo mới"}
                </button>
              </nav>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Tree View */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" color="blue-gray" className="flex items-center gap-2">
                    <CubeIcon className="h-5 w-5 text-blue-500" />
                    Cấu trúc danh mục
                  </Typography>
                  {/* <div className="flex items-center gap-2">
                    <Typography variant="small" color="gray">
                      Tổng:
                    </Typography>
                    <Badge color="blue" content={stats.total} />
                    <Typography variant="small" color="gray">
                      danh mục
                    </Typography>
                  </div> */}
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
                      <InformationCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <Typography variant="h6" color="gray" className="mb-2">
                        Chưa có danh mục nào
                      </Typography>
                      <Typography variant="small" color="gray">
                        Hãy tạo danh mục đầu tiên của bạn
                      </Typography>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar - Details & Create */}
          <div className="space-y-6">
            {/* Category Details */}
            <Card className="shadow-xl border-0">
              <CardBody className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                  Chi tiết danh mục
                </Typography>
                
                {selectedCategory ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          ID
                        </Typography>
                        <Typography variant="h6" color="blue" className="font-bold">
                          {selectedCategory.id}
                        </Typography>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          Cấp độ
                        </Typography>
                        <Chip
                          value={`Cấp ${selectedCategory.categoryLevel}`}
                          color="green"
                          size="sm"
                          className="font-bold"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        Tên danh mục
                      </Typography>
                      <Typography variant="h6" color="blue-gray" className="font-bold">
                        {selectedCategory.name}
                      </Typography>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        Danh mục cha
                      </Typography>
                      <Typography variant="h6" color="blue-gray" className="font-bold">
                        {selectedCategory.parentId 
                          ? allCategories.find(cat => cat.id === selectedCategory.parentId)?.name || "Đang tải..."
                          : "Không có (Danh mục gốc)"
                        }
                      </Typography>
                    </div>

                    <div>
                      <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-blue-500" />
                        Danh mục con
                      </Typography>
                      <CategoryChildren node={selectedCategory} onDelete={handleDeleteCategory} onEdit={handleEditCategory} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <InformationCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <Typography variant="h6" color="gray" className="mb-2">
                      Chưa chọn danh mục
                    </Typography>
                    <Typography variant="small" color="gray">
                      Chọn một danh mục để xem chi tiết
                    </Typography>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Create/Edit Category Form */}
            <Card className="shadow-xl border-0">
              <CardBody className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-green-500" />
                  {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                </Typography>
                
                <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                      Tên danh mục
                    </Typography>
                    <Input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nhập tên danh mục..."
                      className="!border !border-gray-300 focus:!border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                      Danh mục cha
                    </Typography>
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
                    <Typography variant="small" color="gray" className="mt-1">
                      Để trống để tạo danh mục gốc (cấp 1)
                    </Typography>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    {editingCategory && (
                      <Button
                        type="button"
                        onClick={cancelEdit}
                        variant="outlined"
                        color="red"
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={`${editingCategory ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2`}
                      color="blue"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {editingCategory ? "Cập nhật" : "Tạo danh mục"}
                    </Button>
                  </div>
                </form>
                
                {message && (
                  <Alert
                    className="mt-4"
                    color={messageType === "success" ? "green" : "red"}
                    open={!!message}
                    onClose={() => setMessage("")}
                  >
                    {message}
                  </Alert>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;