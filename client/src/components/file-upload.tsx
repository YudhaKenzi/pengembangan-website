import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFileTypes?: string[];
  onFilesChange: (files: File[]) => void;
}

export default function FileUpload({
  maxFiles = 5,
  maxSizeInMB = 5,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  onFilesChange,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleFileChange = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      setError(null);

      // Check if adding these files would exceed the max count
      if (files.length + selectedFiles.length > maxFiles) {
        setError(`Maksimal ${maxFiles} file diperbolehkan`);
        return;
      }

      const newFiles: File[] = [];
      let hasError = false;

      Array.from(selectedFiles).forEach((file) => {
        // Check file size
        if (file.size > maxSizeInBytes) {
          setError(`File ${file.name} melebihi batas ukuran maksimal ${maxSizeInMB}MB`);
          hasError = true;
          return;
        }

        // Check file type
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!acceptedFileTypes.includes(fileExtension)) {
          setError(`File ${file.name} tidak sesuai dengan format yang diperbolehkan`);
          hasError = true;
          return;
        }

        newFiles.push(file);
      });

      if (!hasError) {
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
      }
    },
    [files, maxFiles, maxSizeInBytes, maxSizeInMB, acceptedFileTypes, onFilesChange]
  );

  const removeFile = useCallback(
    (indexToRemove: number) => {
      const updatedFiles = files.filter((_, index) => index !== indexToRemove);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      setError(null);
    },
    [files, onFilesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        } transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">
            Drag & drop file atau <Button variant="link" className="p-0 h-auto" onClick={() => document.getElementById('fileInput')?.click()}>browse</Button>
          </h3>
          <p className="text-sm text-muted-foreground">
            Maksimal {maxFiles} file ({acceptedFileTypes.join(', ')}, maks. {maxSizeInMB}MB)
          </p>
          <input
            id="fileInput"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
            accept={acceptedFileTypes.join(',')}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">File yang Diunggah ({files.length}/{maxFiles})</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setFiles([]);
                onFilesChange([]);
              }}
            >
              Hapus Semua
            </Button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="bg-muted/40 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
