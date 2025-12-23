import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  IconButton,
  Select,
  Option,
  Spinner,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  Tooltip
} from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  CalendarDaysIcon,
  UserIcon,
  CubeIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import FeedbackService from '@/services/feedback/FeedbackService';

const FeedbackManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // States for filters
  const [filters, setFilters] = useState({
    productName: '',        // Search by product name
    rating: '',
    pageNumber: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  // States for pagination
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    pageSize: 10
  });
  
  // States for dialogs
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Ref for debounce timeout
  const searchTimeoutRef = useRef(null);

  // Fetch reviews when filters change (except productName which uses debounce)
  useEffect(() => {
    fetchReviews();
  }, [filters.pageNumber, filters.pageSize, filters.sortBy, filters.sortDirection, filters.rating]);

  // Handle real-time search with debounce for productName
  useEffect(() => {
    // Clear old timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout with 500ms debounce
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to first page when searching
      setFilters(prev => ({ 
        ...prev, 
        pageNumber: 0 
      }));
      // Fetch reviews with new search keyword
      fetchReviews();
    }, 500);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.productName]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Create params from filters (remove empty values)
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null) {
          params[key] = filters[key];
        }
      });
      
      console.log('Fetching with params:', params);
      
      const response = await FeedbackService.getReviews(params);
      const data = response.data;
      
      console.log('API Response:', data);
      
      if (data && data.success) {
        setReviews(data.data || []);
        
        const metaData = data.metaData || {};
        setPagination({
          totalPages: metaData.totalPage || 0,
          totalElements: metaData.totalItems || 0,
          currentPage: metaData.currentPage || 0,
          pageSize: metaData.pageSize || 10
        });
      } else {
        setReviews([]);
        setError(data?.message || 'No data available');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Unable to load reviews list. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      productName: '',
      rating: '',
      pageNumber: 0,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setFilters(prev => ({ ...prev, pageNumber: newPage }));
    }
  };

  const handlePageSizeChange = (size) => {
    setFilters(prev => ({ 
      ...prev, 
      pageSize: parseInt(size), 
      pageNumber: 0 
    }));
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    
    try {
      setDeleting(true);
      await FeedbackService.deleteReview(reviewToDelete.id);
      
      setSuccess(`Successfully deleted review #${reviewToDelete.id}`);
      setDeleteDialog(false);
      setReviewToDelete(null);
      
      // Refresh list
      fetchReviews();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Unable to delete review. Please try again later.');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setDetailDialog(true);
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-500" />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Display active filters
  const hasActiveFilters = () => {
    return filters.productName || filters.rating;
  };

  // Highlight search text in product name
  const highlightSearchText = (text, searchText) => {
    if (!searchText || !text) return text;
    
    const lowerText = text.toLowerCase();
    const lowerSearch = searchText.toLowerCase();
    
    if (!lowerText.includes(lowerSearch)) return text;
    
    const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === searchText.toLowerCase() ? (
        <span key={index} className="bg-yellow-300 font-bold text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <Typography variant="h5" color="blue-gray">
            Loading reviews list...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h2" color="blue-gray" className="mb-2">
            Review Management
          </Typography>
          <Typography color="gray" className="text-lg">
            Manage and review customer feedback
          </Typography>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <Alert color="red" className="mb-3" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert color="green" className="mb-3" onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}
          </div>
        )}

        {/* Filter Card */}
        <Card className="shadow-md mb-6">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search by product name (real-time) */}
              <div className="md:col-span-1">
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Search by product name
                </Typography>
                <div className="relative">
                  <Input
                    label="Enter product name"
                    name="productName"
                    value={filters.productName}
                    onChange={handleFilterChange}
                    // placeholder="Search..."
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    className="pr-10"
                  />
                  {filters.productName && (
                    <IconButton
                      variant="text"
                      size="sm"
                      className="!absolute right-2 top-2"
                      onClick={() => setFilters(prev => ({ ...prev, productName: '' }))}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
                <Typography variant="small" color="gray" className="mt-1">
                  Auto-search when typing (500ms delay)
                </Typography>
              </div>

              {/* Filter by rating */}
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Filter by star rating
                </Typography>
                <Select
                  label="Select stars"
                  value={filters.rating}
                  onChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    rating: value,
                    pageNumber: 0
                  }))}
                >
                  <Option value="">All</Option>
                  <Option value="5">⭐⭐⭐⭐⭐ (5 stars)</Option>
                  <Option value="4">⭐⭐⭐⭐ (4 stars)</Option>
                  <Option value="3">⭐⭐⭐ (3 stars)</Option>
                  <Option value="2">⭐⭐ (2 stars)</Option>
                  <Option value="1">⭐ (1 star)</Option>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Sort by
                </Typography>
                <Select
                  label="Sort"
                  value={`${filters.sortBy}-${filters.sortDirection}`}
                  onChange={(value) => {
                    const [sortBy, sortDirection] = value.split('-');
                    setFilters(prev => ({ 
                      ...prev, 
                      sortBy, 
                      sortDirection,
                      pageNumber: 0
                    }));
                  }}
                >
                  <Option value="createdAt-desc">Newest</Option>
                  <Option value="createdAt-asc">Oldest</Option>
                  <Option value="rating-desc">Highest rating</Option>
                  <Option value="rating-asc">Lowest rating</Option>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div>
                <Button
                  variant="outlined"
                  color="gray"
                  onClick={handleResetFilters}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Reset filters
                </Button>
              </div>

              {!loading && (
                <Typography variant="small" color="gray">
                  Total: <span className="font-bold text-blue-600">{pagination.totalElements}</span> reviews
                </Typography>
              )}
            </div>

            {/* Display active filters */}
            {hasActiveFilters() && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Typography variant="small" color="blue-gray" className="font-medium mb-2">
                  Active filters:
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {filters.productName && (
                    <Chip
                      value={`Product: ${filters.productName}`}
                      color="blue"
                      size="sm"
                      onClose={() => setFilters(prev => ({ ...prev, productName: '' }))}
                    />
                  )}
                  {filters.rating && (
                    <Chip
                      value={`${filters.rating} stars`}
                      color="yellow"
                      size="sm"
                      icon={<StarIconSolid className="h-3 w-3" />}
                      onClose={() => setFilters(prev => ({ ...prev, rating: '' }))}
                    />
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Reviews Table */}
        <Card className="shadow-md">
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner className="h-8 w-8 text-blue-500" />
                <Typography variant="h6" color="blue-gray" className="ml-3">
                  Loading data...
                </Typography>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <FunnelIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <Typography variant="h5" color="gray" className="mb-2">
                  {hasActiveFilters() ? 'No reviews found' : 'No reviews yet'}
                </Typography>
                <Typography color="gray">
                  {hasActiveFilters() 
                    ? 'Try changing filters or search keywords' 
                    : 'No reviews in the system yet'}
                </Typography>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Product
                        </Typography>
                      </th>
                      <th className="py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Reviewer
                        </Typography>
                      </th>
                      <th className="py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Rating
                        </Typography>
                      </th>
                      <th className="py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Description
                        </Typography>
                      </th>
                      <th className="py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Date
                        </Typography>
                      </th>
                      <th className="py-3 px-4 text-left">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          Actions
                        </Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                              <CubeIcon className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <Link
                                to={`/dashboard/products/${review.productId}`} 
                                className="group flex items-center gap-1 hover:text-blue-600 transition-colors"
                              >
                                <Typography 
                                  variant="small" 
                                  className="font-medium group-hover:text-blue-600"
                                >
                                  {highlightSearchText(review.productName || 'N/A', filters.productName)}
                                </Typography>
                                <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                              <Typography variant="small" color="gray" className="mt-1">
                                ID: {review.productId || 'N/A'}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Typography variant="small" className="font-medium">
                            {review.authorName || 'Anonymous user'}
                          </Typography>
                          <Typography variant="small" color="gray" className="truncate max-w-[150px]">
                            {review.authorEmail || 'N/A'}
                          </Typography>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating || 0)}
                            <Chip
                              value={`${review.rating || 0}/5`}
                              size="sm"
                              className="rounded-full"
                              color={
                                (review.rating || 0) >= 4 ? 'green' :
                                (review.rating || 0) >= 3 ? 'blue' :
                                (review.rating || 0) >= 2 ? 'amber' : 'red'
                              }
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Typography variant="small" color="gray" className="line-clamp-2 max-w-[200px]">
                            {review.description || 'No description'}
                          </Typography>
                        </td>
                        <td className="py-4 px-4">
                          <Typography variant="small">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Tooltip content="View details">
                              <IconButton
                                variant="text"
                                color="blue"
                                onClick={() => handleViewDetail(review)}
                              >
                                <EyeIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete review">
                              <IconButton
                                variant="text"
                                color="red"
                                onClick={() => handleDeleteClick(review)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {reviews.length > 0 && !loading && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="flex items-center gap-4">
                  <Typography variant="small" color="gray">
                    Page {pagination.currentPage + 1} / {pagination.totalPages || 1}
                  </Typography>
                  <Select
                    value={filters.pageSize.toString()}
                    onChange={(value) => handlePageSizeChange(value)}
                    className="w-32"
                    size="sm"
                  >
                    <Option value="5">5 per page</Option>
                    <Option value="10">10 per page</Option>
                    <Option value="20">20 per page</Option>
                    <Option value="50">50 per page</Option>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0 || loading}
                  >
                    ←
                  </Button>
                  
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i;
                    } else if (pagination.currentPage <= 2) {
                      pageNum = i;
                    } else if (pagination.currentPage >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 5 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "filled" : "outlined"}
                        color={pagination.currentPage === pageNum ? "blue" : "blue-gray"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-10"
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                  >
                    →
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} handler={() => setDeleteDialog(!deleteDialog)} size="sm">
        <DialogHeader className="flex items-center gap-2 text-red-600">
          <ExclamationTriangleIcon className="h-5 w-5" />
          Confirm deletion
        </DialogHeader>
        <DialogBody>
          <Typography variant="paragraph" color="blue-gray">
            Are you sure you want to delete this review?
          </Typography>
          {reviewToDelete && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <Typography variant="small" className="font-bold">
                #{reviewToDelete.id} • {reviewToDelete.productName}
              </Typography>
              <Typography variant="small" className="mt-1">
                {reviewToDelete.title || 'No title'}
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="text"
            color="gray"
            onClick={() => {
              setDeleteDialog(false);
              setReviewToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            className="flex items-center gap-2"
          >
            {deleting ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Review Detail Dialog */}
      <Dialog open={detailDialog} handler={() => setDetailDialog(!detailDialog)} size="lg">
        <DialogHeader className="flex justify-between items-center">
          <Typography variant="h5" color="blue-gray">
            Review details #{selectedReview?.id}
          </Typography>
          <IconButton variant="text" color="blue-gray" onClick={() => setDetailDialog(false)}>
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          {selectedReview && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
                <CubeIcon className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <Typography variant="h6" color="blue-gray">
                    Product Information
                  </Typography>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Typography variant="small" color="gray">
                        Product ID
                      </Typography>
                      <Link
                        to={`/products/${selectedReview.productId}`}
                        className="flex items-center gap-1 group"
                      >
                        <Typography variant="paragraph" className="font-medium group-hover:text-blue-600">
                          {selectedReview.productId || 'N/A'}
                        </Typography>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                    <div>
                      <Typography variant="small" color="gray">
                        Product Name
                      </Typography>
                      <Link
                        to={`/products/${selectedReview.productId}`}
                        className="flex items-center gap-1 group"
                      >
                        <Typography variant="paragraph" className="font-medium group-hover:text-blue-600">
                          {selectedReview.productName || 'N/A'}
                        </Typography>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <Typography variant="h6" color="blue-gray">
                    Reviewer Information
                  </Typography>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <Typography variant="small" color="gray">
                        User Name
                      </Typography>
                      <Typography variant="paragraph" className="font-medium">
                        {selectedReview.authorName || 'Anonymous user'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="gray">
                        Email
                      </Typography>
                      <Typography variant="paragraph" className="font-medium">
                        {selectedReview.authorEmail || 'N/A'}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Review content
                </Typography>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(selectedReview.rating || 0)}
                  </div>
                  <Chip
                    value={`${selectedReview.rating || 0}/5 stars`}
                    size="md"
                    className="rounded-full"
                    color={
                      (selectedReview.rating || 0) >= 4 ? 'green' :
                      (selectedReview.rating || 0) >= 3 ? 'blue' :
                      (selectedReview.rating || 0) >= 2 ? 'amber' : 'red'
                    }
                  />
                </div>

                {/* Review Description */}
                <div className="mt-3">
                  <Typography variant="small" color="gray">
                    Detailed description:
                  </Typography>
                  <div className="mt-2 p-3 bg-white border rounded-lg">
                    <Typography variant="paragraph" className="whitespace-pre-wrap">
                      {selectedReview.description || 'No description'}
                    </Typography>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="mt-4 flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <Typography variant="small" color="gray">
                      Creation date
                    </Typography>
                    <Typography variant="small" className="font-medium">
                      {formatDate(selectedReview.createdAt)}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="blue"
            onClick={() => setDetailDialog(false)}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default FeedbackManager;