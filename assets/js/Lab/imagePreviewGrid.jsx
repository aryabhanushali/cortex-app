import React, { useEffect, useMemo, useState } from "react";

export default function ImagePreviewGroupedDnD({
  files = [],
  title = "Uploaded Images Preview (Grouped)",
  onRemove, // (globalIndex) => void
  onClear, // () => void
  onClearGroup, // (groupKey, idsToRemove:number[]) => void
  onGroupOrderChange, // (groupKeys: string[]) => void
  onRenameGroup, // (groupKey, newDisplayName) => void
  groupDepth = 1,
  maxThumbsPerGroup = 80,
  showPathDebug = false,
}) {
  const getGroupKey = (file) => {
    const rel = file?.webkitRelativePath || "";
    if (!rel) return "Ungrouped";

    const parts = rel.split("/").filter(Boolean);
    if (parts.length <= groupDepth) return "Ungrouped";
    return parts[groupDepth] || "Ungrouped";
  };

  const [itemGroupMap, setItemGroupMap] = useState({}); // { [uid]: groupKey }
  const [dragItem, setDragItem] = useState(null); // { uid, fromKey }

  useEffect(() => {
    setItemGroupMap((prev) => {
        const next = { ...prev };
        files.forEach((item) => {
        const uid = item.uid;
        if (!(uid in next)) {
            // default group from path
            next[uid] = getGroupKey(item.file);
        }
        });

        // 清理已不存在的 uid
        Object.keys(next).forEach((uid) => {
        if (!files.some((f) => f.uid === uid)) delete next[uid];
        });

        return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files, groupDepth]);

  const grouped = useMemo(() => {
    const map = new Map();

    files.forEach((item, idx) => {
      const key = itemGroupMap[item.uid] ?? getGroupKey(item.file);
      if (!map.has(key)) map.set(key, []);

      // ⚠️ id 可能会撞（例如 webkitRelativePath 为空 or 文件名/时间戳重复）
      // 所以我们渲染时的 key 一定要带 idx 来保证唯一性
     

      map.get(key).push({
        ...item,
        idx,
        id: item.uid,
      });
    });

    const obj = {};
    for (const [k, v] of map.entries()) obj[k] = v;
    return obj;
  }, [files, groupDepth, itemGroupMap]);

  const [groupOrder, setGroupOrder] = useState([]);
  useEffect(() => {
    const keys = Object.keys(grouped);
    setGroupOrder((prev) => {
      const keep = prev.filter((k) => keys.includes(k));
      const add = keys.filter((k) => !keep.includes(k));
      const next = [...keep, ...add];
      onGroupOrderChange?.(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grouped]);

  // group display names (rename only affects display)
  const [groupNameMap, setGroupNameMap] = useState({});
  useEffect(() => {
    const keys = Object.keys(grouped);
    setGroupNameMap((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        if (!(k in next)) next[k] = k;
      });
      Object.keys(next).forEach((k) => {
        if (!keys.includes(k)) delete next[k];
      });
      return next;
    });
  }, [grouped]);

  const displayName = (k) => groupNameMap[k] ?? k;

  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  // rename UI state
  const [editingKey, setEditingKey] = useState(null);
  const [draftName, setDraftName] = useState("");

  const orderedKeys = groupOrder.length ? groupOrder : Object.keys(grouped);

  const move = (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;

    setGroupOrder((prev) => {
      const arr = [...prev];
      const from = arr.indexOf(fromKey);
      const to = arr.indexOf(toKey);
      if (from === -1 || to === -1) return prev;

      arr.splice(from, 1);
      arr.splice(to, 0, fromKey);
      onGroupOrderChange?.(arr);
      return arr;
    });
  };

  const startRename = (k) => {
    setEditingKey(k);
    setDraftName(displayName(k));
  };

  const commitRename = (k) => {
    const name = (draftName || "").trim();
    if (!name) {
      setEditingKey(null);
      return;
    }
    setGroupNameMap((prev) => ({ ...prev, [k]: name }));
    onRenameGroup?.(k, name);
    setEditingKey(null);
  };

  const cancelRename = () => {
    setEditingKey(null);
    setDraftName("");
  };

  if (!files?.length) {
    return (
      <div style={{ border: "1px dashed rgba(0,0,0,0.25)", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 700, color: "black" }}>{title}</div>
        <div style={{ marginTop: 6, color: "rgba(0,0,0,0.55)" }}>No images yet.</div>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: 12, background: "rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 800, color: "black" }}>
          {title} <span style={{ fontWeight: 500, color: "rgba(0,0,0,0.55)" }}>({files.length})</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear?.();
          }}
          style={btnStyle()}
        >
          Clear All
        </button>
      </div>

      {showPathDebug && (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "white", color: "black", fontSize: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>DEBUG webkitRelativePath (first 5)</div>
          {files.slice(0, 5).map((f, i) => (
            <div key={i} style={{ opacity: 0.85 }}>
              {f.file?.webkitRelativePath || "(no webkitRelativePath)"}
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 12 }} />

      {/* <div style={{ display: "flex", flexDirection: "column", gap: 12 }}> */}
      <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            alignItems: "start",
        }}
        >
        {orderedKeys.map((k) => {
          const items = grouped[k] || [];
          if (!items.length) return null;

          const isOver = overKey === k && dragKey && dragKey !== k;

          return (
          <div
            key={`${k}::${displayName(k)}`}
            onDragOver={(e) => {
                // 允许 drop
                if (dragItem) e.preventDefault();
            }}
            onDrop={(e) => {
                e.preventDefault();
                if (!dragItem?.uid) return;

                // ✅ move thumbnail into this group
                setItemGroupMap((prev) => ({ ...prev, [dragItem.uid]: k }));

                setDragItem(null);
                setOverKey(null);
            }}
            style={{
                border: isOver ? "2px solid var(--highlight-color-button, #7aa7ff)" : "1px solid rgba(0,0,0,0.10)",
                borderRadius: 12,
                padding: 10,
                background: "white",
            }}
            >
              <div
                draggable
                onDragStart={(e) => {
                  setDragKey(k);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  setDragKey(null);
                  setOverKey(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverKey(k);
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  move(dragKey, k);
                  setOverKey(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "6px 8px",
                  borderRadius: 10,
                  cursor: "grab",
                  userSelect: "none",
                  background: dragKey === k ? "rgba(0,0,0,0.05)" : "transparent",
                  color: "black",
                }}
                title="Drag this header to reorder groups"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ opacity: 0.7 }}>⋮⋮</span>

                  {editingKey === k ? (
                    <input
                      value={draftName}
                      autoFocus
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(k);
                        if (e.key === "Escape") cancelRename();
                      }}
                      onBlur={() => commitRename(k)}
                      style={{
                        width: 240,
                        maxWidth: "60vw",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.25)",
                        padding: "6px 10px",
                        fontWeight: 800,
                        outline: "none",
                      }}
                    />
                  ) : (
                    <div style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {displayName(k)} <span style={{ fontWeight: 500, opacity: 0.6 }}>{items.length}</span>
                      <span style={{ marginLeft: 8, fontWeight: 600, opacity: 0.35, fontSize: 12 }}>({k})</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {editingKey !== k && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startRename(k);
                      }}
                      style={btnStyle()}
                      title="Rename group"
                    >
                      ✏️ Rename
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                 
                      const uidsToRemove = items.map((it) => it.id); // it.id 就是 item.uid
                    onClearGroup?.(k, uidsToRemove);
                    }}
                    style={btnStyle()}
                  >
                    Clear Group
                  </button>
                </div>
              </div>

              <div style={{ height: 10 }} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                  gap: 10,
                }}
              >
                {items.slice(0, maxThumbsPerGroup).map((it) => (
                 <div
                    key={`${k}::${it.id}::${it.idx}`}
                    draggable
                    onDragStart={(e) => {
                        setDragItem({ uid: it.id, fromKey: k });
                        e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                        setDragItem(null);
                    }}
                    style={{
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.02)",
                        cursor: "grab",
                    }}
                    >
                    <div style={{ aspectRatio: "1 / 1", position: "relative" }}>
                      <img
                        src={it.blobURL}
                        alt={it.file?.name || "image"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemove?.(it.id);
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          border: "none",
                          borderRadius: 10,
                          padding: "6px 8px",
                          background: "rgba(0,0,0,0.55)",
                          color: "white",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>

                    {/* <div style={{ padding: "6px 8px" }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(0,0,0,0.75)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={it.file?.webkitRelativePath || it.file?.name}
                      >
                        {it.file?.name}
                      </div>
                    </div> */}
                  </div>
                ))}
              </div>

              {items.length > maxThumbsPerGroup && (
                <div style={{ marginTop: 8, color: "rgba(0,0,0,0.55)", fontSize: 12 }}>
                  Showing first {maxThumbsPerGroup} thumbnails…
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function btnStyle() {
  return {
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    color: "black",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: "nowrap",
  };
}