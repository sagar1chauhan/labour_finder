import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBox, FiSearch, FiFilter, FiCheck, FiX, FiClock, FiEye, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CardShell from '../UserCategories/components/CardShell';
import Modal from '../UserCategories/components/Modal';
import stockService from '../../../../services/stockService';

const AdminStockManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await stockService.getAllRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error loading stock requests:', error);
      toast.error('Failed to load stock requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const response = await stockService.updateRequestStatus(requestId, {
        status,
        adminNotes
      });
      if (response.success) {
        toast.success(`Request ${status} successfully`);
        setIsModalOpen(false);
        loadRequests();
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = 
      (req.vendorId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.vendorId?.businessName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <CardShell
        icon={FiBox}
        title="Stock Management"
        subtitle="Review and manage vendor inventory requests"
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {['all', 'pending', 'approved', 'shipped', 'delivered', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all whitespace-nowrap ${
                  filterStatus === status ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-xs text-gray-400">Loading requests...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-xs text-gray-400">No requests found</td></tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 text-xs">{req.vendorId?.name}</p>
                        <p className="text-[10px] text-gray-500">{req.vendorId?.businessName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-blue-600 text-xs">{req.totalItems} Items</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {req.items.map(i => i.name).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardShell>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedRequest(null); setAdminNotes(''); }}
        title="Stock Request Details"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Vendor Details</p>
                  <p className="font-bold text-gray-900">{selectedRequest.vendorId?.name}</p>
                  <p className="text-xs text-gray-500">{selectedRequest.vendorId?.businessName}</p>
                  <p className="text-xs text-gray-500">{selectedRequest.vendorId?.phone}</p>
                </div>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Vendor Notes</p>
                <p className="text-xs text-gray-700 italic">{selectedRequest.vendorNotes || 'No notes provided'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-900 mb-3">Requested Items</p>
              <div className="space-y-2">
                {selectedRequest.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg">
                    <span className="text-xs font-medium text-gray-800">{item.name}</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-black">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900">Admin Notes / Remarks</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes for the vendor..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs min-h-[80px]"
              />
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <FiCheck className="w-4 h-4" /> Approve Request
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                  className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-2"
                >
                  <FiX className="w-4 h-4" /> Reject
                </button>
              </div>
            )}

            {selectedRequest.status === 'approved' && (
              <button
                onClick={() => handleStatusUpdate(selectedRequest._id, 'shipped')}
                className="w-full bg-purple-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Mark as Shipped
              </button>
            )}

            {selectedRequest.status === 'shipped' && (
              <button
                onClick={() => handleStatusUpdate(selectedRequest._id, 'delivered')}
                className="w-full bg-green-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStockManagement;
