const DocumentList = ({ 
  documents, 
  onDocumentSelect, 
  onRefresh, 
  emptyMessage = "You haven't uploaded any documents yet.", 
  showAnalysisLink = false,
  isWorkDocument = false
}) => {
  // ...existing code...

  // In the JSX code for rendering document actions
  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    <button
      onClick={() => onDocumentSelect(document.id)}
      className="text-blue-600 hover:text-blue-900 mr-4"
    >
      View Analyses
    </button>
    
    {/* Show analysis link for WorkAuto documents if requested */}
    {showAnalysisLink && isWorkDocument && (
      <button
        onClick={() => window.location.href = `/work-auto?docId=${document.id}`}
        className="text-green-600 hover:text-green-900"
      >
        Analyze
      </button>
    )}
  </td>
  // ...existing code...
} 