import React, { useState } from 'react';
import { format } from 'date-fns';

const DocumentList = ({ 
  documents,  
  onRefresh, 
  emptyMessage = "You haven't uploaded any documents yet.", 
  isWorkDocument = false
}) => {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">{emptyMessage}</p>
      </div>
    );
  }

  // Helper function to get file type label from extension
  const getFileTypeLabel = (fileType) => {
    if (!fileType) return 'Unknown';
    
    const extension = fileType.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'xlsx':
      case 'xls':
        return 'Excel Spreadsheet';
      case 'csv':
        return 'CSV Data';
      case 'json':
        return 'JSON Data';
      case 'txt':
        return 'Text File';
      default:
        return extension.toUpperCase();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown';
    
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Get source label based on document source
  const getSourceLabel = (document) => {
    // Use explicit source_label if available
    if (document.source_label) return document.source_label;
    
    // Otherwise derive from source field with fallback
    if (!document.source || document.source === 'auto_form' || document.source === '') 
      return 'Auto Form';
    else if (document.source === 'work_auto') 
      return 'Data Explorer';
    else 
      return document.source; // If it's something else, just show what it is
  };

  // Get source styling based on document source
  const getSourceStyle = (document) => {
    if (!document.source || document.source === 'auto_form' || document.source === '')
      return 'bg-green-100 text-green-800';
    else if (document.source === 'work_auto')
      return 'bg-purple-100 text-purple-800';
    else
      return 'bg-blue-100 text-blue-800'; // Default for other sources
  };

  // Filter and sort documents
  const filteredDocuments = documents.filter(doc => {
    // Filter by type only for regular documents
    if (!isWorkDocument) {
      const extension = doc.file_type?.split('/').pop() || doc.file_extension;
      if (filterType !== 'all' && extension !== filterType) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameField = isWorkDocument ? doc.name : (doc.file_name || doc.filename || '');
      return (
        nameField.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue, bValue;
    
    // Handle different fields for regular vs work documents
    if (sortField === 'file_name') {
      aValue = isWorkDocument ? a.name : (a.file_name || a.filename || '');
      bValue = isWorkDocument ? b.name : (b.file_name || b.filename || '');
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    // Handle special fields
    if (sortField === 'created_at' || sortField === 'updated_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'file_size') {
      aValue = parseInt(aValue, 10) || 0;
      bValue = parseInt(bValue, 10) || 0;
    }
    
    // Sort direction
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get unique file types for the filter dropdown
  const uniqueFileTypes = [...new Set(documents.map(doc => {
    return doc.file_type?.split('/').pop() || doc.file_extension;
  }).filter(Boolean))];

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Filter and search controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder={`Search by ${isWorkDocument ? 'name' : 'filename'}...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {!isWorkDocument && uniqueFileTypes.length > 0 && (
          <div className="w-40">
            <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-1">
              File Type
            </label>
            <select
              id="file-type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueFileTypes.map(type => (
                <option key={type} value={type}>
                  {getFileTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="w-48">
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort-by"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field);
              setSortDirection(direction);
            }}
          >
            <option value="created_at-desc">Date (Newest First)</option>
            <option value="created_at-asc">Date (Oldest First)</option>
            <option value="file_name-asc">Name (A-Z)</option>
            <option value="file_name-desc">Name (Z-A)</option>
            {!isWorkDocument && (
              <>
                <option value="file_size-desc">Size (Largest First)</option>
                <option value="file_size-asc">Size (Smallest First)</option>
              </>
            )}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Document list */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('file_name')}
              >
                {isWorkDocument ? 'Name' : 'Filename'}
                {sortField === 'file_name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              {!isWorkDocument && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Source
              </th>
              {!isWorkDocument && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('file_size')}
                >
                  Size
                  {sortField === 'file_size' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Upload Date
                {sortField === 'created_at' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedDocuments.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {isWorkDocument ? document.name : (document.file_name || document.filename || 'Unnamed document')}
                      </div>
                      {document.description && (
                        <div className="text-sm text-gray-500">{document.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                {!isWorkDocument && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getFileTypeLabel(document.file_type?.split('/').pop() || document.file_extension)}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSourceStyle(document)}`}>
                    {getSourceLabel(document)}
                  </span>
                </td>
                {!isWorkDocument && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(document.file_size)}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(document.created_at), 'MMM d, yyyy h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;