import React, { useState } from "react";
import "../css/main.css";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import { Upload, Progress, message } from "antd";

const { Dragger } = Upload;

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void; 
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileMappings, setFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  // Calculate overall progress based on how many files have status === 'done'
  const totalFiles = fileList.length;
  const progressPercent = totalFiles > 0 
    ? Math.round((completedCount / totalFiles) * 100) 
    : 0;

  // Helper to simulate uploading a file and update statuses
  const simulateUpload = (uploadFile: UploadFile) => {
    // Set status to uploading initially
    uploadFile.status = "uploading";

    // Simulate an asynchronous upload
    setTimeout(() => {
      // Mark file as done
      uploadFile.status = "done";
      setFileList((prev) => [...prev]); // Trigger a re-render

      // Once done, increment completedCount
      setCompletedCount((prev) => prev + 1);
      message.success(`${uploadFile.name} uploaded successfully!`);
    }, 1000); // adjust to desired “upload” speed
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 200,
    beforeUpload: (file) => {
      const blobURL = URL.createObjectURL(file);

      // Create a new UploadFile object
      const newFile: UploadFile = {
        uid: file.uid || String(Date.now()),
        name: file.name,
        status: "uploading", // start as uploading
        originFileObj: file,
      };

      // Add to fileList
      setFileList((prevList) => {
        const updatedList = [...prevList, newFile];
        return updatedList;
      });

      // Add to fileMappings
      setFileMappings((prevMappings) => {
        const updatedMappings = [...prevMappings, { blobURL, file }];
        onFilesUploaded(updatedMappings);
        return updatedMappings;
      });

      // Kick off our simulated upload
      simulateUpload(newFile);

      // Return false to prevent default upload
      return false;
    },
    onRemove: (file) => {
      setFileList((prevList) => {
        // If this file was already done, reduce completedCount
        const removingFile = prevList.find((f) => f.uid === file.uid);
        if (removingFile?.status === "done") {
          setCompletedCount((prev) => (prev > 0 ? prev - 1 : 0));
        }

        return prevList.filter((f) => f.uid !== file.uid);
      });

      setFileMappings((prevMappings) => {
        const updatedMappings = prevMappings.filter((f) => f.file.name !== file.name);
        onFilesUploaded(updatedMappings);
        return updatedMappings;
      });
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    // If you want the Upload list to be hidden, keep showUploadList as false
    // otherwise you can set showUploadList to true for default antd file list
    showUploadList: false,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
      <Dragger {...props} fileList={fileList} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">Support for a single or bulk upload.</p>
      </Dragger>
  
      <Progress
        className="progress-bar"
        percent={progressPercent}
        status={progressPercent === 100 ? "success" : "active"}
        style={{ marginTop: 0 }} // Inline style to ensure no gap
      />
    </div>
  );
  
};

export default Uploader;