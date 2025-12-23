import React, { useEffect, useState, useMemo } from "react";
import cmsUserService from "@/services/cmsAuth/UserService";

import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Alert,
  Chip,
  CardHeader,
  Input,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

function CustomerManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Fetch user list
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await cmsUserService.getAllCmsUsers();
      console.log("Calling API: get all CMS users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Error loading user list.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle lock / unlock with confirmation
  const handleToggleLock = async (user) => {
    setSelectedUser(user);
    setShowDialog(true);
  };

  const confirmToggleLock = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdatingId(selectedUser.id);
      const currentStatus = selectedUser.locked === true;
      await cmsUserService.updateCmsUserStatus(selectedUser.id, !currentStatus);
      await fetchUsers(); // reload list
      setShowDialog(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      setError("Unable to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Status display function
  const renderStatus = (locked) => {
    if (locked === true) {
      return <Chip value="Locked" color="red" size="sm" className="font-medium" />;
    } else {
      return <Chip value="Active" color="green" size="sm" className="font-medium" />;
    }
  };

  // Action button display function
  const renderActionButton = (user) => {
    const { id, locked } = user;
    const isLocked = locked === true;
    
    return (
      <Button
        size="sm"
        variant="gradient"
        color={isLocked ? "green" : "red"}
        onClick={() => handleToggleLock(user)}
        disabled={updatingId === id}
        className="flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
      >
        {updatingId === id ? (
          <Spinner className="h-4 w-4" />
        ) : isLocked ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Unlock
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zM7 7v2h6V7a3 3 0 00-6 0z" clipRule="evenodd" />
            </svg>
            Lock
          </>
        )}
      </Button>
    );
  };

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase().trim();
    return users.filter(user => 
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.primaryPhone?.includes(term) ||
      user.id?.toString().includes(term)
    );
  }, [users, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(user => user.locked !== true).length;
    const locked = users.filter(user => user.locked === true).length;
    
    return { total, active, locked };
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h3" color="blue-gray" className="mb-2 font-bold">
            Customer Management
          </Typography>
          <Typography variant="paragraph" color="gray" className="text-lg">
            Manage and track user account status
          </Typography>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6" className="mb-2 opacity-80">
                    Total Users
                  </Typography>
                  <Typography variant="h3" className="font-bold">
                    {stats.total}
                  </Typography>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6" className="mb-2 opacity-80">
                    Active
                  </Typography>
                  <Typography variant="h3" className="font-bold">
                    {stats.active}
                  </Typography>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h6" className="mb-2 opacity-80">
                    Locked
                  </Typography>
                  <Typography variant="h3" className="font-bold">
                    {stats.locked}
                  </Typography>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and controls bar */}
        <Card className="shadow-lg border-0 mb-6">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex-1 w-full md:w-auto">
                <Input
                  label="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  className="lg:w-96"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outlined" 
                  color="blue" 
                  className="flex items-center gap-2"
                  onClick={fetchUsers}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
                {searchTerm && (
                  <Button 
                    variant="text" 
                    color="red" 
                    onClick={() => setSearchTerm("")}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Spinner className="h-12 w-12 mb-4" />
              <Typography variant="h6" color="gray">
                Loading data...
              </Typography>
            </div>
          </div>
        )}

        {error && (
          <Alert color="red" className="mb-6 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </Alert>
        )}

        {!loading && filteredUsers.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader 
              floated={false} 
              shadow={false} 
              className="rounded-t-lg bg-gradient-to-r from-blue-500 to-blue-700 m-0 p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Typography variant="h5" color="white" className="mb-1">
                    User List
                  </Typography>
                  <Typography variant="small" color="blue-gray-100">
                    Showing {filteredUsers.length} out of {users.length} users
                    {searchTerm && ` - Search: "${searchTerm}"`}
                  </Typography>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-blue-gray-50">
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        ID
                      </Typography>
                    </th>
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        Username
                      </Typography>
                    </th>
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        Full Name
                      </Typography>
                    </th>
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        Email
                      </Typography>
                    </th>
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        Phone Number
                      </Typography>
                    </th>
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        Status
                      </Typography>
                    </th>
                    <th className="p-4 border-b border-blue-gray-100">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none">
                        Action
                      </Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={`transition-colors hover:bg-blue-gray-50/50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {user.id}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {user.username}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {user.firstName} {user.lastName}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {user.email}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {user.primaryPhone || (
                            <span className="text-gray-400 italic">Not updated</span>
                          )}
                        </Typography>
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        {renderStatus(user.locked)}
                      </td>
                      <td className="p-4 border-b border-blue-gray-50">
                        {renderActionButton(user)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}

        {!loading && filteredUsers.length === 0 && users.length > 0 && (
          <Card className="text-center py-12 shadow-lg border-0">
            <CardBody>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Typography variant="h5" color="gray" className="mb-2">
                No results found
              </Typography>
              <Typography variant="paragraph" color="gray" className="mb-4">
                {`No users match the keyword "${searchTerm}"`}
              </Typography>
              <Button variant="gradient" color="blue" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </CardBody>
          </Card>
        )}

        {!loading && users.length === 0 && (
          <Card className="text-center py-12 shadow-lg border-0">
            <CardBody>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <Typography variant="h5" color="gray" className="mb-2">
                No users available
              </Typography>
              <Typography variant="paragraph" color="gray" className="mb-4">
                There are currently no users in the system.
              </Typography>
              <Button variant="gradient" color="blue" onClick={fetchUsers}>
                Try Again
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Confirmation dialog */}
      <Dialog open={showDialog} handler={setShowDialog}>
        <DialogHeader>
          {selectedUser && (selectedUser.locked === true ? "Unlock" : "Lock")} user
        </DialogHeader>
        <DialogBody>
          {selectedUser && (
            <div className="space-y-4">
              <Typography variant="paragraph">
                Are you sure you want to {selectedUser.locked === true ? "unlock" : "lock"} this user?
              </Typography>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography variant="small" className="font-semibold">
                  User Information:
                </Typography>
                <div className="mt-2 space-y-1">
                  <Typography variant="small">ID: {selectedUser.id}</Typography>
                  <Typography variant="small">Username: {selectedUser.username}</Typography>
                  <Typography variant="small">Full Name: {selectedUser.firstName} {selectedUser.lastName}</Typography>
                  <Typography variant="small">Email: {selectedUser.email}</Typography>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setShowDialog(false)}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="gradient"
            color={selectedUser?.locked === true ? "green" : "red"}
            onClick={confirmToggleLock}
            disabled={updatingId === selectedUser?.id}
          >
            {updatingId === selectedUser?.id ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <span>Confirm</span>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default CustomerManager;