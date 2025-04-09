import React, { useState, useEffect } from "react";
import "../css/main.css";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import { Upload, Progress, message } from "antd";

const { Dragger } = Upload;

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
  onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded, onFileMappingsUpdate }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [localFileMappings, setLocalFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  // Calculate overall progress
  const totalFiles = fileList.length;
  const progressPercent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  // Trigger parent callbacks when file mappings update
  useEffect(() => {
    const timerId = setTimeout(() => {
      onFilesUploaded(localFileMappings);
      onFileMappingsUpdate(localFileMappings);
    }, 0);

    return () => clearTimeout(timerId);
  }, [localFileMappings, onFilesUploaded, onFileMappingsUpdate]);

  // Simulated upload process
  const simulateUpload = (uploadFile: UploadFile) => {
    uploadFile.status = "uploading";

    setTimeout(() => {
      uploadFile.status = "done";
      setFileList((prev) => [...prev]); // Trigger re-render
      setCompletedCount((prev) => prev + 1);
      message.success(`${uploadFile.name} uploaded successfully!`);
    }, 1000);
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 200,
    beforeUpload: (file) => {
      const blobURL = URL.createObjectURL(file);

      // Use the File object directly to ensure filename preservation
      const newFile: UploadFile = {
        uid: file.uid || String(Date.now()),
        name: file.name, // Preserve original filename
        status: "uploading",
        originFileObj: file,
      };

      setFileList((prevList) => [...prevList, newFile]);

      // Store File object along with its URL
      setLocalFileMappings((prevMappings) => [
        ...prevMappings,
        { blobURL, file },
      ]);

      simulateUpload(newFile);
      return false; // Prevent default upload
    },
    onRemove: (file) => {
      setFileList((prevList) => {
        const removingFile = prevList.find((f) => f.uid === file.uid);
        if (removingFile?.status === "done") {
          setCompletedCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
        return prevList.filter((f) => f.uid !== file.uid);
      });

      setLocalFileMappings((prevMappings) =>
        prevMappings.filter((f) => f.file.name !== file.name)
      );
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    showUploadList: false,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
      <Dragger {...props} fileList={fileList} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">Upload one or more .jpg/png files</p>
      </Dragger>

      <Progress
        className="progress-bar"
        percent={progressPercent}
        status={progressPercent === 100 ? "success" : "active"}
        style={{ marginTop: 0 }}
        strokeColor="#1890ff"
      />
    </div>
  );
};

export default Uploader;
