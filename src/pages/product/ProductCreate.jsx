import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "@/services/product/ProductService";
import categoryService from "@/services/category/CategoryService";
import tagService from "@/services/tags/TagService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageUploadService from "@/services/product/ImageUploadService";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Checkbox,
  Spinner,
  Chip,
  Select,
  Option,
  IconButton,
} from "@material-tailwind/react";
import {
  PlusIcon,
  ArrowLeftIcon,
  PhotoIcon,
  TagIcon,
  CheckBadgeIcon,
  CubeIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function ProductCreate() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
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
  const [tags, setTags] = useState([]);
  const [flattenedCategories, setFlattenedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔄 Hàm làm phẳng cấu trúc danh mục
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

  // 📦 Load danh sách category với cấu trúc phân cấp
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
        toast.error("Không thể tải danh mục sản phẩm!");
      }
    };

    fetchCategories();
  }, []);

  // 📦 Load danh sách tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
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
        toast.error("Không thể tải tags!");
      }
    };

    fetchTags();
  }, []);

  // 🔹 Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!form.name.trim()) {
      errors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!form.description.trim()) {
      errors.description = "Mô tả sản phẩm là bắt buộc";
    }
    
    if (!form.price || Number(form.price) <= 0) {
      errors.price = "Giá sản phẩm phải lớn hơn 0";
    }
    
    if (!form.quantity || Number(form.quantity) < 0) {
      errors.quantity = "Số lượng không hợp lệ";
    }
    
    if (form.categoryIds.length === 0) {
      errors.categoryIds = "Vui lòng chọn ít nhất một danh mục";
    }
    
    if (!imageUrl) {
      errors.image = "Vui lòng upload ảnh chính cho sản phẩm";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔹 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  // 🔹 Xử lý chọn file ảnh
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP)!");
      return;
    }

    setMainImageFile(file);
    setImageUploaded(false); // Reset trạng thái upload khi chọn ảnh mới
    setImageUrl(""); // Reset URL
    setUploadResult(null); // Reset kết quả upload

    // Clear error ảnh
    if (formErrors.image) {
      setFormErrors({
        ...formErrors,
        image: ""
      });
    }

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
    
    // Clear error ảnh
    if (formErrors.image) {
      setFormErrors({
        ...formErrors,
        image: ""
      });
    }
  };

  // 🔹 Upload ảnh lên server - ĐÃ SỬA
  const uploadImageToServer = async (file) => {
    if (!file) {
      toast.error("Vui lòng chọn ảnh trước khi upload");
      return null;
    }

    setUploadingImage(true);
    try {
      console.log("📤 Đang upload ảnh...", file.name);
      
      const res = await imageUploadService.uploadImage(file);
      console.log("📦 Response from service:", res);

      if (!res.success) {
        toast.error(`❌ Upload thất bại: ${res.message}`);
        return null;
      }

      if (!res.data) {
        toast.error("❌ Không nhận được dữ liệu từ server");
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
        toast.error("❌ Server không trả về URL ảnh");
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
      toast.success("✅ Upload ảnh thành công!");
      return { url: imageUrl, data: res.data };
      
    } catch (error) {
      console.error("❌ Lỗi khi upload ảnh:", error);
      toast.error("❌ Upload ảnh thất bại!");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // 🔹 Chọn nhiều category
  const handleCategoryChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setForm({ ...form, categoryIds: selectedIds });
    
    if (formErrors.categoryIds) {
      setFormErrors({
        ...formErrors,
        categoryIds: ""
      });
    }
  };

  // 🔹 Xử lý chọn category bằng Chip (alternative)
  const toggleCategory = (categoryId) => {
    setForm(prev => {
      const newCategoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  // 🔹 Chọn nhiều tag
  const handleTagChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setForm({ ...form, tagIds: selectedIds });
  };

  // 🧩 Submit form tạo sản phẩm - ĐÃ SỬA
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra nếu đang upload ảnh
    if (uploadingImage) {
      toast.warning("⚠️ Đang upload ảnh, vui lòng đợi...");
      return;
    }

    // Nếu có ảnh nhưng chưa upload, upload ngay
    if (mainImageFile && !imageUploaded) {
      const result = await uploadImageToServer(mainImageFile);
      if (!result || !result.url) {
        toast.error("❌ Không thể upload ảnh. Vui lòng thử lại!");
        return;
      }
    } 
    // Nếu không có ảnh
    else if (!mainImageFile) {
      toast.error("❌ Vui lòng chọn ảnh sản phẩm!");
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error("⚠️ Vui lòng kiểm tra lại thông tin!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        active: form.active,
        mainImageUrl: imageUrl,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
        // Thêm metadata từ upload nếu có
        ...(uploadResult && { imageMetadata: uploadResult })
      };

      console.log("📤 Sending payload to create product:", payload);
      
      const response = await ProductService.createProduct(payload);
      console.log("✅ Product created successfully:", response);

      toast.success("✅ Thêm sản phẩm thành công!");
 
      setTimeout(() => {
        navigate("/dashboard/products", { state: { reload: true }, replace: true });
        window.location.reload();
      }, 300);
      
    } catch (err) {
      console.error("❌ Lỗi khi tạo sản phẩm:", err);
      
      // Hiển thị chi tiết lỗi
      let errorMessage = "Không xác định";
      if (err.response) {
        console.error("❌ Error response:", err.response);
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      JSON.stringify(err.response.data) || 
                      `HTTP ${err.response.status}`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(`❌ Thêm sản phẩm thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách category đã chọn để hiển thị
  const selectedCategories = flattenedCategories.filter(cat => 
    form.categoryIds.includes(cat.id)
  );

  // Lấy danh sách tag đã chọn để hiển thị
  const selectedTags = tags.filter(tag => 
    form.tagIds.includes(tag.id)
  );

  // 🔄 Tự động upload khi chọn ảnh (tuỳ chọn)
  useEffect(() => {
    if (mainImageFile && !imageUploaded && !uploadingImage) {
      // Tự động upload sau 1 giây nếu user không upload thủ công
      const autoUploadTimer = setTimeout(() => {
        uploadImageToServer(mainImageFile);
      }, 1000);
      
      return () => clearTimeout(autoUploadTimer);
    }
  }, [mainImageFile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-xl border-0 mb-6 md:mb-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <CardBody className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl">
                  <CubeIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <Typography 
                    variant={isMobile ? "h3" : "h2"} 
                    className="text-white font-bold mb-1 md:mb-2"
                  >
                    Thêm Sản Phẩm Mới
                  </Typography>
                  <Typography 
                    variant="paragraph" 
                    className="text-blue-100 text-sm md:text-base"
                  >
                    Tạo sản phẩm mới cho cửa hàng của bạn
                  </Typography>
                </div>
              </div>
              <Button
                variant="outlined"
                color="white"
                className="flex items-center gap-2 border-2 hover:bg-white/10 mt-4 md:mt-0 w-full md:w-auto"
                onClick={() => navigate("/dashboard/products")}
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm md:text-base">Quay lại danh sách</span>
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Form Errors Summary */}
        {Object.keys(formErrors).length > 0 && (
          <Card className="shadow-md border-l-4 border-red-500 mb-4 md:mb-6">
            <CardBody className="p-3 md:p-4 bg-red-50">
              <div className="flex items-start gap-2 md:gap-3">
                <ExclamationCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-red-500 mt-0.5" />
                <div>
                  <Typography 
                    variant={isMobile ? "h5" : "h6"} 
                    color="red" 
                    className="mb-1"
                  >
                    Vui lòng sửa các lỗi sau:
                  </Typography>
                  <ul className="list-disc pl-4 md:pl-5 text-xs md:text-sm text-red-600">
                    {Object.values(formErrors).map((error, index) => (
                      error && <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardBody className="p-4 md:p-8">
                <div className="flex items-center gap-2 mb-2 md:mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlusIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                  </div>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    color="blue-gray"
                  >
                    Thông tin sản phẩm
                  </Typography>
                </div>
                <Typography 
                  color="gray" 
                  className="mb-4 md:mb-8 text-sm md:text-base"
                >
                  Điền đầy đủ thông tin sản phẩm bên dưới
                </Typography>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {/* Product Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="p-1.5 bg-blue-50 rounded-md">
                        <CubeIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <Typography 
                        variant={isMobile ? "small" : "h6"} 
                        color="blue-gray"
                      >
                        Tên sản phẩm *
                      </Typography>
                    </div>
                    <Input
                      label="Tên sản phẩm"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      size={isMobile ? "md" : "lg"}
                      className={`!border ${formErrors.name ? '!border-red-500' : '!border-gray-300'} focus:!border-blue-500`}
                      error={!!formErrors.name}
                    />
                    {formErrors.name && (
                      <div className="flex items-center gap-1 mt-1">
                        <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                        <Typography variant="small" color="red">
                          {formErrors.name}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="p-1.5 bg-blue-50 rounded-md">
                        <TagIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <Typography 
                        variant={isMobile ? "small" : "h6"} 
                        color="blue-gray"
                      >
                        Mô tả sản phẩm *
                      </Typography>
                    </div>
                    <Textarea
                      label="Mô tả sản phẩm"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      size={isMobile ? "md" : "lg"}
                      className={`!border ${formErrors.description ? '!border-red-500' : '!border-gray-300'} focus:!border-blue-500 min-h-[100px] md:min-h-[120px]`}
                      error={!!formErrors.description}
                    />
                    {formErrors.description && (
                      <div className="flex items-center gap-1 mt-1">
                        <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                        <Typography variant="small" color="red">
                          {formErrors.description}
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Price + Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <div className="p-1.5 bg-green-50 rounded-md">
                          <CurrencyDollarIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        </div>
                        <Typography 
                          variant={isMobile ? "small" : "h6"} 
                          color="blue-gray"
                        >
                          Giá bán (VND) *
                        </Typography>
                      </div>
                      <Input
                        type="number"
                        label="Giá sản phẩm"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        min="0"
                        step="1000"
                        size={isMobile ? "md" : "lg"}
                        className={`!border ${formErrors.price ? '!border-red-500' : '!border-gray-300'} focus:!border-blue-500`}
                        error={!!formErrors.price}
                        icon={!isMobile && <Typography variant="small" color="gray">₫</Typography>}
                      />
                      {formErrors.price && (
                        <div className="flex items-center gap-1 mt-1">
                          <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                          <Typography variant="small" color="red">
                            {formErrors.price}
                          </Typography>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <div className="p-1.5 bg-green-50 rounded-md">
                          <HashtagIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                        </div>
                        <Typography 
                          variant={isMobile ? "small" : "h6"} 
                          color="blue-gray"
                        >
                          Số lượng *
                        </Typography>
                      </div>
                      <Input
                        type="number"
                        label="Số lượng"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        min="0"
                        size={isMobile ? "md" : "lg"}
                        className={`!border ${formErrors.quantity ? '!border-red-500' : '!border-gray-300'} focus:!border-blue-500`}
                        error={!!formErrors.quantity}
                      />
                      {formErrors.quantity && (
                        <div className="flex items-center gap-1 mt-1">
                          <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                          <Typography variant="small" color="red">
                            {formErrors.quantity}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Image Upload */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="p-1.5 bg-purple-50 rounded-md">
                        <PhotoIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                      </div>
                      <Typography 
                        variant={isMobile ? "small" : "h6"} 
                        color="blue-gray"
                      >
                        Hình ảnh chính *
                      </Typography>
                    </div>
                    
                    {formErrors.image && (
                      <div className="mb-2 md:mb-3 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-1">
                          <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                          <Typography variant="small" color="red">
                            {formErrors.image}
                          </Typography>
                        </div>
                      </div>
                    )}
                    
                    {!mainImagePreview ? (
                      <div className={`border-2 border-dashed ${formErrors.image ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4 md:p-8 text-center hover:border-blue-500 transition-colors cursor-pointer`}>
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          <input
                            type="file"
                            id="imageUpload"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <CloudArrowUpIcon className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-2 md:mb-4" />
                          <Typography 
                            variant={isMobile ? "small" : "h6"} 
                            color="gray" 
                            className="mb-1 md:mb-2"
                          >
                            Click để upload ảnh chính
                          </Typography>
                          <Typography variant="small" color="gray">
                            JPEG, PNG, WEBP (Tối đa 5MB)
                          </Typography>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border-2 border-gray-200 rounded-lg p-3 md:p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 md:mb-4">
                            <div className="flex items-center gap-2">
                              <PhotoIcon className="h-4 w-4 text-green-500" />
                              <Typography variant="small" color="green" className="font-medium">
                                Ảnh đã chọn
                              </Typography>
                              {imageUploaded && (
                                <div className="flex items-center gap-1 ml-2">
                                  <CheckBadgeIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                                  <Typography variant="small" color="blue" className="hidden md:inline">
                                    Đã upload
                                  </Typography>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!imageUploaded && !uploadingImage && (
                                <Button
                                  size={isMobile ? "sm" : "md"}
                                  color="green"
                                  variant="gradient"
                                  onClick={() => uploadImageToServer(mainImageFile)}
                                  className="flex items-center gap-1"
                                  disabled={uploadingImage}
                                >
                                  <CloudArrowUpIcon className="h-3 w-3 md:h-4 md:w-4" />
                                  {isMobile ? 'Upload' : 'Upload lên server'}
                                </Button>
                              )}
                              <Button
                                size={isMobile ? "sm" : "md"}
                                color="red"
                                variant="outlined"
                                onClick={removeSelectedImage}
                                className="flex items-center gap-1"
                                disabled={uploadingImage}
                              >
                                <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                                {isMobile ? 'Xóa' : 'Xóa ảnh'}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                            <div className="relative mx-auto md:mx-0">
                              <img
                                src={mainImagePreview}
                                alt="Preview"
                                className="h-24 w-24 md:h-32 md:w-32 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                              />
                              {uploadingImage && (
                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                  <Spinner className="h-6 w-6 md:h-8 md:w-8 text-white" />
                                </div>
                              )}
                              {imageUploaded && !uploadingImage && (
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-green-500 text-white p-1 rounded-full">
                                  <CheckBadgeIcon className="h-3 w-3 md:h-4 md:w-4" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Typography variant="small" className="font-medium truncate">
                                {mainImageFile?.name}
                              </Typography>
                              <Typography variant="small" color="gray">
                                {mainImageFile ? `${(mainImageFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                              </Typography>
                              {imageUrl && imageUploaded && (
                                <div className="mt-2">
                                  <Typography variant="small" color="blue" className="font-medium">
                                    URL:
                                  </Typography>
                                  <Typography variant="small" color="blue" className="truncate block">
                                    {isMobile ? imageUrl.substring(0, 30) + '...' : imageUrl}
                                  </Typography>
                                </div>
                              )}
                              {!imageUploaded && (
                                <div className="mt-2">
                                  <div className="flex items-center gap-1">
                                    <ExclamationCircleIcon className="h-3 w-3 text-amber-500" />
                                    <Typography variant="small" color="amber" className="font-medium">
                                      ⚠️ Chưa upload lên server
                                    </Typography>
                                  </div>
                                  <Typography variant="small" color="gray">
                                    Nhấn "Upload lên server" trước khi tạo sản phẩm
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <Typography variant="small" color="gray" className="mt-2">
                      Ảnh này sẽ hiển thị ở trang danh sách và là ảnh đại diện
                    </Typography>
                  </div>

                  {/* Categories */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="p-1.5 bg-blue-50 rounded-md">
                        <TagIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <Typography 
                        variant={isMobile ? "small" : "h6"} 
                        color="blue-gray"
                      >
                        Danh mục *
                      </Typography>
                    </div>

                    <select
                      multiple
                      value={form.categoryIds}
                      onChange={handleCategoryChange}
                      className={`w-full border ${formErrors.categoryIds ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 md:h-40 text-sm md:text-base`}
                    >
                      {flattenedCategories.length > 0 ? (
                        flattenedCategories.map((cat) => (
                          <option 
                            key={cat.id} 
                            value={cat.id}
                            className={`${cat.level === 0 ? 'font-semibold bg-gray-100' : 
                              cat.level === 1 ? 'pl-4 text-sm' : 
                              'pl-6 md:pl-8 text-sm text-gray-600'}`}
                            style={{ 
                              paddingLeft: `${cat.level * (isMobile ? 16 : 20) + 12}px`,
                              fontWeight: cat.level === 0 ? '600' : '400',
                              backgroundColor: cat.level === 0 ? '#f9fafb' : 'transparent'
                            }}
                          >
                            {cat.level > 0 && '└─ '}
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Đang tải danh mục...</option>
                      )}
                    </select>

                    {formErrors.categoryIds && (
                      <div className="flex items-center gap-1 mt-1">
                        <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                        <Typography variant="small" color="red">
                          {formErrors.categoryIds}
                        </Typography>
                      </div>
                    )}

                    <Typography variant="small" color="gray" className="mt-1">
                      Giữ Ctrl hoặc Cmd để chọn nhiều danh mục
                    </Typography>

                    {/* Selected Categories Chips */}
                    {selectedCategories.length > 0 && (
                      <div className="mt-2 md:mt-3">
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                          Đã chọn ({selectedCategories.length}):
                        </Typography>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {selectedCategories.map((cat) => (
                            <Chip
                              key={cat.id}
                              value={isMobile ? cat.name : (cat.fullPath || cat.name)}
                              color="blue"
                              variant="gradient"
                              className="rounded-full text-xs cursor-pointer hover:shadow-md max-w-[200px] truncate"
                              onClick={() => toggleCategory(cat.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="p-1.5 bg-green-50 rounded-md">
                        <TagIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      </div>
                      <Typography 
                        variant={isMobile ? "small" : "h6"} 
                        color="blue-gray"
                      >
                        Tags (tùy chọn)
                      </Typography>
                    </div>

                    <select
                      multiple
                      value={form.tagIds}
                      onChange={handleTagChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-24 md:h-32 text-sm md:text-base"
                    >
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <option 
                            key={tag.id} 
                            value={tag.id}
                            className="py-1"
                          >
                            {tag.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Đang tải tags...</option>
                      )}
                    </select>

                    <Typography variant="small" color="gray" className="mt-1">
                      Giữ Ctrl hoặc Cmd để chọn nhiều tags
                    </Typography>

                    {/* Selected Tags Chips */}
                    {selectedTags.length > 0 && (
                      <div className="mt-2 md:mt-3">
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                          Đã chọn ({selectedTags.length}):
                        </Typography>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {selectedTags.map((tag) => (
                            <Chip
                              key={tag.id}
                              value={tag.name}
                              color="green"
                              variant="gradient"
                              className="rounded-full text-xs max-w-[150px] truncate"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Checkbox */}
                  <div className="flex items-center space-x-3 p-3 md:p-4 bg-gray-50 rounded-xl">
                    <Checkbox
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      color="green"
                      className="h-4 w-4 md:h-5 md:w-5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckBadgeIcon className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                        <Typography 
                          variant={isMobile ? "small" : "h6"} 
                          color="blue-gray"
                        >
                          Trạng thái hoạt động
                        </Typography>
                      </div>
                      <Typography variant="small" color="gray">
                        Sản phẩm sẽ được hiển thị trên cửa hàng
                      </Typography>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
                    <Button
                      variant="outlined"
                      color="red"
                      className="flex-1"
                      onClick={() => navigate("/dashboard/products")}
                      disabled={loading || uploadingImage}
                      size={isMobile ? "md" : "lg"}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2"
                      color="blue"
                      disabled={loading || uploadingImage || !imageUploaded}
                      size={isMobile ? "md" : "lg"}
                    >
                      {(loading) ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          <span className="text-sm md:text-base">Đang tạo sản phẩm...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          <span className="text-sm md:text-base">Tạo sản phẩm</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Preview Sidebar - Ẩn trên mobile nếu quá nhỏ */}
          <div className={`lg:col-span-1 ${isMobile ? 'hidden' : 'block'}`}>
            <Card className="shadow-xl border-0 sticky top-6">
              <CardBody className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="p-1.5 md:p-2 bg-purple-50 rounded-lg">
                    <PhotoIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <Typography 
                    variant={isMobile ? "h5" : "h5"} 
                    color="blue-gray"
                  >
                    Xem trước sản phẩm
                  </Typography>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {mainImagePreview ? (
                    <div className="relative">
                      <img
                        src={mainImagePreview}
                        alt="Product preview"
                        className="w-full h-40 md:h-48 object-cover rounded-lg shadow-md"
                      />
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <Spinner className="h-6 w-6 md:h-8 md:w-8 text-white" />
                        </div>
                      )}
                      {imageUploaded && !uploadingImage && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-green-500 text-white p-1 md:p-2 rounded-full">
                          <CheckBadgeIcon className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-40 md:h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <PhotoIcon className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
                    </div>
                  )}

                  {form.name ? (
                    <div>
                      <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        color="blue-gray" 
                        className="font-bold"
                      >
                        {form.name}
                      </Typography>
                      <Typography variant="small" color="gray" className="mt-1 line-clamp-3">
                        {form.description || "Chưa có mô tả"}
                      </Typography>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <Typography color="gray" className="text-sm italic">
                        Chưa có tên sản phẩm
                      </Typography>
                    </div>
                  )}

                  {form.price ? (
                    <Typography 
                      variant={isMobile ? "h5" : "h5"} 
                      color="green" 
                      className="font-bold"
                    >
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(Number(form.price))}
                    </Typography>
                  ) : (
                    <Typography variant="small" color="gray" className="italic">
                      Chưa có giá
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
                            className="rounded-full text-xs max-w-[120px] truncate"
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
                            className="rounded-full text-xs max-w-[100px] truncate"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-2 md:p-3 bg-blue-50 rounded-lg">
                    <CheckBadgeIcon className={`h-4 w-4 md:h-5 md:w-5 ${form.active ? 'text-green-500' : 'text-red-500'}`} />
                    <Typography 
                      variant="small" 
                      className={form.active ? 'text-green-600' : 'text-red-600'}
                    >
                      {form.active ? 'Đang Bán' : 'Ngừng Bán'}
                    </Typography>
                  </div>

                  {!imageUploaded && mainImageFile && (
                    <div className="p-2 md:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-1">
                        <ExclamationCircleIcon className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
                        <Typography variant="small" color="amber">
                          Ảnh chưa được upload lên server
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Mobile Preview Bottom Sheet */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-2xl z-50 max-h-[60vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <Typography variant="h6" color="blue-gray">
                  Xem trước sản phẩm
                </Typography>
                <IconButton
                  variant="text"
                  color="blue-gray"
                  onClick={() => setIsMobilePreviewOpen(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </IconButton>
              </div>
              
              <div className="space-y-3">
                {mainImagePreview ? (
                  <div className="relative">
                    <img
                      src={mainImagePreview}
                      alt="Product preview"
                      className="w-full h-40 object-cover rounded-lg shadow-md"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Spinner className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {imageUploaded && !uploadingImage && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                        <CheckBadgeIcon className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {form.name && (
                  <div>
                    <Typography variant="small" className="font-bold">
                      {form.name}
                    </Typography>
                    <Typography variant="small" color="gray" className="line-clamp-2">
                      {form.description || "Chưa có mô tả"}
                    </Typography>
                  </div>
                )}

                {form.price && (
                  <Typography variant="small" color="green" className="font-bold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(Number(form.price))}
                  </Typography>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCreate;