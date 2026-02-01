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



import React, { useState, useEffect, useCallback } from "react";
import "../css/main.css";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import { Upload, Progress, message } from "antd";

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

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
  onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
}

// Recursively traverse a FileSystemEntry (folder or file) and return all Files.
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

function dedupeFiles(files: File[]) {
  const seen = new Set<string>();
  const out: File[] = [];
  for (const f of files) {
    const key = `${(f as any).webkitRelativePath || f.name}|${f.size}|${f.lastModified}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(f);
    }
  }
  return out;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded, onFileMappingsUpdate }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [localFileMappings, setLocalFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

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
    }, 1000);
  };

  // ✅ One pipeline
  const addFiles = useCallback(
    (incoming: File[], toast?: string) => {
      if (!incoming.length) return;

      const images = incoming.filter((f) => f.type?.startsWith("image/"));
      if (!images.length) {
        message.warning("No image files found.");
        return;
      }

      // dedupe against existing + incoming
      const existing = localFileMappings.map((m) => m.file);
      const merged = dedupeFiles([...existing, ...images]);
      const uniqueNew = merged.slice(existing.length);

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

      if (toast) message.success(toast.replace("{n}", String(uniqueNew.length)));
    },
    [localFileMappings]
  );

  /**
   * ✅ IMPORTANT FIX:
   * Handle folder drag-drop in CAPTURE phase so antd/rc-upload can't intercept it.
   */
  const handleDropCapture = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      // Always prevent browser navigation/opening the dropped file
      e.preventDefault();
      e.stopPropagation();

      const dt = e.dataTransfer;
      const items = Array.from(dt.items || []);

      // Try directory entries first (needed for true folder traversal)
      const entries: AnyEntry[] = items
        .map((i: any) => i.webkitGetAsEntry?.())
        .filter(Boolean);

      if (entries.length) {
        const nestedFiles = (await Promise.all(entries.map(traverseEntry))).flat();
        addFiles(nestedFiles, "Added {n} image(s) from dropped folder(s).");
        return;
      }

      // Fallback: plain files (some browsers don’t expose entries)
      const directFiles = Array.from(dt.files || []) as File[];
      if (directFiles.length) {
        addFiles(directFiles, "Added {n} image(s) from dropped file(s).");
      }
    },
    [addFiles]
  );

  const handleDragOverCapture = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 5000,

    // ✅ Option A: click opens file picker (subset supported in Chrome)
    directory: false,
    accept: "image/*",

    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.warning(`${file.name} skipped (not an image)`);
        return Upload.LIST_IGNORE;
      }
      // antd calls beforeUpload per file; push through our pipeline
      addFiles([file as File]);
      return false;
    },

    // We intentionally DO NOT rely on antd's onDrop for folders anymore.
    onDrop: (e) => {
      // still prevent default just in case
      e.preventDefault();
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

  return (
    <div
      onDropCapture={handleDropCapture}
      onDragOverCapture={handleDragOverCapture}
      style={{ display: "flex", flexDirection: "column", gap: "0px" }}
    >
      <Dragger {...props} fileList={fileList} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files/folders here to upload</p>
        <p className="ant-upload-hint">
          Click to select a subset of images. To upload a whole folder (or multiple folders), drag &amp;
          drop folder(s) here.
        </p>
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



