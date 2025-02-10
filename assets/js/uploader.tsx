import React, { useState } from 'react';
import '../css/main.css';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { message, Upload } from 'antd';

const { Dragger } = Upload;

interface UploaderProps {
  onFilesUploaded: (files: File[]) => void; // Callback to pass files to parent
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    maxCount: 200,
    beforeUpload: (file) => {
      const newFile: UploadFile = {
        uid: file.uid || String(Date.now()), // Ensure each file has a unique ID
        name: file.name,
        status: 'done',
        originFileObj: file, // Store original file
      };

      setFileList((prevList) => {
        const updatedList = [...prevList, newFile];
        const rawFiles = updatedList.map(f => f.originFileObj as File);
        onFilesUploaded(rawFiles); // Ensure parent receives updated file list
        return updatedList;
      });

      return false; // Prevent automatic upload
    },
    onRemove: (file) => {
      setFileList((prevList) => {
        const updatedList = prevList.filter((f) => f.uid !== file.uid);
        const rawFiles = updatedList.map(f => f.originFileObj as File);
        onFilesUploaded(rawFiles); // Ensure parent receives updated file list
        return updatedList;
      });
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <Dragger {...props} fileList={fileList}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload.
      </p>
    </Dragger>
  );
};

export default Uploader;