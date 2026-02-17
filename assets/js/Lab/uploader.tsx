import React, { useState, useEffect } from "react";
import "../../css/main.css";
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
// Use a clean union for entries
type AnyEntry = FileSystemFileEntry | FileSystemDirectoryEntry;

const { Dragger } = Upload;

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
  onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
}

// Recursively traverse a FileSystemEntry (folder or file) and return all Files.
// Also attaches a webkitRelativePath so you can preserve folder structure if needed.
async function traverseEntry(entry: AnyEntry): Promise<File[]> {
  // If it's a file entry
  if ("file" in entry) {
    const file: File = await new Promise((resolve) =>
      (entry as FileSystemFileEntry).file(resolve)
    );
    // Attach relative path for later use (UI or server)
    (file as any).webkitRelativePath = entry.fullPath.replace(/^\//, "");
    return [file];
  }

  // If it's a directory entry
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

  // If not a file or directory, return empty
  return [];
}

// Utility to dedupe files if user drops/chooses same folder(s) multiple times
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
    maxCount: 5000,        // allow big folders
    directory: true,       // enables picking a folder via dialog
    accept: "image/*",     // filter in the picker; we'll also check on drop

    // Picker path (unchanged: one folder per selection, but can repeat)
    beforeUpload: (file) => {
      // Skip any non-image just in case
      if (!file.type.startsWith("image/")) {
        message.warning(`${file.name} skipped (not an image)`);
        return Upload.LIST_IGNORE;
      }

      const blobURL = URL.createObjectURL(file as File);

      const newFile: UploadFile = {
        uid: (file as any).uid || String(Date.now() + Math.random()),
        name: file.name,
        status: "uploading",
        originFileObj: file as File,
      };

      setFileList((prev) => [...prev, newFile]);
      setLocalFileMappings((prev) => [...prev, { blobURL, file: file as File }]);
      simulateUpload(newFile);

      return false; // prevent auto upload
    },

    // Drag-and-drop path (supports multiple folders at once)
    async onDrop(e: React.DragEvent<HTMLDivElement>): Promise<void> {
      e.preventDefault();
      // Some browsers put directories only in dataTransfer.items (not files)
      const items = Array.from(e.dataTransfer.items || []);

      // Try to get FileSystemEntries (folders/files) from items
      const entries: AnyEntry[] = items
        .map((i: any) => i.webkitGetAsEntry?.())
        .filter(Boolean);

      if (!entries.length) {
        // fallback: plain files drop (no directories)
        const directFiles = Array.from(e.dataTransfer.files || []) as File[];
        if (!directFiles.length) return;

        const images = directFiles.filter(f => f.type.startsWith("image/"));
        if (!images.length) {
          message.warning("No image files found in the drop.");
          return;
        }

        // Push through the same pipeline
        images.forEach((file) => {
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

        return;
      }

      // We have folders and/or files as entries — traverse recursively
      const nestedFiles = (await Promise.all(entries.map(traverseEntry))).flat();

      // Filter to images only
      const imageFiles = nestedFiles.filter(f => f.type.startsWith("image/"));

      if (!imageFiles.length) {
        message.warning("No image files found in the dropped folder(s).");
        return;
      }

      // Optional: dedupe across repeated drops
      const uniqueImages = dedupeFiles(imageFiles);

      // Add to UI + mappings
      uniqueImages.forEach((file) => {
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

      message.success(`Added ${uniqueImages.length} image(s) from dropped folder(s).`);
    },

    // (Optional) improves drop behavior in some contexts; Dragger already handles preventDefault internally
    onDragOver: (e) => {
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

      // Revoke the blob URL for the removed file
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
      // cleanup all blob URLs on unmount
      localFileMappings.forEach((m) => {
        try { URL.revokeObjectURL(m.blobURL); } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← no deps



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
