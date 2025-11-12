// src/pages/products/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProductService from "@/services/product/ProductService";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Spinner,
  Chip,
  Avatar,
  Breadcrumbs,
  Badge,
  Progress,
  Tooltip,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CubeIcon,
  TagIcon,
  FolderIcon,
  ArchiveBoxIcon,
  ClockIcon,
  CalendarDaysIcon,
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(0);

  const handleAccordion = (value) => {
    setOpenAccordion(openAccordion === value ? 0 : value);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductDetails(id);
        console.log("📦 Dữ liệu sản phẩm chi tiết:", data);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔄 Hàm làm phẳng cấu trúc danh mục để đếm tổng số
  const flattenCategories = (categories) => {
    let count = 0;
    
    const countCategories = (categoryList) => {
      categoryList.forEach(category => {
        count++;
        if (category.children && category.children.length > 0) {
          countCategories(category.children);
        }
      });
    };
    
    countCategories(categories);
    return count;
  };

  // 🔄 Hàm đệ quy để hiển thị danh mục phân cấp
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category, index) => {
      const categoryName = category.name || category.categoryName || 
                         category.title || `Danh mục ${category.id}`;
      const hasChildren = category.children && category.children.length > 0;
      
      return (
        <div key={category.id || index} className="ml-4">
          {/* Danh mục cha */}
          <div className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            level === 0 ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 flex-1">
              {/* Ký tự phân cấp */}
              <div className="text-gray-400 text-sm w-4">
                {level > 0 && '└─'}
              </div>
              
              {/* Icon danh mục */}
              <FolderIcon className={`h-4 w-4 ${
                level === 0 ? 'text-blue-500' : 
                level === 1 ? 'text-green-500' : 'text-orange-500'
              }`} />
              
              {/* Tên danh mục */}
              <Typography 
                variant="small" 
                className={`font-medium ${
                  level === 0 ? 'text-blue-700' : 
                  level === 1 ? 'text-green-700' : 'text-orange-700'
                }`}
              >
                {categoryName}
              </Typography>
              
              {/* Badge cho danh mục cha */}
              {level === 0 && (
                <Chip
                  value="Danh mục cha"
                  size="sm"
                  color="blue"
                  variant="outlined"
                  className="rounded-full text-xs"
                />
              )}
            </div>
            
            {/* ID danh mục */}
            <Typography variant="small" color="gray" className="font-mono">
              #{category.id}
            </Typography>
          </div>

          {/* Danh mục con */}
          {hasChildren && (
            <div className="mt-1 border-l-2 border-gray-200 ml-2 pl-2">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Hàm hiển thị categories với cấu trúc phân cấp
  const renderCategories = () => {
    const categories = product.categories || product.categoryList || [];
    
    if (categories.length === 0) {
      return (
        <div className="text-center py-6">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <Typography variant="small" color="gray" className="italic">
            Sản phẩm chưa được phân loại danh mục
          </Typography>
        </div>
      );
    }

    // Kiểm tra xem có danh mục con không
    const hasChildCategories = categories.some(cat => 
      cat.children && cat.children.length > 0
    );

    if (!hasChildCategories) {
      // Hiển thị dạng phẳng nếu không có danh mục con
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => {
              const categoryName = category.name || category.categoryName || 
                                 category.title || `Danh mục ${index + 1}`;
              
              return (
                <Tooltip key={category.id || category.categoryId || index} content={`ID: ${category.id}`}>
                  <Chip
                    value={categoryName}
                    color="blue"
                    variant="gradient"
                    className="rounded-full font-medium transition-all hover:scale-105 cursor-pointer"
                    icon={<FolderIcon className="h-3 w-3" />}
                  />
                </Tooltip>
              );
            })}
          </div>
          <div className="flex justify-between items-center px-2">
            <Typography variant="small" color="blue-gray" className="font-semibold">
              Tổng số: {categories.length} danh mục
            </Typography>
            <Badge color="blue" content={categories.length} />
          </div>
        </div>
      );
    }

    // Hiển thị dạng cây phân cấp
    const totalCategories = flattenCategories(categories);

    return (
      <div className="space-y-4">
        {/* Accordion cho từng danh mục cha */}
        {categories.map((category, index) => {
          const categoryName = category.name || category.categoryName || 
                             category.title || `Danh mục ${category.id}`;
          const hasChildren = category.children && category.children.length > 0;
          const childCount = hasChildren ? category.children.length : 0;

          return (
            <Accordion 
              key={category.id || index} 
              open={openAccordion === index + 1}
              icon={<ChevronDownIcon className={`h-4 w-4 transition-transform ${
                openAccordion === index + 1 ? "rotate-180" : ""
              }`} />}
            >
              <AccordionHeader 
                onClick={() => handleAccordion(index + 1)}
                className="border-b-0 p-3 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FolderIcon className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <Typography variant="h6" color="blue-gray" className="font-semibold">
                      {categoryName}
                    </Typography>
                    <Typography variant="small" color="gray">
                      ID: {category.id} {hasChildren && `• ${childCount} danh mục con`}
                    </Typography>
                  </div>
                  {hasChildren && (
                    <Badge color="blue" content={childCount} />
                  )}
                </div>
              </AccordionHeader>

              <AccordionBody className="pt-2 pb-4">
                {hasChildren ? (
                  <div className="space-y-2 ml-4 border-l-2 border-blue-200 pl-4">
                    {category.children.map((child, childIndex) => (
                      <div 
                        key={child.id || childIndex}
                        className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-2">
                          <FolderIcon className="h-4 w-4 text-green-500" />
                          <Typography variant="small" className="font-medium text-green-700">
                            {child.name || child.categoryName || `Danh mục con ${childIndex + 1}`}
                          </Typography>
                        </div>
                        <Typography variant="small" color="gray" className="font-mono">
                          #{child.id}
                        </Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="small" color="gray" className="italic text-center py-2">
                    Không có danh mục con
                  </Typography>
                )}
              </AccordionBody>
            </Accordion>
          );
        })}

        {/* Thống kê tổng số danh mục */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-blue-500" />
            <Typography variant="small" color="blue-gray" className="font-semibold">
              Tổng số danh mục
            </Typography>
          </div>
          <div className="flex gap-2">
            <Badge color="blue" content={categories.length} />
            <Typography variant="small" color="gray" className="font-semibold">
              danh mục cha
            </Typography>
            <Typography variant="small" color="gray" className="mx-1">
              +
            </Typography>
            <Badge color="green" content={totalCategories - categories.length} />
            <Typography variant="small" color="gray" className="font-semibold">
              danh mục con
            </Typography>
          </div>
        </div>

        {/* Hiển thị dạng cây đơn giản */}
        <div className="mt-4">
          <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
            <CubeIcon className="h-4 w-4 text-blue-500" />
            Cấu trúc danh mục
          </Typography>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
            {renderCategoryTree(categories)}
          </div>
        </div>
      </div>
    );
  };

  // Hàm hiển thị tags
  const renderTags = () => {
    const tags = product.tagIds || [];
    
    if (tags.length === 0) {
      return (
        <div className="text-center py-6">
          <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <Typography variant="small" color="gray" className="italic">
            Sản phẩm chưa được gắn tag
          </Typography>
        </div>
      );
    }

    return (
       <div className="space-y-4">
      {/* Danh sách tags dạng chips */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Tooltip key={tag.id || index} content={`ID: ${tag.id}`}>
            <Chip
              value={tag.name} // chỉ dùng tag.name
              color="green"
              variant="gradient"
              className="rounded-full font-medium transition-all hover:scale-105 cursor-pointer"
              icon={<TagIcon className="h-3 w-3" />}
            />
          </Tooltip>
        ))}
      </div>

        {/* Thống kê tags */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-green-500" />
            <Typography variant="small" color="blue-gray" className="font-semibold">
              Tổng số tags
            </Typography>
          </div>
          <Badge color="green" content={tags.length} />
        </div>

        {/* Chi tiết từng tag */}
        <div className="space-y-2">
          <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
            Chi tiết tags:
          </Typography>
          {tags.map((tag, index) => {
            const tagName = tag.name || tag.tagName || `Tag ${index + 1}`;
            // const tagDescription = tag.description || "Không có mô tả";
            
            return (
              <div 
                key={tag.id || index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TagIcon className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <Typography variant="small" className="font-semibold text-green-700">
                      {tagName}
                    </Typography>
                    {/* <Typography variant="small" color="gray" className="text-xs">
                      {tagDescription}
                    </Typography> */}
                  </div>
                </div>
                {/* <Typography variant="small" color="gray" className="font-mono">
                  #{tag.id}
                </Typography> */}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getCategoriesCount = () => {
    const categories = product.categories || product.categoryList || [];
    return flattenCategories(categories);
  };

  const getTagsCount = () => {
    const tags = product.tagIds || [];
    return tags.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <Spinner className="h-20 w-20 text-blue-600 mx-auto mb-4" />
            <CubeIcon className="h-8 w-8 text-blue-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <Typography variant="h4" color="blue-gray" className="mb-3 font-bold">
            Đang tải thông tin sản phẩm
          </Typography>
          <Typography variant="paragraph" color="gray" className="max-w-md">
            Đang lấy dữ liệu chi tiết sản phẩm từ hệ thống...
          </Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white to-red-50">
          <CardBody className="text-center p-8">
            <div className="relative">
              <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
              <div className="absolute inset-0 bg-red-100 rounded-full blur-lg opacity-30"></div>
            </div>
            <Typography variant="h4" color="red" className="mb-3 font-bold">
              Đã xảy ra lỗi
            </Typography>
            <Typography color="gray" className="mb-6 leading-relaxed">
              {error}
            </Typography>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outlined" 
                color="red"
                onClick={() => navigate("/dashboard/products")}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Quay lại
              </Button>
              <Button 
                color="blue"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <EyeIcon className="h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white to-amber-50">
          <CardBody className="text-center p-8">
            <div className="relative">
              <ExclamationTriangleIcon className="h-20 w-20 text-amber-500 mx-auto mb-4" />
              <div className="absolute inset-0 bg-amber-100 rounded-full blur-lg opacity-30"></div>
            </div>
            <Typography variant="h4" color="amber" className="mb-3 font-bold">
              Không tìm thấy sản phẩm
            </Typography>
            <Typography color="gray" className="mb-6 leading-relaxed">
              Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </Typography>
            <Button 
              color="blue"
              onClick={() => navigate("/dashboard/products")}
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { 
        text: "HẾT HÀNG", 
        color: "red", 
        bgColor: "from-red-50 to-red-100",
        textColor: "text-red-700",
        progressColor: "bg-red-500",
        progressValue: 0
      };
    } else if (quantity <= 10) {
      const progress = (quantity / 10) * 100;
      return { 
        text: "SẮP HẾT", 
        color: "orange", 
        bgColor: "from-orange-50 to-orange-100",
        textColor: "text-orange-700",
        progressColor: "bg-orange-500",
        progressValue: progress
      };
    } else {
      const progress = Math.min((quantity / 100) * 100, 100);
      return { 
        text: "CÒN HÀNG", 
        color: "green", 
        bgColor: "from-green-50 to-green-100",
        textColor: "text-green-700",
        progressColor: "bg-green-500",
        progressValue: progress
      };
    }
  };

  const stockStatus = getStockStatus(product.quantity || 0);

  const getSoldPercentage = () => {
    const total = (product.quantity || 0) + (product.soldQuantity || 0);
    if (total === 0) return 0;
    return Math.round(((product.soldQuantity || 0) / total) * 100);
  };

  const soldPercentage = getSoldPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-2xl border-0 mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardBody className="p-8 relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CubeIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <Typography variant="h1" className="text-white font-bold mb-2 text-3xl">
                    Chi tiết Sản Phẩm
                  </Typography>
                  <Breadcrumbs className="bg-transparent p-0">
                    <Link to="/dashboard" className="opacity-80 text-blue-100 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/dashboard/products" className="opacity-80 text-blue-100 hover:text-white transition-colors">
                      Sản phẩm
                    </Link>
                    <Typography className="text-white font-semibold">#{product.id}</Typography>
                  </Breadcrumbs>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/dashboard/products/update/${product.id}`}>
                  <Button 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex items-center gap-2 backdrop-blur-sm transition-all"
                    variant="outlined"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </Link>
                <Button
                  variant="outlined"
                  color="white"
                  className="flex items-center gap-2 border-2 backdrop-blur-sm hover:bg-white/10 transition-all"
                  onClick={() => navigate("/dashboard/products")}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Quay lại
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Image & Basic Info */}
              <div className="lg:col-span-1">
                <Card className="shadow-xl border-0 h-full">
                  <CardBody className="p-6">
                    <div className="relative">
                      {product.mainImageUrl ? (
                        <>
                          {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Spinner className="h-8 w-8 text-blue-500" />
                            </div>
                          )}
                          <img
                            src={product.mainImageUrl}
                            alt={product.name}
                            className={`w-full h-64 object-cover rounded-xl shadow-lg transition-opacity duration-300 ${
                              imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              setImageLoaded(true);
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center">
                          <PhotoIcon className="h-16 w-16 text-gray-400 mb-4" />
                          <Typography variant="small" color="gray" className="text-center">
                            Không có hình ảnh
                          </Typography>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <Typography variant="h3" color="blue-gray" className="font-bold mb-2 line-clamp-2">
                          {product.name}
                        </Typography>
                        <div className="flex flex-wrap gap-2">
                          <Chip
                            value={product.active ? "ĐANG BÁN" : "NGỪNG BÁN"}
                            color={product.active ? "green" : "red"}
                            variant="gradient"
                            className="rounded-full font-bold text-xs"
                          />
                          <Chip
                            value={stockStatus.text}
                            color={stockStatus.color}
                            variant="gradient"
                            className="rounded-full font-bold text-xs"
                          />
                        </div>
                      </div>

                      <Typography variant="h4" color="green" className="font-bold">
                        {formatCurrency(product.price)}
                      </Typography>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Stats & Categories & Tags */}
              <div className="lg:col-span-2 space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <ArchiveBoxIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Tồn kho
                          </Typography>
                          <Typography variant="h4" color="blue" className="font-bold">
                            {product.quantity || 0}
                          </Typography>
                          <div className="mt-2">
                            <Progress 
                              value={stockStatus.progressValue} 
                              color={stockStatus.color}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <ShoppingBagIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Đã bán
                          </Typography>
                          <Typography variant="h4" color="purple" className="font-bold">
                            {product.soldQuantity || 0}
                          </Typography>
                          <Typography variant="small" color="purple" className="font-semibold">
                            {soldPercentage}% tổng số
                          </Typography>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <ChartBarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Trạng thái
                          </Typography>
                          <Typography variant="h6" className={`font-bold ${stockStatus.textColor}`}>
                            {stockStatus.text}
                          </Typography>
                          <Typography variant="small" color="gray">
                            {product.active ? "Đang kinh doanh" : "Tạm ngừng"}
                          </Typography>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Categories */}
                <Card className="shadow-xl border-0">
                  <CardBody className="p-6">
                    <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                      <FolderIcon className="h-5 w-5 text-blue-500" />
                      Danh mục sản phẩm
                    </Typography>
                    {renderCategories()}
                  </CardBody>
                </Card>

                {/* Tags - PHẦN MỚI THÊM */}
                <Card className="shadow-xl border-0">
                  <CardBody className="p-6">
                    <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-green-500" />
                      Tags sản phẩm
                    </Typography>
                    {renderTags()}
                  </CardBody>
                </Card>

                {/* Description */}
                <Card className="shadow-xl border-0">
                  <CardBody className="p-6">
                    <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-blue-500" />
                      Mô tả sản phẩm
                    </Typography>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Typography variant="paragraph" color="gray" className="leading-relaxed">
                        {product.description || "Chưa có mô tả cho sản phẩm này."}
                      </Typography>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <Card className="shadow-2xl border-0 sticky top-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-5"></div>
              <CardBody className="p-6 relative">
                <Typography variant="h5" color="blue-gray" className="mb-6 flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
                  Thông tin hệ thống
                </Typography>

                <div className="space-y-4">
                  {[
                    { icon: ClockIcon, label: "Trạng thái", value: product.active ? "Đang bán" : "Ngừng bán", color: product.active ? "green" : "red" },
                    { icon: HashtagIcon, label: "ID sản phẩm", value: `#${product.id}`, color: "blue" },
                    { icon: ArchiveBoxIcon, label: "Tồn kho", value: product.quantity || 0, color: "blue" },
                    { icon: FolderIcon, label: "Danh mục", value: getCategoriesCount(), color: "purple" },
                    { icon: TagIcon, label: "Tags", value: getTagsCount(), color: "green" },
                    { icon: CalendarDaysIcon, label: "Ngày tạo", value: product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : 'N/A', color: "gray" },
                    { icon: ClockIcon, label: "Cập nhật", value: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : 'N/A', color: "gray" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                          <item.icon className={`h-4 w-4 text-${item.color}-500`} />
                        </div>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {item.label}
                        </Typography>
                      </div>
                      {item.color ? (
                        <Chip
                          value={item.value}
                          color={item.color}
                          size="sm"
                          variant="ghost"
                        />
                      ) : (
                        <Typography variant="small" color="gray" className="font-semibold">
                          {item.value}
                        </Typography>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <Link to={`/dashboard/products/update/${product.id}`} className="w-full">
                    <Button 
                      color="blue" 
                      className="w-full flex items-center gap-2 hover:shadow-lg transition-all"
                      size="lg"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Chỉnh sửa sản phẩm
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outlined" 
                    color="blue-gray" 
                    className="w-full flex items-center gap-2 hover:shadow-lg transition-all"
                    onClick={() => navigate("/dashboard/products")}
                    size="lg"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Quay lại danh sách
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;