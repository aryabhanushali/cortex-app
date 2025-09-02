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

    dataset = dataset_dir  # 保留原始文件夹名

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

# ===== 加入 Overall 处理 =====
def add_overall(result_dict):
    overall = {}
    # 遍历每个 dataset
    datasets = set()
    for roi, ds_dict in result_dict.items():
        datasets.update(ds_dict.keys())

    for dataset in datasets:
        means = []
        maxs = []
        for roi, ds_dict in result_dict.items():
            if dataset in ds_dict:
                m = ds_dict[dataset].get("ceiling_mean")
                x = ds_dict[dataset].get("ceiling_max")
                if m is not None:
                    means.append(m)
                if x is not None:
                    maxs.append(x)

        if means and maxs:
            overall[dataset] = {
                "ceiling_mean": sum(means) / len(means),
                "ceiling_max": sum(maxs) / len(maxs)
                # 不写 correlation_points
            }

    result_dict["Overall"] = overall


add_overall(uni_result)
add_overall(multi_result)

# 保存两个文件
with open(UNI_OUT, "w") as f:
    json.dump(uni_result, f, indent=2)

with open(MULTI_OUT, "w") as f:
    json.dump(multi_result, f, indent=2)

print(f"✅ Done! Saved to {UNI_OUT} and {MULTI_OUT}")
