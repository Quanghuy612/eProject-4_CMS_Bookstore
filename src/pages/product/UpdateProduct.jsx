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

  // Add state for image upload
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(""); // URL after upload
  const [imageUploaded, setImageUploaded] = useState(false); // Whether image has been uploaded
  const [uploadResult, setUploadResult] = useState(null); // Store upload result

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

  // 🔄 Function to flatten category structure for hierarchical display
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

  // Function to check stock status
  const getStockStatus = () => {
    const quantity = Number(formData.quantity) || 0;
    if (quantity > 0) {
      return {
        status: "in-stock",
        text: "In Stock",
        color: "green"
      };
    } else {
      return {
        status: "out-of-stock", 
        text: "Out of Stock",
        color: "red"
      };
    }
  };

  useEffect(() => {
    const quantity = Number(formData.quantity);
    if (quantity <= 0 && formData.active) {
      // Show warning but don't automatically change
      console.log("⚠️ Product is out of stock but still set to 'Active' status");
    }
  }, [formData.quantity, formData.active]);

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
          console.warn("⚠️ Category data is not in the correct format:", res);
          categoriesData = [];
        }
        
        setCategories(categoriesData);
        
        const flattened = flattenCategories(categoriesData);
        setFlattenedCategories(flattened);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        setMessage("Unable to load product categories!");
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
          console.warn("⚠️ Tag data is not in the correct format:", res);
          tagsData = [];
        }
        
        setTags(tagsData);
      } catch (err) {
        console.error("❌ Error fetching tags:", err);
        setMessage("Unable to load tags!");
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

        // Set image preview and URL from current data
        setImageUrl(currentImageUrl);
        setMainImagePreview(currentImageUrl);
        setImageUploaded(!!currentImageUrl); // Already has image from server
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        setMessage(`Error loading product: ${error.message}`);
        setMessageType("error");
      } finally {
        setFetching(false);
      }
    };
    
    if (productId) fetchProduct();
  }, [productId]);

  // 🔹 Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size should not exceed 5MB!");
      setMessageType("error");
      return;
    }

    // Check file format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setMessage("Only image files are accepted (JPEG, PNG, WEBP)!");
      setMessageType("error");
      return;
    }

    setMainImageFile(file);
    setImageUploaded(false); // Reset upload status when selecting new image

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Remove selected image
  const removeSelectedImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
    setImageUrl("");
    setImageUploaded(false);
    setUploadResult(null);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      mainImageUrl: ""
    }));
  };

  // 🔹 Upload image to server
  const uploadImageToServer = async (file) => {
    if (!file) {
      setMessage("Please select an image before uploading");
      setMessageType("error");
      return null;
    }

    setUploadingImage(true);
    try {
      console.log("📤 Uploading image...", file.name);
      
      const res = await imageUploadService.uploadImage(file);
      console.log("📦 Response from service:", res);

      if (!res.success) {
        setMessage(`❌ Upload failed: ${res.message}`);
        setMessageType("error");
        return null;
      }

      if (!res.data) {
        setMessage("❌ No data received from server");
        setMessageType("error");
        return null;
      }

      // Store entire upload result
      setUploadResult(res.data);
      
      // CHECK FOR POSSIBLE URL FIELDS
      let imageUrl = "";
      
      // Debug: Print all fields in response
      console.log("🔍 Response data fields:", Object.keys(res.data));
      console.log("🔍 Response data values:", res.data);
      
      // Find URL in possible fields
      const possibleUrlFields = ['url', 'imageUrl', 'path', 'filePath', 'location', 'image', 'fileName'];
      for (const field of possibleUrlFields) {
        if (res.data[field]) {
          imageUrl = res.data[field];
          console.log(`✅ Found URL in field '${field}':`, imageUrl);
          break;
        }
      }
      
      if (!imageUrl) {
        console.error("❌ URL not found in response:", res.data);
        setMessage("❌ Server did not return image URL");
        setMessageType("error");
        return null;
      }
      
      // Process URL
      // If it's a filename, add prefix
      if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
        imageUrl = `/static/${imageUrl}`;
      }
      
      // Add base URL if needed
      if (imageUrl && !imageUrl.startsWith('http')) {
        // Ensure leading slash
        if (!imageUrl.startsWith('/')) {
          imageUrl = '/' + imageUrl;
        }
        imageUrl = API_BASE_URL + imageUrl;
      }
      
      console.log("✅ Upload successful. Final URL:", imageUrl);
      
      setImageUrl(imageUrl);
      setImageUploaded(true);
      
      // Update form data with new URL
      setFormData(prev => ({
        ...prev,
        mainImageUrl: imageUrl
      }));
      
      setMessage("✅ Image uploaded successfully!");
      setMessageType("success");
      return { url: imageUrl, data: res.data };
      
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      setMessage("❌ Image upload failed!");
      setMessageType("error");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage("Please enter category name!");
      setMessageType("error");
      return;
    }

    try {
      setCreatingCategory(true);
      const payload = { name: newCategoryName.trim() };
      const res = await categoryService.createCategory(payload);

      const newCat = res?.data?.data || res?.data || res;

      if (!newCat || !newCat.id) {
        throw new Error("Category ID not received from server");
      }

      // Update categories list and flatten again
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

      setMessage("New category created successfully!");
      setMessageType("success");
    } catch (err) {
      console.error("❌ Error creating category:", err);
      setMessage("Category creation failed: " + err.message);
      setMessageType("error");
    } finally {
      setCreatingCategory(false);
    }
  };

  // Create new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setMessage("Please enter tag name!");
      setMessageType("error");
      return;
    }

    try {
      setCreatingTag(true);
      const payload = { name: newTagName.trim() };
      const res = await tagService.createTag(payload);

      const newTag = res?.data?.data || res?.data || res;

      if (!newTag || !newTag.id) {
        throw new Error("Tag ID not received from server");
      }

      setTags((prev) => [...prev, newTag]);
      setNewTagName("");
      setTagDialog(false);

      setFormData(prev => ({
        ...prev,
        tagIds: [...prev.tagIds, String(newTag.id)]
      }));

      setMessage("New tag created successfully!");
      setMessageType("success");
    } catch (err) {
      console.error("❌ Error creating tag:", err);
      setMessage("Tag creation failed: " + err.message);
      setMessageType("error");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Check if image is being uploaded
    if (uploadingImage) {
      setMessage("⚠️ Image is uploading, please wait...");
      setMessageType("warning");
      setLoading(false);
      return;
    }

    // If there's a new image but not uploaded yet, upload immediately
    if (mainImageFile && !imageUploaded) {
      const result = await uploadImageToServer(mainImageFile);
      if (!result || !result.url) {
        setMessage("❌ Unable to upload image. Please try again!");
        setMessageType("error");
        setLoading(false);
        return;
      }
    } 
    // If there's no image (both old and new)
    else if (!formData.mainImageUrl && !mainImageFile) {
      setMessage("❌ Please select a product image!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setMessage("Please enter product name!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setMessage("Please enter a valid product price!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!formData.quantity || Number(formData.quantity) < 0) {
      setMessage("Please enter a valid quantity!");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Check stock logic and status
    const quantity = Number(formData.quantity);
    const isActive = formData.active;
    
    // if (quantity <= 0 && isActive) {
    //   // Product is out of stock but still active
    //   const confirm = window.confirm(
    //     "⚠️ WARNING: Product is out of stock but still set to 'Active' status. " +
    //     "This may confuse customers. " +
    //     "Do you want to automatically switch to 'Inactive' status?"
    //   );
      
    //   if (confirm) {
    //     setFormData(prev => ({
    //       ...prev,
    //       active: false
    //     }));
    //   }
    // } else if (quantity > 0 && !isActive) {
    //   // Product is in stock but inactive
    //   const confirm = window.confirm(
    //     "ℹ️ NOTIFICATION: Product is in stock but set to 'Inactive' status. " +
    //     "Product will not be displayed in the store. " +
    //     "Do you want to automatically switch to 'Active' status?"
    //   );
      
    //   if (confirm) {
    //     setFormData(prev => ({
    //       ...prev,
    //       active: true
    //     }));
    //   }
    // }

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
      setMessage("✅ Product updated successfully!");
      setMessageType("success");
      
      setTimeout(() => {
        navigate("/dashboard/products", { state: { reload: true }, replace: true });
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("❌ Error updating product:", error);
      setMessage(`❌ Update error: ${error.response?.data?.message || error.message}`);
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

    // If manually changing image URL
    if (name === "mainImageUrl") {
      setImageUrl(value);
      setMainImagePreview(value);
      setImageUploaded(!!value); // Consider as uploaded if URL exists
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

  // Function to display full image URL
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

  // 🔄 Auto upload when selecting image (optional)
  useEffect(() => {
    if (mainImageFile && !imageUploaded && !uploadingImage) {
      // Auto upload after 0.1 seconds if user doesn't upload manually
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
            Loading product information...
          </Typography>
          <Typography variant="small" color="gray">
            Please wait a moment
          </Typography>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

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
                    Update Product
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100">
                    Edit product information #{productId}
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
                Go Back
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
                  Product Information
                </Typography>
                <Typography color="gray" className="mb-8">
                  Update product information below
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
                      Product Name
                    </Typography>
                    <Input
                      label="Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name..."
                      required
                      className="!border !border-gray-300 focus:!border-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <CubeIcon className="h-5 w-5" />
                      Product Description
                    </Typography>
                    <Textarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Detailed description of the product..."
                      required
                      className="!border !border-gray-300 focus:!border-blue-500 min-h-[120px]"
                    />
                  </div>

                  {/* Price + Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        Price (VND)
                      </Typography>
                      <Input
                        type="number"
                        label="Product Price"
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
                        Quantity
                      </Typography>
                      <Input
                        type="number"
                        label="Quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        required
                        className="!border !border-gray-300 focus:!border-blue-500"
                      />
                      {/* Display stock status */}
                      {formData.quantity !== "" && (
                        <div className={`mt-2 text-sm font-medium ${stockStatus.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                          Stock Status: {stockStatus.text}
                          {Number(formData.quantity) <= 0 && formData.active && (
                            <span className="text-amber-600 block text-xs mt-1">
                              ⚠️ Product is out of stock but still set to "Active"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Image Upload */}
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5" />
                      Main Image
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
                            Click to upload new image
                          </Typography>
                          <Typography variant="small" color="gray">
                            JPEG, PNG, WEBP (Max 5MB)
                          </Typography>
                          <Typography variant="small" color="blue" className="mt-2">
                            Or enter URL below
                          </Typography>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border-2 border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <Typography variant="small" color="green" className="flex items-center gap-1">
                              <PhotoIcon className="h-4 w-4" />
                              {mainImageFile ? "New image selected" : "Current image"}
                              {imageUploaded && (
                                <span className="text-blue-500 ml-2 flex items-center gap-1">
                                  <CheckBadgeIcon className="h-4 w-4" />
                                  Uploaded to server
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
                                  {uploadingImage ? 'Uploading...' : 'Upload to server'}
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
                                Remove
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
                                {mainImageFile?.name || "Image from URL"}
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
                                    ⚠️ Not uploaded to server
                                  </Typography>
                                  <Typography variant="small" color="gray">
                                    Click "Upload to server" before updating
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* URL Input (fallback) */}
                    <div className="mt-4">
                      <Typography variant="small" color="gray" className="mb-2">
                        Or enter image URL:
                      </Typography>
                      <Input
                        label="Main Image URL"
                        name="mainImageUrl"
                        value={formData.mainImageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="!border !border-gray-300 focus:!border-blue-500"
                      />
                    </div>
                    
                    <Typography variant="small" color="gray" className="mt-2">
                      This image will be displayed on the product list and as the featured image
                    </Typography>
                  </div>

                  {/* Categories - UPDATED WITH HIERARCHICAL DISPLAY */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                        <FolderIcon className="h-5 w-5" />
                        Categories
                      </Typography>
                      {/* <Button
                        size="sm"
                        variant="outlined"
                        color="blue"
                        className="flex items-center gap-2"
                        onClick={() => setCategoryDialog(true)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Category
                      </Button> */}
                    </div>

                    {fetchingCategories ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Spinner className="h-4 w-4" />
                        <Typography variant="small">Loading categories...</Typography>
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
                              {cat.level === 0 && ' (Parent Category)'}
                            </option>
                          ))}
                        </select>
                        <Typography variant="small" color="gray" className="mt-1">
                          Hold Ctrl (Windows) or Cmd (Mac) to select multiple categories
                        </Typography>

                        {selectedCategories.length > 0 && (
                          <div className="mt-3">
                            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                              Selected ({selectedCategories.length}):
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
                      {/* <Button
                        size="sm"
                        variant="outlined"
                        color="green"
                        className="flex items-center gap-2"
                        onClick={() => setTagDialog(true)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Tag
                      </Button> */}
                    </div>

                    {fetchingTags ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Spinner className="h-4 w-4" />
                        <Typography variant="small">Loading tags...</Typography>
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
                          Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags
                        </Typography>

                        {selectedTags.length > 0 && (
                          <div className="mt-3">
                            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                              Selected ({selectedTags.length}):
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

                  {/* Active Checkbox with stock warning */}
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
                        Active Status
                        {Number(formData.quantity) <= 0 && formData.active && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                            ⚠️ Out of Stock
                          </span>
                        )}
                      </Typography>
                      <Typography variant="small" color="gray">
                        {formData.active 
                          ? "Product will be displayed in the store" 
                          : "Product will NOT be displayed in the store"}
                      </Typography>
                      {Number(formData.quantity) <= 0 && formData.active && (
                        <Typography variant="small" color="red" className="mt-1">
                          ⚠️ Product is out of stock but still displayed in the store
                        </Typography>
                      )}
                      {Number(formData.quantity) > 0 && !formData.active && (
                        <Typography variant="small" color="amber" className="mt-1">
                          ℹ️ Product is in stock but not displayed in the store
                        </Typography>
                      )}
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
                      Cancel
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
                          Updating...
                        </>
                      ) : (
                        <>
                          <PencilIcon className="h-4 w-4" />
                          Update Product
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Preview Sidebar - Updated with stock status */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 sticky top-6">
              <CardBody className="p-6">
                <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  Preview
                </Typography>

                <div className="space-y-4">
                  {mainImagePreview ? (
                    <div className="relative">
                      <img
                        src={mainImagePreview}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=Image+Error";
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
                        {formData.description || "No description"}
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
                        Categories:
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
                        Quantity
                      </Typography>
                      <Typography variant="h6" color="blue" className="font-bold">
                        {formData.quantity || 0}
                      </Typography>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${
                      formData.active ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <Typography variant="small" color="blue-gray" className="font-medium">
                        Status
                      </Typography>
                      <Typography 
                        variant="h6" 
                        className={`font-bold ${formData.active ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {formData.active ? 'Active' : 'Inactive'}
                      </Typography>
                    </div>
                  </div>

                  {/* Display stock status in preview */}
                  <div className={`p-3 rounded-lg text-center ${
                    stockStatus.color === 'green' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Stock
                    </Typography>
                    <Typography 
                      variant="h6" 
                      className={`font-bold ${stockStatus.color === 'green' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {stockStatus.text}
                    </Typography>
                    {Number(formData.quantity) <= 0 && formData.active && (
                      <Typography variant="small" color="red" className="mt-1">
                        ⚠️ Product out of stock
                      </Typography>
                    )}
                  </div>

                  {!formData.name && (
                    <div className="text-center py-8">
                      <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <Typography color="gray" className="text-sm">
                        Product information will appear here
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
            Add New Category
          </Typography>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter new category name..."
              className="!border !border-gray-300 focus:!border-blue-500"
            />
            <Typography variant="small" color="gray">
              The new category will be added to the list and automatically selected for this product.
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
            Cancel
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
            {creatingCategory ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={tagDialog} handler={setTagDialog}>
        <DialogHeader className="flex items-center gap-3">
          <PlusIcon className="h-5 w-5 text-green-500" />
          <Typography variant="h5" color="blue-gray">
            Add New Tag
          </Typography>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Tag Name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter new tag name..."
              className="!border !border-gray-300 focus:!border-green-500"
            />
            <Typography variant="small" color="gray">
              The new tag will be added to the list and automatically selected for this product.
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
            Cancel
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
            {creatingTag ? "Creating..." : "Create Tag"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default UpdateProduct;