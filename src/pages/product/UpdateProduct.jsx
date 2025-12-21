import React, { useEffect, useState } from "react";
import ProductService from "@/services/product/ProductService";
import categoryService from "@/services/category/CategoryService";
import tagService from "@/services/tags/TagService";
import imageUploadService from "@/services/product/ImageUploadService";
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
  XMarkIcon,
  FolderIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    mainImageUrl: "",
    active: true,
    categoryIds: [],
    tagIds: [],
  });

  // Thêm state cho upload ảnh
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(""); // URL ảnh sau khi upload
  const [imageUploaded, setImageUploaded] = useState(false); // Trạng thái đã upload chưa
  const [uploadResult, setUploadResult] = useState(null); // Lưu kết quả upload

  const [categories, setCategories] = useState([]);
  const [flattenedCategories, setFlattenedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [fetchingTags, setFetchingTags] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [tagDialog, setTagDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);

  // 🔄 Hàm làm phẳng cấu trúc danh mục để hiển thị phân cấp
  const flattenCategories = (categories, level = 0, parentName = "") => {
    let result = [];
    
    categories.forEach(category => {
      result.push({
        ...category,
        level,
        displayName: `${"─ ".repeat(level)}${category.name}`,
        fullPath: parentName ? `${parentName} › ${category.name}` : category.name
      });
      
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1, category.name));
      }
    });
    
    return result;
  };

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);
        const res = await categoryService.getAllCategories();
        
        let categoriesData = [];
        if (Array.isArray(res)) {
          categoriesData = res;
        } else if (Array.isArray(res?.data)) {
          categoriesData = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          categoriesData = res.data.data;
        } else {
          console.warn("⚠️ Dữ liệu category không đúng định dạng:", res);
          categoriesData = [];
        }
        
        setCategories(categoriesData);
        
        const flattened = flattenCategories(categoriesData);
        setFlattenedCategories(flattened);
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

  // Load tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setFetchingTags(true);
        const res = await tagService.getAllTags();
        
        let tagsData = [];
        if (Array.isArray(res)) {
          tagsData = res;
        } else if (Array.isArray(res?.data)) {
          tagsData = res.data;
        } else if (Array.isArray(res?.data?.data)) {
          tagsData = res.data.data;
        } else {
          console.warn("⚠️ Dữ liệu tag không đúng định dạng:", res);
          tagsData = [];
        }
        
        setTags(tagsData);
      } catch (err) {
        console.error("❌ Error fetching tags:", err);
        setMessage("Không thể tải tags!");
        setMessageType("error");
      } finally {
        setFetchingTags(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const res = await ProductService.getProductDetails(productId);
        const data = res?.data || res; 

        console.log("📦 Product data:", data);

        const productCategories = data.categories || data.categoryList || [];
        const categoryIds = productCategories
          .map(cat => cat?.id || cat?.categoryId)
          .filter(id => id != null && id !== undefined)
          .map(id => String(id));

        const productTags = data.tags || [];
        const tagIds = productTags
          .map(tag => tag?.id || tag?.tagId)
          .filter(id => id != null && id !== undefined)
          .map(id => String(id));

        const currentImageUrl = data.mainImageUrl || "";

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price != null ? String(data.price) : "",
          quantity: data.quantity != null ? String(data.quantity) : "",
          mainImageUrl: currentImageUrl,
          active: data.active ?? true,
          categoryIds: categoryIds,
          tagIds: tagIds,
        });

        // Set image preview và URL từ dữ liệu hiện tại
        setImageUrl(currentImageUrl);
        setMainImagePreview(currentImageUrl);
        setImageUploaded(!!currentImageUrl); // Đã có ảnh từ server
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        setMessage(`Lỗi tải sản phẩm: ${error.message}`);
        setMessageType("error");
      } finally {
        setFetching(false);
      }
    };
    
    if (productId) fetchProduct();
  }, [productId]);

  // 🔹 Xử lý chọn file ảnh
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Kích thước ảnh không được vượt quá 5MB!");
      setMessageType("error");
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setMessage("Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP)!");
      setMessageType("error");
      return;
    }

    setMainImageFile(file);
    setImageUploaded(false); // Reset trạng thái upload khi chọn ảnh mới

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Xóa ảnh đã chọn
  const removeSelectedImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
    setImageUrl("");
    setImageUploaded(false);
    setUploadResult(null);
    
    // Cập nhật form data
    setFormData(prev => ({
      ...prev,
      mainImageUrl: ""
    }));
  };

  // 🔹 Upload ảnh lên server
  const uploadImageToServer = async (file) => {
    if (!file) {
      setMessage("Vui lòng chọn ảnh trước khi upload");
      setMessageType("error");
      return null;
    }

    setUploadingImage(true);
    try {
      console.log("📤 Đang upload ảnh...", file.name);
      
      const res = await imageUploadService.uploadImage(file);
      console.log("📦 Response from service:", res);

      if (!res.success) {
        setMessage(`❌ Upload thất bại: ${res.message}`);
        setMessageType("error");
        return null;
      }

      if (!res.data) {
        setMessage("❌ Không nhận được dữ liệu từ server");
        setMessageType("error");
        return null;
      }

      // Lưu toàn bộ kết quả upload
      setUploadResult(res.data);
      
      // KIỂM TRA CÁC TRƯỜNG CÓ THỂ CÓ URL
      let imageUrl = "";
      
      // Debug: In tất cả fields trong response
      console.log("🔍 Response data fields:", Object.keys(res.data));
      console.log("🔍 Response data values:", res.data);
      
      // Tìm URL trong các field có thể có
      const possibleUrlFields = ['url', 'imageUrl', 'path', 'filePath', 'location', 'image', 'fileName'];
      for (const field of possibleUrlFields) {
        if (res.data[field]) {
          imageUrl = res.data[field];
          console.log(`✅ Found URL in field '${field}':`, imageUrl);
          break;
        }
      }
      
      if (!imageUrl) {
        console.error("❌ Không tìm thấy URL trong response:", res.data);
        setMessage("❌ Server không trả về URL ảnh");
        setMessageType("error");
        return null;
      }
      
      // Xử lý URL
      // Nếu là tên file, thêm prefix
      if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
        imageUrl = `/static/${imageUrl}`;
      }
      
      // Thêm base URL nếu cần
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Đảm bảo có dấu / ở đầu
        if (!imageUrl.startsWith('/')) {
          imageUrl = '/' + imageUrl;
        }
        imageUrl = API_BASE_URL + imageUrl;
      }
      
      console.log("✅ Upload thành công. Final URL:", imageUrl);
      
      setImageUrl(imageUrl);
      setImageUploaded(true);
      
      // Cập nhật form data với URL mới
      setFormData(prev => ({
        ...prev,
        mainImageUrl: imageUrl
      }));
      
      
      setMessage("✅ Upload ảnh thành công!");
      setMessageType("success");
      return { url: imageUrl, data: res.data };
      
    } catch (error) {
      console.error("❌ Lỗi khi upload ảnh:", error);
      setMessage("❌ Upload ảnh thất bại!");
      setMessageType("error");
      return null;
    } finally {
      setUploadingImage(false);
      
    }
  };

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

      // Cập nhật danh sách categories và làm phẳng lại
      const updatedCategories = [...categories, newCat];
      setCategories(updatedCategories);
      const flattened = flattenCategories(updatedCategories);
      setFlattenedCategories(flattened);
      
      setNewCategoryName("");
      setCategoryDialog(false);

      setFormData(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, String(newCat.id)]
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

  // Tạo tag mới
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setMessage("Vui lòng nhập tên tag!");
      setMessageType("error");
      return;
    }

    try {
      setCreatingTag(true);
      const payload = { name: newTagName.trim() };
      const res = await tagService.createTag(payload);

      const newTag = res?.data?.data || res?.data || res;

      if (!newTag || !newTag.id) {
        throw new Error("Không nhận được ID tag từ server");
      }

      setTags((prev) => [...prev, newTag]);
      setNewTagName("");
      setTagDialog(false);

      setFormData(prev => ({
        ...prev,
        tagIds: [...prev.tagIds, String(newTag.id)]
      }));

      setMessage("Tạo tag mới thành công!");
      setMessageType("success");
    } catch (err) {
      console.error("❌ Lỗi khi tạo tag:", err);
      setMessage("Tạo tag thất bại: " + err.message);
      setMessageType("error");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Kiểm tra nếu đang upload ảnh
    if (uploadingImage) {
      setMessage("⚠️ Đang upload ảnh, vui lòng đợi...");
      setMessageType("warning");
      setLoading(false);
      return;
    }

    // Nếu có ảnh mới nhưng chưa upload, upload ngay
    if (mainImageFile && !imageUploaded) {
      const result = await uploadImageToServer(mainImageFile);
      if (!result || !result.url) {
        setMessage("❌ Không thể upload ảnh. Vui lòng thử lại!");
        setMessageType("error");
        setLoading(false);
        return;
      }
    } 
    // Nếu không có ảnh (cả cũ và mới)
    else if (!formData.mainImageUrl && !mainImageFile) {
      setMessage("❌ Vui lòng chọn ảnh sản phẩm!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setMessage("Vui lòng nhập tên sản phẩm!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setMessage("Vui lòng nhập giá sản phẩm hợp lệ!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!formData.quantity || Number(formData.quantity) < 0) {
      setMessage("Vui lòng nhập số lượng hợp lệ!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        mainImageUrl: formData.mainImageUrl,
        active: formData.active,
        categoryIds: formData.categoryIds.map(id => Number(id)),
        tagIds: formData.tagIds.map(id => Number(id)),
      };

      console.log("📤 Payload:", payload);

      await ProductService.updateProduct(productId, payload);
      setMessage("✅ Cập nhật sản phẩm thành công!");
      setMessageType("success");
      
      setTimeout(() => {
        navigate("/dashboard/products", { state: { reload: true }, replace: true });
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("❌ Error updating product:", error);
      setMessage(`❌ Lỗi cập nhật: ${error.response?.data?.message || error.message}`);
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

    // Nếu thay đổi URL ảnh thủ công
    if (name === "mainImageUrl") {
      setImageUrl(value);
      setMainImagePreview(value);
      setImageUploaded(!!value); // Coi như đã upload nếu có URL
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    setFormData(prev => ({ ...prev, categoryIds: selectedIds }));
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    setFormData(prev => ({ ...prev, tagIds: selectedIds }));
  };

  const removeCategory = (categoryIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.filter(id => id !== categoryIdToRemove)
    }));
  };

  const removeTag = (tagIdToRemove) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.filter(id => id !== tagIdToRemove)
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const selectedCategories = flattenedCategories.filter(cat => 
    formData.categoryIds.includes(String(cat.id))
  );

  const selectedTags = tags.filter(tag => 
    formData.tagIds.includes(String(tag.id))
  );

  // Hàm hiển thị full image URL
  const getFullImageUrl = (url) => {
    if (!url) return "";
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/static/')) {
      return API_BASE_URL + url;
    }
    
    return API_BASE_URL + '/static/' + url;
  };

  // 🔄 Tự động upload khi chọn ảnh (tuỳ chọn)
  useEffect(() => {
    if (mainImageFile && !imageUploaded && !uploadingImage) {
      // Tự động upload sau 0,1 giây nếu user không upload thủ công
      const autoUploadTimer = setTimeout(() => {
        uploadImageToServer(mainImageFile);
      }, 100);
      
      return () => clearTimeout(autoUploadTimer);
    }
  }, [mainImageFile]);

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
      <div className="max-w-6xl mx-auto">
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
                        min="0"
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
                        min="0"
                        required
                        className="!border !border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Main Image Upload */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5" />
                      Hình ảnh chính
                    </Typography>
                    
                    {!mainImagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          <input
                            type="file"
                            id="imageUpload"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <Typography variant="h6" color="gray" className="mb-2">
                            Click để upload ảnh mới
                          </Typography>
                          <Typography variant="small" color="gray">
                            JPEG, PNG, WEBP (Tối đa 5MB)
                          </Typography>
                          <Typography variant="small" color="blue" className="mt-2">
                            Hoặc nhập URL bên dưới
                          </Typography>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <Typography variant="small" color="green" className="flex items-center gap-1">
                              <PhotoIcon className="h-4 w-4" />
                              {mainImageFile ? "Ảnh mới đã chọn" : "Ảnh hiện tại"}
                              {imageUploaded && (
                                <span className="text-blue-500 ml-2 flex items-center gap-1">
                                  <CheckBadgeIcon className="h-4 w-4" />
                                  Đã upload lên server
                                </span>
                              )}
                            </Typography>
                            <div className="flex gap-2">
                              {!imageUploaded && mainImageFile && !uploadingImage && (
                                <Button
                                  size="sm"
                                  color="green"
                                  variant="gradient"
                                  onClick={() => uploadImageToServer(mainImageFile)}
                                  className="flex items-center gap-1"
                                  disabled={uploadingImage}
                                >
                                  <CloudArrowUpIcon className="h-4 w-4" />
                                  {uploadingImage ? 'Đang upload...' : 'Upload lên server'}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="red"
                                variant="outlined"
                                onClick={removeSelectedImage}
                                className="flex items-center gap-1"
                                disabled={uploadingImage}
                              >
                                <TrashIcon className="h-4 w-4" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={mainImagePreview}
                                alt="Preview"
                                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                              />
                              {uploadingImage && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                  <Spinner className="h-8 w-8 text-white" />
                                </div>
                              )}
                              {imageUploaded && !uploadingImage && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                  <CheckBadgeIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Typography variant="small" className="font-medium">
                                {mainImageFile?.name || "Ảnh từ URL"}
                              </Typography>
                              {mainImageFile && (
                                <Typography variant="small" color="gray">
                                  {mainImageFile ? `${(mainImageFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                                </Typography>
                              )}
                              {imageUrl && imageUploaded && (
                                <div className="mt-2">
                                  <Typography variant="small" color="blue" className="font-medium">
                                    URL:
                                  </Typography>
                                  <Typography variant="small" color="blue" className="truncate max-w-xs">
                                    {getFullImageUrl(imageUrl)}
                                  </Typography>
                                </div>
                              )}
                              {!imageUploaded && mainImageFile && (
                                <div className="mt-2">
                                  <Typography variant="small" color="amber" className="font-medium flex items-center gap-1">
                                    <ExclamationCircleIcon className="h-4 w-4" />
                                    ⚠️ Chưa upload lên server
                                  </Typography>
                                  <Typography variant="small" color="gray">
                                    Nhấn "Upload lên server" trước khi cập nhật
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Input URL (fallback) */}
                    <div className="mt-4">
                      <Typography variant="small" color="gray" className="mb-2">
                        Hoặc nhập URL ảnh:
                      </Typography>
                      <Input
                        label="URL hình ảnh chính"
                        name="mainImageUrl"
                        value={formData.mainImageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="!border !border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    
                    <Typography variant="small" color="gray" className="mt-2">
                      Ảnh này sẽ hiển thị ở trang danh sách và là ảnh đại diện
                    </Typography>
                  </div>

                  {/* Categories - ĐÃ CẬP NHẬT HIỂN THỊ PHÂN CẤP */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                        <FolderIcon className="h-5 w-5" />
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
                        <select
                          multiple
                          value={formData.categoryIds}
                          onChange={handleCategoryChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-40"
                        >
                          {flattenedCategories.map((cat) => (
                            <option 
                              key={cat.id} 
                              value={String(cat.id)}
                              className={`${cat.level > 0 ? 'pl-' + (cat.level * 4) : ''} ${
                                cat.level === 0 ? 'font-semibold bg-gray-100' : 
                                cat.level === 1 ? 'pl-4 text-sm' : 
                                'pl-8 text-sm text-gray-600'
                              }`}
                              style={{ 
                                paddingLeft: `${cat.level * 20 + 12}px`,
                                fontWeight: cat.level === 0 ? '600' : '400',
                                backgroundColor: cat.level === 0 ? '#f9fafb' : 'transparent'
                              }}
                            >
                              {cat.level > 0 && '└─ '}
                              {cat.name}
                              {cat.level === 0 && ' (Danh mục cha)'}
                            </option>
                          ))}
                        </select>
                        <Typography variant="small" color="gray" className="mt-1">
                          Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều danh mục
                        </Typography>

                        {selectedCategories.length > 0 && (
                          <div className="mt-3">
                            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                              Đã chọn ({selectedCategories.length}):
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {selectedCategories.map((cat) => (
                                <Chip
                                  key={cat.id}
                                  value={
                                    <div className="flex items-center gap-1">
                                      {cat.fullPath || cat.name}
                                      <button
                                        type="button"
                                        onClick={() => removeCategory(String(cat.id))}
                                        className="hover:text-red-500 transition-colors ml-1"
                                      >
                                        <XMarkIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  }
                                  color="blue"
                                  className="rounded-full"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                        <TagIcon className="h-5 w-5" />
                        Tags
                      </Typography>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="green"
                        className="flex items-center gap-2"
                        onClick={() => setTagDialog(true)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Thêm tag
                      </Button>
                    </div>

                    {fetchingTags ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Spinner className="h-4 w-4" />
                        <Typography variant="small">Đang tải tags...</Typography>
                      </div>
                    ) : (
                      <>
                        <select
                          multiple
                          value={formData.tagIds}
                          onChange={handleTagChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-32"
                        >
                          {tags.map((tag) => (
                            <option key={tag.id} value={String(tag.id)}>
                              {tag.name}
                            </option>
                          ))}
                        </select>
                        <Typography variant="small" color="gray" className="mt-1">
                          Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều tags
                        </Typography>

                        {selectedTags.length > 0 && (
                          <div className="mt-3">
                            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                              Đã chọn ({selectedTags.length}):
                            </Typography>
                            <div className="flex flex-wrap gap-2">
                              {selectedTags.map((tag) => (
                                <Chip
                                  key={tag.id}
                                  value={
                                    <div className="flex items-center gap-1">
                                      {tag.name}
                                      <button
                                        type="button"
                                        onClick={() => removeTag(String(tag.id))}
                                        className="hover:text-red-500 transition-colors ml-1"
                                      >
                                        <XMarkIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  }
                                  color="green"
                                  className="rounded-full"
                                />
                              ))}
                            </div>
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
                      disabled={loading || uploadingImage}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2"
                      color="blue"
                      disabled={loading || uploadingImage}
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
                  {mainImagePreview ? (
                    <div className="relative">
                      <img
                        src={mainImagePreview}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=Ảnh+lỗi";
                        }}
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <Spinner className="h-8 w-8 text-white" />
                        </div>
                      )}
                      {imageUploaded && !uploadingImage && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                          <CheckBadgeIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
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
                            value={cat.fullPath || cat.name}
                            size="sm"
                            color="blue"
                            variant="outlined"
                            className="rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTags.length > 0 && (
                    <div>
                      <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                        Tags:
                      </Typography>
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map((tag) => (
                          <Chip
                            key={tag.id}
                            value={tag.name}
                            size="sm"
                            color="green"
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

      {/* Add Tag Dialog */}
      <Dialog open={tagDialog} handler={setTagDialog}>
        <DialogHeader className="flex items-center gap-3">
          <PlusIcon className="h-5 w-5 text-green-500" />
          <Typography variant="h5" color="blue-gray">
            Thêm tag mới
          </Typography>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Tên tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nhập tên tag mới..."
              className="!border !border-gray-300 focus:!border-green-500"
            />
            <Typography variant="small" color="gray">
              Tag mới sẽ được thêm vào danh sách và tự động chọn cho sản phẩm này.
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="gap-3">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => {
              setTagDialog(false);
              setNewTagName("");
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleCreateTag}
            disabled={creatingTag || !newTagName.trim()}
            className="flex items-center gap-2"
            color="green"
          >
            {creatingTag ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {creatingTag ? "Đang tạo..." : "Tạo tag"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default UpdateProduct;