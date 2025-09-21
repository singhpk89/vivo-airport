import { FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';

const FileManager = () => {
  const files = [
    { name: 'Images', type: 'folder', size: '250 MB', modified: '2024-01-15' },
    { name: 'Documents', type: 'folder', size: '45 MB', modified: '2024-01-14' },
    { name: 'report.pdf', type: 'file', size: '2.5 MB', modified: '2024-01-13' },
    { name: 'data.xlsx', type: 'file', size: '1.2 MB', modified: '2024-01-12' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">File Manager</h1>
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {files.map((file, index) => (
            <div key={index} className="p-4 flex items-center space-x-3">
              {file.type === 'folder' ? (
                <FolderIcon className="h-8 w-8 text-blue-500" />
              ) : (
                <DocumentIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">{file.size} • Modified {file.modified}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-900 text-sm">Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
