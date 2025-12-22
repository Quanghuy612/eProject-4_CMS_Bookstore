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
        console.log("📦 Product detail data:", data);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔄 Function to flatten category structure to count total
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

  // 🔄 Recursive function to display hierarchical categories
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category, index) => {
      const categoryName = category.name || category.categoryName || 
                         category.title || `Category ${category.id}`;
      const hasChildren = category.children && category.children.length > 0;
      
      return (
        <div key={category.id || index} className="ml-4">
          {/* Parent Category */}
          <div className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            level === 0 ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 flex-1">
              {/* Hierarchy character */}
              <div className="text-gray-400 text-sm w-4">
                {level > 0 && '└─'}
              </div>
              
              {/* Category icon */}
              <FolderIcon className={`h-4 w-4 ${
                level === 0 ? 'text-blue-500' : 
                level === 1 ? 'text-green-500' : 'text-orange-500'
              }`} />
              
              {/* Category name */}
              <Typography 
                variant="small" 
                className={`font-medium ${
                  level === 0 ? 'text-blue-700' : 
                  level === 1 ? 'text-green-700' : 'text-orange-700'
                }`}
              >
                {categoryName}
              </Typography>
              
              {/* Badge for parent category */}
              {level === 0 && (
                <Chip
                  value="Parent Category"
                  size="sm"
                  color="blue"
                  variant="outlined"
                  className="rounded-full text-xs"
                />
              )}
            </div>
            
            {/* Category ID */}
            <Typography variant="small" color="gray" className="font-mono">
              #{category.id}
            </Typography>
          </div>

          {/* Child Categories */}
          {hasChildren && (
            <div className="mt-1 border-l-2 border-gray-200 ml-2 pl-2">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Function to display categories with hierarchical structure
  const renderCategories = () => {
    const categories = product.categories || product.categoryList || [];
    
    if (categories.length === 0) {
      return (
        <div className="text-center py-6">
          <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <Typography variant="small" color="gray" className="italic">
            Product not categorized
          </Typography>
        </div>
      );
    }

    // Check if has child categories
    const hasChildCategories = categories.some(cat => 
      cat.children && cat.children.length > 0
    );

    if (!hasChildCategories) {
      // Display flat view if no child categories
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => {
              const categoryName = category.name || category.categoryName || 
                                 category.title || `Category ${index + 1}`;
              
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
              Total: {categories.length} categories
            </Typography>
            <Badge color="blue" content={categories.length} />
          </div>
        </div>
      );
    }

    // Display hierarchical tree view
    const totalCategories = flattenCategories(categories);

    return (
      <div className="space-y-4">
        {/* Accordion for each parent category */}
        {categories.map((category, index) => {
          const categoryName = category.name || category.categoryName || 
                             category.title || `Category ${category.id}`;
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
                      ID: {category.id} {hasChildren && `• ${childCount} subcategories`}
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
                            {child.name || child.categoryName || `Subcategory ${childIndex + 1}`}
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
                    No subcategories
                  </Typography>
                )}
              </AccordionBody>
            </Accordion>
          );
        })}

        {/* Total category statistics */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-blue-500" />
            <Typography variant="small" color="blue-gray" className="font-semibold">
              Total categories
            </Typography>
          </div>
          <div className="flex gap-2">
            <Badge color="blue" content={categories.length} />
            <Typography variant="small" color="gray" className="font-semibold">
              parent categories
            </Typography>
            <Typography variant="small" color="gray" className="mx-1">
              +
            </Typography>
            <Badge color="green" content={totalCategories - categories.length} />
            <Typography variant="small" color="gray" className="font-semibold">
              subcategories
            </Typography>
          </div>
        </div>

        {/* Simple tree view display */}
        <div className="mt-4">
          <Typography variant="h6" color="blue-gray" className="mb-3 flex items-center gap-2">
            <CubeIcon className="h-4 w-4 text-blue-500" />
            Category structure
          </Typography>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-60 overflow-y-auto">
            {renderCategoryTree(categories)}
          </div>
        </div>
      </div>
    );
  };

  // Function to display tags
  const renderTags = () => {
    const tags = product.tagIds || [];
    
    if (tags.length === 0) {
      return (
        <div className="text-center py-6">
          <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <Typography variant="small" color="gray" className="italic">
            Product has no tags
          </Typography>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Tags list as chips */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Tooltip key={tag.id || index} content={`ID: ${tag.id}`}>
              <Chip
                value={tag.name} // only use tag.name
                color="green"
                variant="gradient"
                className="rounded-full font-medium transition-all hover:scale-105 cursor-pointer"
                icon={<TagIcon className="h-3 w-3" />}
              />
            </Tooltip>
          ))}
        </div>

        {/* Tags statistics */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-green-500" />
            <Typography variant="small" color="blue-gray" className="font-semibold">
              Total tags
            </Typography>
          </div>
          <Badge color="green" content={tags.length} />
        </div>

        {/* Detailed tag info */}
        <div className="space-y-2">
          <Typography variant="small" color="blue-gray" className="font-semibold mb-2">
            Tag details:
          </Typography>
          {tags.map((tag, index) => {
            const tagName = tag.name || tag.tagName || `Tag ${index + 1}`;
            // const tagDescription = tag.description || "No description";
            
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
            Loading product information
          </Typography>
          <Typography variant="paragraph" color="gray" className="max-w-md">
            Fetching detailed product data from system...
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
              Error occurred
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
                Go back
              </Button>
              <Button 
                color="blue"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <EyeIcon className="h-4 w-4" />
                Try again
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
              Product not found
            </Typography>
            <Typography color="gray" className="mb-6 leading-relaxed">
              The product you are looking for does not exist or has been deleted.
            </Typography>
            <Button 
              color="blue"
              onClick={() => navigate("/dashboard/products")}
              className="flex items-center gap-2 mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to list
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
        text: "OUT OF STOCK", 
        color: "red", 
        bgColor: "from-red-50 to-red-100",
        textColor: "text-red-700",
        progressColor: "bg-red-500",
        progressValue: 0
      };
    } else if (quantity <= 10) {
      const progress = (quantity / 10) * 100;
      return { 
        text: "LOW STOCK", 
        color: "orange", 
        bgColor: "from-orange-50 to-orange-100",
        textColor: "text-orange-700",
        progressColor: "bg-orange-500",
        progressValue: progress
      };
    } else {
      const progress = Math.min((quantity / 100) * 100, 100);
      return { 
        text: "IN STOCK", 
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
                    Product Details
                  </Typography>
                  <Breadcrumbs className="bg-transparent p-0">
                    <Link to="/dashboard" className="opacity-80 text-blue-100 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/dashboard/products" className="opacity-80 text-blue-100 hover:text-white transition-colors">
                      Products
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
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outlined"
                  color="white"
                  className="flex items-center gap-2 border-2 backdrop-blur-sm hover:bg-white/10 transition-all"
                  onClick={() => navigate("/dashboard/products")}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Go back
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
                            No image available
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
                            value={product.active ? "ACTIVE" : "INACTIVE"}
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
                            Stock
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
                            Sold
                          </Typography>
                          <Typography variant="h4" color="purple" className="font-bold">
                            {product.soldQuantity || 0}
                          </Typography>
                          <Typography variant="small" color="purple" className="font-semibold">
                            {soldPercentage}% of total
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
                            Status
                          </Typography>
                          <Typography variant="h6" className={`font-bold ${stockStatus.textColor}`}>
                            {stockStatus.text}
                          </Typography>
                          <Typography variant="small" color="gray">
                            {product.active ? "Active" : "Paused"}
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
                      Product Categories
                    </Typography>
                    {renderCategories()}
                  </CardBody>
                </Card>

                {/* Tags - NEWLY ADDED SECTION */}
                <Card className="shadow-xl border-0">
                  <CardBody className="p-6">
                    <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-green-500" />
                      Product Tags
                    </Typography>
                    {renderTags()}
                  </CardBody>
                </Card>

                {/* Description */}
                <Card className="shadow-xl border-0">
                  <CardBody className="p-6">
                    <Typography variant="h5" color="blue-gray" className="mb-4 flex items-center gap-2">
                      <TagIcon className="h-5 w-5 text-blue-500" />
                      Product Description
                    </Typography>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Typography variant="paragraph" color="gray" className="leading-relaxed">
                        {product.description || "No description for this product."}
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
                  System Information
                </Typography>

                <div className="space-y-4">
                  {[
                    { icon: ClockIcon, label: "Status", value: product.active ? "Active" : "Inactive", color: product.active ? "green" : "red" },
                    { icon: HashtagIcon, label: "Product ID", value: `#${product.id}`, color: "blue" },
                    { icon: ArchiveBoxIcon, label: "Stock", value: product.quantity || 0, color: "blue" },
                    { icon: FolderIcon, label: "Categories", value: getCategoriesCount(), color: "purple" },
                    { icon: TagIcon, label: "Tags", value: getTagsCount(), color: "green" },
                    { icon: CalendarDaysIcon, label: "Created Date", value: product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US') : 'N/A', color: "gray" },
                    { icon: ClockIcon, label: "Updated", value: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-US') : 'N/A', color: "gray" },
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
                      Edit Product
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
                    Back to list
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