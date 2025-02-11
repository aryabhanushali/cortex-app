import React, { useState } from "react";
import "../css/main.css";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import { Upload } from "antd";

const { Dragger } = Upload;

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void; // Store both blob & actual file
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileMappings, setFileMappings] = useState<{ blobURL: string; file: File }[]>([]); // Store both representations

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 200,
    beforeUpload: (file) => {
      const blobURL = URL.createObjectURL(file); // Generate a blob URL

      const newFile: UploadFile = {
        uid: file.uid || String(Date.now()), // Ensure each file has a unique ID
        name: file.name,
        status: "done",
        originFileObj: file, // Store original file
      };

      setFileList((prevList) => {
        const updatedList = [...prevList, newFile];
        return updatedList;
      });

      setFileMappings((prevMappings) => {
        const updatedMappings = [...prevMappings, { blobURL, file }];
        onFilesUploaded(updatedMappings); // Pass both blob & file to parent
        return updatedMappings;
      });

      return false; // Prevent automatic upload
    },
    onRemove: (file) => {
      setFileList((prevList) => {
        return prevList.filter((f) => f.uid !== file.uid);
      });

      setFileMappings((prevMappings) => {
        const updatedMappings = prevMappings.filter((f) => f.file.name !== file.name);
        onFilesUploaded(updatedMappings); // Update parent
        return updatedMappings;
      });
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <>
      <Dragger {...props} fileList={fileList}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
      </Dragger>

      {/* Display uploaded images using Blob URLs */}
      <div style={{ marginTop: "20px" }}>
        {fileMappings.map(({ blobURL, file }) => (
          <div key={file.name}>
            <img src={blobURL} alt="Preview" style={{ width: "100px", marginRight: "10px" }} />
            <p>{file.name}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Uploader;
