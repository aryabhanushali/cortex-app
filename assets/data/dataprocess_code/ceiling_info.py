import os
import json

# 输入文件夹
INPUT_DIR = "./ceiling_info_only"
# 输出文件
UNI_OUT = "uni_ceiling.json"
MULTI_OUT = "multi_ceiling.json"

uni_result = {}
multi_result = {}

# 遍历 dataset 子文件夹
for dataset_dir in os.listdir(INPUT_DIR):
    dataset_path = os.path.join(INPUT_DIR, dataset_dir)
    if not os.path.isdir(dataset_path):
        continue

    dataset = dataset_dir  # ❌ 不做映射，直接用原始文件夹名

    for f in os.listdir(dataset_path):
        if not f.endswith(".json"):
            continue

        file_path = os.path.join(dataset_path, f)
        with open(file_path, "r") as infile:
            data = json.load(infile)

        roi = data.get("roi")
        ceiling_mean = data.get("ceiling_mean")
        ceiling_max = data.get("ceiling_max")
        ceiling_raw = data.get("ceiling_raw", [])

        # correlation points 只要数值
        corr_points = [item.get("correlation") for item in ceiling_raw]

        # 判断是 uni 还是 multi
        if "mean" in f.lower():
            target = uni_result
        elif "rdms" in f.lower():
            target = multi_result
        else:
            continue

        if roi not in target:
            target[roi] = {}

        target[roi][dataset] = {
            "ceiling_mean": ceiling_mean,
            "ceiling_max": ceiling_max,
            "correlation_points": corr_points
        }

# 保存两个文件
with open(UNI_OUT, "w") as f:
    json.dump(uni_result, f, indent=2)

with open(MULTI_OUT, "w") as f:
    json.dump(multi_result, f, indent=2)

print(f"✅ Done! Saved to {UNI_OUT} and {MULTI_OUT}")
