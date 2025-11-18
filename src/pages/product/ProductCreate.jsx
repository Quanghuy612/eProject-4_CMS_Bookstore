import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "@/services/product/ProductService";
import categoryService from "@/services/category/CategoryService";
import tagService from "@/services/tags/TagService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    active: true,
    mainImageUrl: "",
    categoryIds: [],
    tagIds: [],
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [flattenedCategories, setFlattenedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // 🔄 Hàm làm phẳng cấu trúc danh mục
  const flattenCategories = (categories, level = 0, parentName = "") => {
    let result = [];
    
    categories.forEach(category => {
      // Thêm danh mục cha
      result.push({
        ...category,
        level,
        displayName: `${"─ ".repeat(level)}${category.name}`,
        fullPath: parentName ? `${parentName} › ${category.name}` : category.name
      });
      
      // Thêm danh mục con nếu có
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

        // Xử lý dữ liệu trả về theo nhiều định dạng khác nhau
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
        
        // Làm phẳng danh sách category để hiển thị
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

  // 🔹 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    // Preview image khi URL thay đổi
    if (name === "mainImageUrl") {
      setImagePreview(value);
    }
  };

  // 🔹 Chọn nhiều category
  const handleCategoryChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setForm({ ...form, categoryIds: selectedIds });
  };

  // 🔹 Chọn nhiều tag
  const handleTagChange = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setForm({ ...form, tagIds: selectedIds });
  };

  // 🟢 Tạo category mới
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.warning("⚠️ Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      const payload = { name: newCategoryName.trim() };
      const res = await categoryService.createCategory(payload);

      // ✅ Xử lý dữ liệu trả về
      const newCat =
        res?.data?.data || res?.data || res;

      toast.success("✅ Tạo danh mục mới thành công!");

      // Thêm category mới vào danh sách và làm mới
      const updatedCategories = [...categories, newCat];
      setCategories(updatedCategories);
      setFlattenedCategories(flattenCategories(updatedCategories));
      setNewCategoryName("");
    } catch (err) {
      console.error("❌ Lỗi khi tạo danh mục:", err);
      toast.error("Tạo danh mục thất bại!");
    }
  };

  // 🟢 Tạo tag mới
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.warning("⚠️ Vui lòng nhập tên tag!");
      return;
    }

    try {
      const payload = { name: newTagName.trim() };
      const res = await tagService.createTag(payload);

      // ✅ Xử lý dữ liệu trả về
      const newTag =
        res?.data?.data || res?.data || res;

      toast.success("✅ Tạo tag mới thành công!");

      // Thêm tag mới vào danh sách
      setTags(prev => [...prev, newTag]);
      setNewTagName("");
    } catch (err) {
      console.error("❌ Lỗi khi tạo tag:", err);
      toast.error("Tạo tag thất bại!");
    }
  };

  // 🧩 Submit form tạo sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.categoryIds.length === 0) {
      toast.warning("⚠️ Vui lòng chọn ít nhất một danh mục!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quantity: Number(form.quantity),
        active: form.active,
        mainImageUrl: form.mainImageUrl,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
      };

      await ProductService.createProduct(payload);

      toast.success("✅ Thêm sản phẩm thành công!");
      navigate("/dashboard/products", { replace: true });
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      console.error(err);
      toast.error("❌ Thêm sản phẩm thất bại! Vui lòng thử lại.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="shadow-xl border-0 mb-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <CardBody className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <CubeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <Typography variant="h2" className="text-white font-bold mb-2">
                    Thêm Sản Phẩm Mới
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100">
                    Tạo sản phẩm mới cho cửa hàng của bạn
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
                  <PlusIcon className="h-6 w-6 text-blue-500" />
                  Thông tin sản phẩm
                </Typography>
                <Typography color="gray" className="mb-8">
                  Điền đầy đủ thông tin sản phẩm bên dưới
                </Typography>

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
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nhập tên sản phẩm..."
                      required
                      className="!border !border-gray-300 focus:!border-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Mô tả sản phẩm
                    </Typography>
                    <Textarea
                      label="Mô tả sản phẩm"
                      name="description"
                      value={form.description}
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
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        className="!border !border-gray-300 focus:!border-blue-500"
                        icon={<Typography variant="small" color="gray">₫</Typography>}
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
                        value={form.quantity}
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
                      value={form.mainImageUrl}
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
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Danh mục
                    </Typography>

                    <select
                      multiple
                      value={form.categoryIds}
                      onChange={handleCategoryChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-40"
                    >
                      {flattenedCategories.length > 0 ? (
                        flattenedCategories.map((cat) => (
                          <option 
                            key={cat.id} 
                            value={cat.id}
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
                        ))
                      ) : (
                        <option disabled>Đang tải danh mục...</option>
                      )}
                    </select>

                    {/* Placeholder hiển thị nếu chưa chọn danh mục */}
                    {form.categoryIds.length === 0 && (
                      <Typography variant="small" color="gray" className="mt-2 italic">
                        -- Vui lòng chọn ít nhất một danh mục --
                      </Typography>
                    )}

                    <Typography variant="small" color="gray" className="mt-1">
                      Giữ Ctrl hoặc Cmd để chọn nhiều danh mục
                    </Typography>

                    {/* Selected Categories Chips */}
                    {selectedCategories.length > 0 && (
                      <div className="mt-3">
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                          Đã chọn ({selectedCategories.length}):
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategories.map((cat) => (
                            <Chip
                              key={cat.id}
                              value={cat.fullPath || cat.name}
                              color="blue"
                              variant="gradient"
                              className="rounded-full text-xs"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Tags
                    </Typography>

                    <select
                      multiple
                      value={form.tagIds}
                      onChange={handleTagChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-32"
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

                    {/* Placeholder hiển thị nếu chưa chọn tag */}
                    {form.tagIds.length === 0 && (
                      <Typography variant="small" color="gray" className="mt-2 italic">
                        -- Chọn tags cho sản phẩm (tùy chọn) --
                      </Typography>
                    )}

                    <Typography variant="small" color="gray" className="mt-1">
                      Giữ Ctrl hoặc Cmd để chọn nhiều tags
                    </Typography>

                    {/* Selected Tags Chips */}
                    {selectedTags.length > 0 && (
                      <div className="mt-3">
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                          Đã chọn ({selectedTags.length}):
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag) => (
                            <Chip
                              key={tag.id}
                              value={tag.name}
                              color="green"
                              variant="gradient"
                              className="rounded-full text-xs"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create New Category */}
                  {/* <div className="p-4 bg-blue-50 rounded-lg">
                    <Typography variant="h6" color="blue-gray" className="mb-2 flex items-center gap-2">
                      <PlusIcon className="h-5 w-5 text-blue-500" />
                      Tạo danh mục mới
                    </Typography>
                    <div className="flex gap-2">
                      <Input
                        label="Tên danh mục mới"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nhập tên danh mục mới..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCreateCategory}
                        color="blue"
                        className="whitespace-nowrap"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div> */}

                  {/* Create New Tag */}
                  {/* <div className="p-4 bg-green-50 rounded-lg">
                    <Typography variant="h6" color="blue-gray" className="mb-2 flex items-center gap-2">
                      <PlusIcon className="h-5 w-5 text-green-500" />
                      Tạo tag mới
                    </Typography>
                    <div className="flex gap-2">
                      <Input
                        label="Tên tag mới"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Nhập tên tag mới..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCreateTag}
                        color="green"
                        className="whitespace-nowrap"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div> */}

                  {/* Active Checkbox */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Checkbox
                      name="active"
                      checked={form.active}
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
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          Tạo sản phẩm
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

                  {form.name && (
                    <div>
                      <Typography variant="h6" color="blue-gray" className="font-bold">
                        {form.name}
                      </Typography>
                      <Typography variant="small" color="gray" className="mt-1 line-clamp-3">
                        {form.description || "Chưa có mô tả"}
                      </Typography>
                    </div>
                  )}

                  {form.price && (
                    <Typography variant="h5" color="green" className="font-bold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(form.price)}
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
                            className="rounded-full text-xs"
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
                            className="rounded-full text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckBadgeIcon className={`h-5 w-5 ${form.active ? 'text-green-500' : 'text-red-500'}`} />
                    <Typography variant="small" className={form.active ? 'text-green-600' : 'text-red-600'}>
                      {form.active ? 'Đang Bán' : 'Ngừng Bán'}
                    </Typography>
                  </div>

                  {!form.name && (
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
    </div>
  );
}

export default ProductCreate;