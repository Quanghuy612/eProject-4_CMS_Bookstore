import React, { useEffect, useState } from "react";
import ProductService from "@/services/product/ProductService";
import categoryService from "@/services/category/CategoryService";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Checkbox,
  Spinner,
  Alert,
  Chip,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  CubeIcon,
  CheckBadgeIcon,
  TagIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

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
    categoryIds: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [imagePreview, setImagePreview] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);
        const res = await categoryService.getAllCategories();
        
        if (Array.isArray(res)) {
          setCategories(res);
        } else if (Array.isArray(res?.data)) {
          setCategories(res.data);
        } else if (Array.isArray(res?.data?.data)) {
          setCategories(res.data.data);
        } else {
          console.warn("⚠️ Dữ liệu category không đúng định dạng:", res);
          setCategories([]);
        }
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        setMessage("Không thể tải danh mục sản phẩm!");
        setMessageType("error");
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const res = await ProductService.getProductDetails(productId);
        const data = res?.data || res; 

        // Xử lý categories từ sản phẩm
        const productCategories = data.categories || data.categoryList || [];
        const categoryIds = productCategories.map(cat => cat.id).filter(id => id != null);

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price != null ? String(data.price) : "",
          quantity: data.quantity != null ? String(data.quantity) : "",
          mainImageUrl: data.mainImageUrl || "",
          active: data.active ?? true,
          categoryIds: categoryIds,
        });

        setImagePreview(data.mainImageUrl || "");
      } catch (error) {
        setMessage(`Lỗi tải sản phẩm: ${error.message}`);
        setMessageType("error");
      } finally {
        setFetching(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // Tạo category mới
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage("Vui lòng nhập tên danh mục!");
      setMessageType("error");
      return;
    }

    try {
      setCreatingCategory(true);
      const payload = { name: newCategoryName.trim() };
      const res = await categoryService.createCategory(payload);

      const newCat = res?.data?.data || res?.data || res;

      if (!newCat || !newCat.id) {
        throw new Error("Không nhận được ID category từ server");
      }

      // Thêm category mới vào danh sách
      setCategories((prev) => [...prev, newCat]);
      setNewCategoryName("");
      setCategoryDialog(false);

      // Tự động chọn category mới tạo
      setFormData(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, newCat.id]
      }));

      setMessage("Tạo danh mục mới thành công!");
      setMessageType("success");
    } catch (err) {
      console.error("❌ Lỗi khi tạo danh mục:", err);
      setMessage("Tạo danh mục thất bại: " + err.message);
      setMessageType("error");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        mainImageUrl: formData.mainImageUrl,
        active: formData.active,
        categoryIds: formData.categoryIds.map(id => Number(id)),
      };

      await ProductService.updateProduct(productId, payload);
      setMessage("Cập nhật sản phẩm thành công!");
      setMessageType("success");
      
       navigate("/dashboard/products", { replace: true });
      setTimeout(() => window.location.reload(), 300);
    } catch (error) {
      setMessage(`Lỗi cập nhật: ${error.message}`);
      setMessageType("error");
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

    // Preview image khi URL thay đổi
    if (name === "mainImageUrl") {
      setImagePreview(value);
    }
  };

  // Xử lý chọn danh mục
  const handleCategoryChange = (value) => {
    setFormData({ ...formData, categoryIds: value });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Lấy danh sách categories đã chọn
  const selectedCategories = categories.filter(cat => 
    formData.categoryIds.includes(cat.id)
  );

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <Typography variant="h5" color="blue-gray" className="mb-2">
            Đang tải thông tin sản phẩm...
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="shadow-xl border-0 mb-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <CardBody className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <PencilIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <Typography variant="h2" className="text-white font-bold mb-2">
                    Cập nhật Sản Phẩm
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100">
                    Chỉnh sửa thông tin sản phẩm #{productId}
                  </Typography>
                </div>
              </div>
              <Button
                variant="outlined"
                color="white"
                className="flex items-center gap-2 border-2"
                onClick={() => navigate("/dashboard/products")}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Quay lại
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardBody className="p-8">
                <Typography variant="h4" color="blue-gray" className="mb-2 flex items-center gap-2">
                  <PencilIcon className="h-6 w-6 text-blue-500" />
                  Thông tin sản phẩm
                </Typography>
                <Typography color="gray" className="mb-8">
                  Cập nhật thông tin sản phẩm bên dưới
                </Typography>

                {message && (
                  <Alert
                    className="mb-6"
                    color={messageType === "success" ? "green" : "red"}
                    open={!!message}
                    onClose={() => setMessage("")}
                  >
                    {message}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <CubeIcon className="h-5 w-5" />
                      Tên sản phẩm
                    </Typography>
                    <Input
                      label="Tên sản phẩm"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập tên sản phẩm..."
                      required
                      className="!border !border-gray-300 focus:!border-blue-500"
                      containerProps={{ className: "min-w-[100px]" }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <CubeIcon className="h-5 w-5" />
                      Mô tả sản phẩm
                    </Typography>
                    <Textarea
                      label="Mô tả"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      required
                      className="!border !border-gray-300 focus:!border-blue-500 min-h-[120px]"
                    />
                  </div>

                  {/* Price + Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        Giá bán (VND)
                      </Typography>
                      <Input
                        type="number"
                        label="Giá sản phẩm"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        className="!border !border-gray-300 focus:!border-blue-500"
                      />
                    </div>

                    <div>
                      <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                        <HashtagIcon className="h-5 w-5" />
                        Số lượng
                      </Typography>
                      <Input
                        type="number"
                        label="Số lượng"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        className="!border !border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Main Image */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5" />
                      Hình ảnh chính
                    </Typography>
                    <Input
                      label="URL hình ảnh chính"
                      name="mainImageUrl"
                      value={formData.mainImageUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      required
                      className="!border !border-gray-300 focus:!border-blue-500"
                    />
                    {imagePreview && (
                      <div className="mt-3">
                        <Typography variant="small" color="gray" className="mb-2">
                          Preview:
                        </Typography>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                        <TagIcon className="h-5 w-5" />
                        Danh mục
                      </Typography>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => setCategoryDialog(true)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Thêm danh mục
                      </Button>
                    </div>

                    {fetchingCategories ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Spinner className="h-4 w-4" />
                        <Typography variant="small">Đang tải danh mục...</Typography>
                      </div>
                    ) : (
                      <>
                        <Select
                          label="Chọn danh mục"
                          value={formData.categoryIds}
                          onChange={handleCategoryChange}
                          multiple
                          className="!border !border-gray-300 focus:!border-blue-500"
                        >
                          {categories.map((cat) => (
                            <Option key={cat.id} value={cat.id}>
                              {cat.name}
                            </Option>
                          ))}
                        </Select>

                        {/* Selected Categories Chips */}
                        {selectedCategories.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedCategories.map((cat) => (
                              <Chip
                                key={cat.id}
                                value={cat.name}
                                color="blue"
                                variant="gradient"
                                className="rounded-full"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Active Checkbox */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Checkbox
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      color="green"
                      className="h-5 w-5"
                    />
                    <div>
                      <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                        <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                        Trạng thái hoạt động
                      </Typography>
                      <Typography variant="small" color="gray">
                        Sản phẩm sẽ được hiển thị trên cửa hàng
                      </Typography>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outlined"
                      color="red"
                      className="flex-1"
                      onClick={() => navigate("/dashboard/products")}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2"
                      color="blue"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <PencilIcon className="h-4 w-4" />
                          Cập nhật sản phẩm
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 sticky top-6">
              <CardBody className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  Xem trước
                </Typography>

                <div className="space-y-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {formData.name && (
                    <div>
                      <Typography variant="h6" color="blue-gray" className="font-bold">
                        {formData.name}
                      </Typography>
                      <Typography variant="small" color="gray" className="mt-1 line-clamp-3">
                        {formData.description || "Chưa có mô tả"}
                      </Typography>
                    </div>
                  )}

                  {formData.price && (
                    <Typography variant="h5" color="green" className="font-bold">
                      {formatCurrency(formData.price)}
                    </Typography>
                  )}

                  {selectedCategories.length > 0 && (
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        Danh mục:
                      </Typography>
                      <div className="flex flex-wrap gap-1">
                        {selectedCategories.map((cat) => (
                          <Chip
                            key={cat.id}
                            value={cat.name}
                            size="sm"
                            color="blue"
                            variant="outlined"
                            className="rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Số lượng
                      </Typography>
                      <Typography variant="h6" color="blue" className="font-bold">
                        {formData.quantity || 0}
                      </Typography>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      formData.active ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Trạng thái
                      </Typography>
                      <Typography 
                        variant="h6" 
                        className={`font-bold ${formData.active ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formData.active ? 'Đang bán' : 'Ngừng bán'}
                      </Typography>
                    </div>
                  </div>

                  {!formData.name && (
                    <div className="text-center py-8">
                      <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <Typography color="gray" className="text-sm">
                        Thông tin sản phẩm sẽ xuất hiện ở đây
                      </Typography>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={categoryDialog} handler={setCategoryDialog}>
        <DialogHeader className="flex items-center gap-3">
          <PlusIcon className="h-5 w-5 text-blue-500" />
          <Typography variant="h5" color="blue-gray">
            Thêm danh mục mới
          </Typography>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Tên danh mục"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên danh mục mới..."
              className="!border !border-gray-300 focus:!border-blue-500"
            />
            <Typography variant="small" color="gray">
              Danh mục mới sẽ được thêm vào danh sách và tự động chọn cho sản phẩm này.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => {
              setCategoryDialog(false);
              setNewCategoryName("");
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleCreateCategory}
            disabled={creatingCategory || !newCategoryName.trim()}
            className="flex items-center gap-2"
          >
            {creatingCategory ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {creatingCategory ? "Đang tạo..." : "Tạo danh mục"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default UpdateProduct;