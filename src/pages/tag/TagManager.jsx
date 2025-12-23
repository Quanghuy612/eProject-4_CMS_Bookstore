import React, { useEffect, useState } from "react";
import tagService from "@/services/tags/TagService";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Spinner,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Badge,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  XMarkIcon,
  CheckIcon,
  FireIcon,
  SparklesIcon,
  CubeIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, tag: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load tags
  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await tagService.getAllTags();
      setTags(res.data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setMessage("Error loading tags list");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create new tag
  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      setMessage("Please enter tag name");
      setMessageType("error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await tagService.createTag({ name: newTagName });
      setTags(prev => [...prev, res.data]);
      setNewTagName("");
      setMessage("🎉 Tag created successfully!");
      setMessageType("success");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error creating tag:", error);
      setMessage("❌ Failed to create tag");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit tag
  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
  };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editingTag || !newTagName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await tagService.updateTag(editingTag.id, { name: newTagName });
      setTags(prev => prev.map(t => t.id === editingTag.id ? res.data : t));
      setEditingTag(null);
      setNewTagName("");
      setMessage("✅ Tag updated successfully!");
      setMessageType("success");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating tag:", error);
      setMessage("❌ Failed to update tag");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tag
  const handleDeleteTag = async (id) => {
    try {
      await tagService.deleteTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
      setDeleteDialog({ open: false, tag: null });
      setMessage("🗑️ Tag deleted successfully!");
      setMessageType("success");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting tag:", error);
      setMessage("❌ Failed to delete tag");
      setMessageType("error");
    }
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setNewTagName("");
  };

  // Color system for tags
  const getTagColor = (index) => {
    const colors = [
      { bg: "bg-gradient-to-r from-indigo-500 to-blue-500", text: "text-white" },
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <Spinner className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <TagIcon className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <Typography variant="h4" className="text-gray-800 font-bold mb-3">
            Loading tags...
          </Typography>
          <Typography variant="paragraph" className="text-gray-600">
            Fetching tag data from the system
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="shadow-2xl border-0 mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardBody className="p-8 relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <TagIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <Typography variant="h1" className="text-white font-bold mb-2 text-3xl">
                    Tag Manager
                  </Typography>
                  <Typography variant="paragraph" className="text-blue-100 text-lg">
                    Create and manage tags for your products
                  </Typography>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <Typography variant="h2" className="text-white font-bold">
                    {tags.length}
                  </Typography>
                  <Typography variant="small" className="text-blue-100">
                    Total Tags
                  </Typography>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
                  <Typography variant="h2" className="text-white font-bold">
                    {filteredTags.length}
                  </Typography>
                  <Typography variant="small" className="text-blue-100">
                    Displayed
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm sticky top-6">
              <CardBody className="p-6">
                <Typography variant="h4" className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                  {editingTag ? (
                    <PencilIcon className="h-6 w-6 text-blue-500" />
                  ) : (
                    <PlusIcon className="h-6 w-6 text-green-500" />
                  )}
                  {editingTag ? "Edit Tag" : "Create New Tag"}
                </Typography>

                <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag} className="space-y-6">
                  <div>
                    <Input
                      label="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      required
                      className="!border-2 !border-gray-300 focus:!border-blue-500 rounded-xl text-lg py-3"
                      containerProps={{ className: "min-w-[100px]" }}
                      icon={<TagIcon className="h-5 w-5 text-gray-500" />}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className={`${editingTag ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Spinner className="h-5 w-5" />
                      ) : editingTag ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <PlusIcon className="h-5 w-5" />
                      )}
                      {editingTag ? "Update" : "Create New Tag"}
                    </Button>

                    {editingTag && (
                      <Button
                        type="button"
                        variant="outlined"
                        color="red"
                        onClick={cancelEdit}
                        className="flex items-center gap-2 py-3 rounded-xl font-bold border-2 hover:bg-red-50 transition-all"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>

                {message && (
                  <Alert
                    className="mt-6 rounded-2xl border-2 shadow-lg"
                    color={messageType === "success" ? "green" : "red"}
                    open={!!message}
                    onClose={() => setMessage("")}
                    icon={
                      messageType === "success" ? 
                      <CheckIcon className="h-6 w-6" /> : 
                      <XMarkIcon className="h-6 w-6" />
                    }
                  >
                    <Typography variant="h6" className="font-bold">
                      {message}
                    </Typography>
                  </Alert>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Tags Grid */}
          <div className="lg:col-span-3">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <Typography variant="h3" className="font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Tag List
                    </Typography>
                    <Badge content={tags.length} color="blue" className="border-2 border-white">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-bold">
                        {filteredTags.length} / {tags.length}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="w-full lg:w-64">
                    <Input
                      label="Search tag..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<TagIcon className="h-5 w-5 text-gray-500" />}
                      className="!border-2 !border-gray-300 focus:!border-blue-500 rounded-xl"
                    />
                  </div>
                </div>

                {filteredTags.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                      {searchTerm ? (
                        <CubeIcon className="h-12 w-12 text-gray-400" />
                      ) : (
                        <TagIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <Typography variant="h5" color="gray" className="mb-3 font-bold">
                      {searchTerm ? "No tags found" : "No tags yet"}
                    </Typography>
                    <Typography color="gray" className="mb-6 leading-relaxed">
                      {searchTerm 
                        ? `No tags found matching "${searchTerm}"`
                        : "Create your first tag"
                      }
                    </Typography>
                    {!searchTerm && (
                      <Button 
                        color="blue" 
                        size="lg"
                        className="flex items-center gap-3 mx-auto shadow-lg px-8 py-3 rounded-xl font-bold transform hover:scale-105 transition-all"
                        onClick={() => document.querySelector('input[type="text"]')?.focus()}
                      >
                        <PlusIcon className="h-5 w-5" />
                        Create First Tag
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredTags.map((tag, index) => {
                      const color = getTagColor(index);
                      return (
                        <Card 
                          key={tag.id} 
                          className="shadow-lg border-0 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden group"
                        >
                          <div className={`h-2 ${color.bg}`}></div>
                          <CardBody className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${color.bg} shadow-lg`}>
                                  <TagIcon className="h-5 w-5 text-white" />
                                </div>
                                <Typography 
                                  variant="h6" 
                                  className="font-bold text-gray-900 group-hover:text-gray-800 transition-colors"
                                >
                                  {tag.name}
                                </Typography>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Tooltip content="Edit" placement="top">
                                  <IconButton
                                    variant="gradient"
                                    color="blue"
                                    onClick={() => handleEditTag(tag)}
                                    size="sm"
                                    className="rounded-xl transform hover:scale-110 transition-all duration-300 shadow-lg"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip content="Delete" placement="top">
                                  <IconButton
                                    variant="gradient"
                                    color="red"
                                    onClick={() => setDeleteDialog({ open: true, tag })}
                                    size="sm"
                                    className="rounded-xl transform hover:scale-110 transition-all duration-300 shadow-lg"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">ID:</span>
                                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                                  #{tag.id}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Order:</span>
                                <span className="font-bold text-gray-800 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                                  #{index + 1}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Chip
                                value={tag.name}
                                className={`w-full justify-center font-bold text-lg py-2 rounded-xl shadow-lg ${color.bg} ${color.text}`}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        handler={() => setDeleteDialog({ open: false, tag: null })}
        className="bg-white/90 backdrop-blur-sm"
      >
        <DialogHeader className="flex items-center gap-4 bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-red-200">
          <div className="p-3 bg-red-100 rounded-xl">
            <TrashIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <Typography variant="h4" color="red" className="font-bold">
              Confirm Delete
            </Typography>
            <Typography variant="small" color="red" className="font-normal">
              This action cannot be undone
            </Typography>
          </div>
        </DialogHeader>
        <DialogBody className="p-8">
          <div className="text-center">
            <Typography variant="paragraph" color="blue-gray" className="text-lg mb-4">
              Are you sure you want to delete the tag
            </Typography>
            <div className="flex justify-center mb-6">
              <Chip
                value={deleteDialog.tag?.name}
                className="text-xl font-bold py-3 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
              />
            </div>
            <Typography variant="small" color="red" className="mb-6 font-semibold">
              All related data will be permanently lost
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter className="gap-4 p-6 border-t border-red-200 bg-red-50/50">
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setDeleteDialog({ open: false, tag: null })}
            className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDeleteTag(deleteDialog.tag?.id)}
            className="flex-1 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <TrashIcon className="h-5 w-5" />
            Delete Tag
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default TagManager;