// import React, { useState, useEffect } from "react";
// import "../css/main.css";
// import { InboxOutlined } from "@ant-design/icons";
// import type { UploadProps, UploadFile } from "antd";
// import { Upload, Progress, message } from "antd";

// const { Dragger } = Upload;

// interface UploaderProps {
//   onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
//   onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
// }

// const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded, onFileMappingsUpdate }) => {
//   const [fileList, setFileList] = useState<UploadFile[]>([]);
//   const [localFileMappings, setLocalFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
//   const [completedCount, setCompletedCount] = useState(0);

//   // Calculate overall progress
//   const totalFiles = fileList.length;
//   const progressPercent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

//   // Trigger parent callbacks when file mappings update
//   useEffect(() => {
//     const timerId = setTimeout(() => {
//       onFilesUploaded(localFileMappings);
//       onFileMappingsUpdate(localFileMappings);
//     }, 0);

//     return () => clearTimeout(timerId);
//   }, [localFileMappings, onFilesUploaded, onFileMappingsUpdate]);

//   // Simulated upload process
//   const simulateUpload = (uploadFile: UploadFile) => {
//     uploadFile.status = "uploading";

//     setTimeout(() => {
//       uploadFile.status = "done";
//       setFileList((prev) => [...prev]); // Trigger re-render
//       setCompletedCount((prev) => prev + 1);
//       message.success(`${uploadFile.name} uploaded successfully!`);
//     }, 1000);
//   };

//   const props: UploadProps = {
//     name: "file",
//     multiple: true,
//     maxCount: 200,
//     beforeUpload: (file) => {
//       const blobURL = URL.createObjectURL(file);

//       // Use the File object directly to ensure filename preservation
//       const newFile: UploadFile = {
//         uid: file.uid || String(Date.now()),
//         name: file.name, // Preserve original filename
//         status: "uploading",
//         originFileObj: file,
//       };

//       setFileList((prevList) => [...prevList, newFile]);

//       // Store File object along with its URL
//       setLocalFileMappings((prevMappings) => [
//         ...prevMappings,
//         { blobURL, file },
//       ]);

//       simulateUpload(newFile);
//       return false; // Prevent default upload
//     },
//     onRemove: (file) => {
//       setFileList((prevList) => {
//         const removingFile = prevList.find((f) => f.uid === file.uid);
//         if (removingFile?.status === "done") {
//           setCompletedCount((prev) => (prev > 0 ? prev - 1 : 0));
//         }
//         return prevList.filter((f) => f.uid !== file.uid);
//       });

//       setLocalFileMappings((prevMappings) =>
//         prevMappings.filter((f) => f.file.name !== file.name)
//       );
//     },
//     onDrop(e) {
//       console.log("Dropped files", e.dataTransfer.files);
//     },
//     showUploadList: false,
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
//       <Dragger {...props} fileList={fileList} showUploadList={false}>
//         <p className="ant-upload-drag-icon">
//           <InboxOutlined />
//         </p>
//         <p className="ant-upload-text">Click or drag file to this area to upload</p>
//         <p className="ant-upload-hint">Upload one or more .jpg/png files</p>
//       </Dragger>

//       <Progress
//         className="progress-bar"
//         percent={progressPercent}
//         status={progressPercent === 100 ? "success" : "active"}
//         style={{ marginTop: 0 }}
//         strokeColor="#1890ff"
//       />
//     </div>
//   );
// };

// export default Uploader;



import React, { useState, useEffect, useRef, useCallback } from "react";
import "../css/main.css";
import { InboxOutlined, FolderOpenOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import { Upload, Progress, message, Typography } from "antd";

// --- WebKit directory drop type defs (needed for TS) ---
interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
}
interface FileSystemFileEntry extends FileSystemEntry {
  file: (successCallback: (file: File) => void) => void;
}
interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader: () => FileSystemDirectoryReader;
}
interface FileSystemDirectoryReader {
  readEntries: (successCallback: (entries: FileSystemEntry[]) => void) => void;
}
type AnyEntry = FileSystemFileEntry | FileSystemDirectoryEntry;

const { Dragger } = Upload;
const { Text } = Typography;

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
  onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
}

async function traverseEntry(entry: AnyEntry): Promise<File[]> {
  if ("file" in entry) {
    const file: File = await new Promise((resolve) =>
      (entry as FileSystemFileEntry).file(resolve)
    );
    (file as any).webkitRelativePath = entry.fullPath.replace(/^\//, "");
    return [file];
  }

  if ("createReader" in entry) {
    const dirReader = (entry as FileSystemDirectoryEntry).createReader();
    const entries: AnyEntry[] = await new Promise((resolve) => {
      const all: AnyEntry[] = [];
      const read = () =>
        dirReader.readEntries((batch: AnyEntry[]) => {
          if (!batch.length) resolve(all);
          else {
            all.push(...batch);
            read();
          }
        });
      read();
    });

    const nested = await Promise.all(entries.map(traverseEntry));
    return nested.flat();
  }

  return [];
}

// ✅ Stable key for dedupe across picker/drop/folder
function fileKey(f: File) {
  const rel = (f as any).webkitRelativePath || "";
  return `${rel}::${f.name}::${f.size}::${f.lastModified}`;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded, onFileMappingsUpdate }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [localFileMappings, setLocalFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const totalFiles = fileList.length;
  const progressPercent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  useEffect(() => {
    const timerId = setTimeout(() => {
      onFilesUploaded(localFileMappings);
      onFileMappingsUpdate(localFileMappings);
    }, 0);

    return () => clearTimeout(timerId);
  }, [localFileMappings, onFilesUploaded, onFileMappingsUpdate]);

  const simulateUpload = (uploadFile: UploadFile) => {
    uploadFile.status = "uploading";
    setTimeout(() => {
      uploadFile.status = "done";
      setFileList((prev) => [...prev]);
      setCompletedCount((prev) => prev + 1);
      message.success(`${uploadFile.name} uploaded successfully!`);
    }, 700);
  };

  // ✅ Correct dedupe: filter incoming against existing-key set
  const addFiles = useCallback(
    (incoming: File[], sourceLabel?: string) => {
      if (!incoming.length) return;

      const images = incoming.filter((f) => f.type?.startsWith("image/"));
      if (!images.length) {
        message.warning("No image files found.");
        return;
      }

      const existingKeys = new Set(localFileMappings.map((m) => fileKey(m.file)));

      const uniqueNew = images.filter((f) => {
        const k = fileKey(f);
        if (existingKeys.has(k)) return false;
        existingKeys.add(k);
        return true;
      });

      if (!uniqueNew.length) {
        message.info("No new images to add (already added).");
        return;
      }

      uniqueNew.forEach((file) => {
        const blobURL = URL.createObjectURL(file);
        const newFile: UploadFile = {
          uid: String(Date.now() + Math.random()),
          name: file.name,
          status: "uploading",
          originFileObj: file,
        };

        setFileList((prev) => [...prev, newFile]);
        setLocalFileMappings((prev) => [...prev, { blobURL, file }]);
        simulateUpload(newFile);
      });

      if (sourceLabel) message.success(`Added ${uniqueNew.length} image(s) from ${sourceLabel}.`);
    },
    [localFileMappings]
  );

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 5000,
    directory: false, // click = file picker (subset supported)
    accept: "image/*",

    beforeUpload: (file) => {
      addFiles([file as File], "file picker");
      return false;
    },

    async onDrop(e: React.DragEvent<HTMLDivElement>) {
      e.preventDefault();

      const items = Array.from(e.dataTransfer.items || []);
      const entries: AnyEntry[] = items
        .map((i: any) => i.webkitGetAsEntry?.())
        .filter(Boolean);

      if (!entries.length) {
        const directFiles = Array.from(e.dataTransfer.files || []) as File[];
        addFiles(directFiles, "drop");
        return;
      }

      const nestedFiles = (await Promise.all(entries.map(traverseEntry))).flat();
      addFiles(nestedFiles, "dropped folder(s)");
    },

    onDragOver: (e) => e.preventDefault(),

    onRemove: (file) => {
      setFileList((prevList) => {
        const removingFile = prevList.find((f) => f.uid === file.uid);
        if (removingFile?.status === "done") {
          setCompletedCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
        return prevList.filter((f) => f.uid !== file.uid);
      });

      setLocalFileMappings((prevMappings) =>
        prevMappings.filter((m) => {
          const isMatch = m.file === file.originFileObj;
          if (isMatch) URL.revokeObjectURL(m.blobURL);
          return !isMatch;
        })
      );
    },

    showUploadList: false,
  };

  useEffect(() => {
    return () => {
      localFileMappings.forEach((m) => {
        try {
          URL.revokeObjectURL(m.blobURL);
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openFolderPicker = () => folderInputRef.current?.click();

  const onFolderChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []) as File[];
    addFiles(files, "folder picker");
    e.target.value = "";
  };

  const onFolderTileKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFolderPicker();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // vendor directory pick
        webkitdirectory="true"
        // @ts-ignore
        directory=""
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFolderChange}
      />

      {/* Main Dragger */}
      <Dragger {...props} fileList={fileList} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files/folders here to upload</p>
        <p className="ant-upload-hint">
          <Text type="secondary">Click to select images (subset supported).</Text>
          <br />
          <Text type="secondary">Drag &amp; drop files or folders here.</Text>
        </p>
      </Dragger>

      {/* Folder tile (consistent, not a plain button) */}
      <div
        role="button"
        tabIndex={0}
        onClick={openFolderPicker}
        onKeyDown={onFolderTileKeyDown}
        style={{
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#fafafa",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#1677ff";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(22, 119, 255, 0.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#d9d9d9";
          (e.currentTarget as HTMLDivElement).style.background = "#fafafa";
        }}
      >
        <FolderOpenOutlined style={{ fontSize: 18, color: "#1677ff" }} />
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontWeight: 600 }}>Upload a folder</div>
          <div style={{ color: "#8c8c8c", fontSize: 12 }}>
            Upload everything inside the folder (you can repeat to add multiple folders).
          </div>
        </div>
      </div>

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






