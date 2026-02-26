import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../css/main.css";
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
const { Text, Link } = Typography;

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
  // include rel path when present so same-name files in different subfolders don’t collide
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

      // Filter images only (also handles unknown type by checking extension fallback if you want)
      const images = incoming.filter((f) => f.type?.startsWith("image/"));
      if (!images.length) {
        message.warning("No image files found.");
        return;
      }

      const existingKeys = new Set(localFileMappings.map((m) => fileKey(m.file)));

      // Keep only truly new files
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

      if (sourceLabel) {
        message.success(`Added ${uniqueNew.length} image(s) from ${sourceLabel}.`);
      }
    },
    [localFileMappings]
  );

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 5000,

    // Click picker = files/subset (Chrome & Safari)
    directory: false,
    accept: "image/*",

    beforeUpload: (file) => {
      // antd calls per file
      addFiles([file as File], "file picker");
      return false;
    },

    // Drag & drop path (folders or files)
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
    e.target.value = ""; // allow picking same folder again
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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

      <Dragger {...props} fileList={fileList} showUploadList={false}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>

        <p className="ant-upload-text">Click or Drag files to upload</p>

        <div className="ant-upload-hint" style={{ lineHeight: 1.6 }}>
          <br />
          <Text type="secondary">
            Or{" "}
            <span
              className="gradient-link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openFolderPicker();
              }}
              role="button"
            >
              <FolderOpenOutlined className="highlight-icon" style={{ transform: "translateY(3px)" }} />
              <span className="gradient-text"  style={{ transform: "translateY(3px)" }} >
                choose a whole folder here
              </span>
            </span>{" "}
            to upload everything inside.
          </Text>
          <br />
        </div>
      </Dragger>

      <Progress
        className="progress-bar"
        percent={progressPercent}
        status={progressPercent === 100 ? "success" : "active"}
        style={{ marginTop: 0 }}
        strokeColor="var(--highlight-color-button)"
      />
    </div>
  );
};

export default Uploader;