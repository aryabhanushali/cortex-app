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





import React, { useState, useEffect, useRef } from "react";
import "../css/main.css";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps, UploadFile } from "antd";
import { Upload, Progress, message, Button, Space } from "antd";

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
      setFileList((prev) => [...prev]); // trigger re-render
      setCompletedCount((prev) => prev + 1);
      message.success(`${uploadFile.name} uploaded successfully!`);
    }, 700);
  };

  // ✅ One shared pipeline for ALL sources (file picker, folder picker, drag-drop)
  const addFiles = (incoming: File[], sourceLabel?: string) => {
    if (!incoming.length) return;

    // Filter images
    const images = incoming.filter((f) => f.type?.startsWith("image/"));
    if (!images.length) {
      message.warning("No image files found.");
      return;
    }

    // Dedupe against *existing* + within incoming
    const existingFiles = localFileMappings.map((m) => m.file);
    const unique = dedupeFiles([...existingFiles, ...images]).slice(existingFiles.length);

    if (!unique.length) {
      message.info("No new images to add (already added).");
      return;
    }

    unique.forEach((file) => {
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

    if (sourceLabel) message.success(`Added ${unique.length} image(s) from ${sourceLabel}.`);
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 5000,
    // ✅ IMPORTANT: set directory=false so Chrome click picker supports subset upload
    directory: false,
    accept: "image/*",

    // Picker path (now: normal file picker, subset selection works in Chrome)
    beforeUpload: (file) => {
      // Antd calls beforeUpload per file; we’ll just use addFiles for consistency
      addFiles([file as File], "file picker");
      return false;
    },

    // Drag-and-drop path (folders or files)
    async onDrop(e: React.DragEvent<HTMLDivElement>) {
      e.preventDefault();

      const items = Array.from(e.dataTransfer.items || []);
      const entries: AnyEntry[] = items
        .map((i: any) => i.webkitGetAsEntry?.())
        .filter(Boolean);

      if (!entries.length) {
        // fallback: plain files drop
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

  const onPickFolder = () => folderInputRef.current?.click();

  const onFolderChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []) as File[];
    addFiles(files, "folder picker");
    // reset value so picking the same folder again still triggers change
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Folder picker control (Chrome needs this to enable folder selection) */}
      <Space size={8} style={{ justifyContent: "flex-end" }}>
        <Button size="small" onClick={onPickFolder}>
          Select folder
        </Button>
        <input
          ref={folderInputRef}
          type="file"
          multiple
          // vendor attribute: works in Chrome/Safari
          webkitdirectory="true"
          // helps some browsers treat as directory input
          // @ts-ignore
          directory=""
          accept="image/*"
          style={{ display: "none" }}
          onChange={onFolderChange}
        />
      </Space>

      <Dragger {...props} fileList={fileList} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files/folders here to upload</p>
        <p className="ant-upload-hint">
          Click to select images (subset supported). Use “Select folder” to upload a whole folder.
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

