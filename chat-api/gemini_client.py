"""Gemini LLM client for open-ended questions. Requires GEMINI_API_KEY."""
from __future__ import annotations

import os


def get_gemini_reply(user_message: str, rule_context: str | None = None, page_context: str | None = None) -> str | None:
    """
    Call Gemini to answer the user message in the context of Virtual Visual Cortex.
    Returns the model reply text, or None if the API key is missing or the call fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key or not api_key.strip():
        print("[gemini] ERROR: No API key found in environment (GEMINI_API_KEY / GOOGLE_API_KEY)")
        return None

    try:
        try:
            from google import genai
        except ImportError:
            raise ImportError("The 'google-genai' library is not installed. Run: pip install google-genai")
        model_id = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        print(f"[gemini] using key: {api_key[:8]}... model: {model_id}")
        client = genai.Client(api_key=api_key.strip())
        # Build page context prefix so Gemini knows where the user is
        page_ctx_str = ""
        if page_context:
            if page_context.startswith("model_page:"):
                model_name = page_context.split(":", 1)[1].replace("_", " ")
                page_ctx_str = (
                    f"=== USER'S CURRENT PAGE ===\n"
                    f"The user is on the model detail page for: {model_name}. "
                    f"When they say 'this model' they mean {model_name}.\n\n"
                )
            elif page_context.startswith("scoreboard"):
                # Parse rich scoreboard state: "scoreboard|training:NSD|region:PPA|selected_model:resnet50|..."
                parts = dict(p.split(":", 1) for p in page_context.split("|") if ":" in p)
                ctx_lines = ["The user is on the Scoreboard page."]
                if parts.get("training"):
                    ctx_lines.append(f"Current training filter: {parts['training']}.")
                if parts.get("region"):
                    ctx_lines.append(f"Selected brain region(s): {parts['region']}.")
                if parts.get("dataset"):
                    ctx_lines.append(f"Selected dataset(s): {parts['dataset']}.")
                if parts.get("selected_model"):
                    model = parts["selected_model"].replace("_", " ")
                    ctx_lines.append(f"The user has selected / is looking at the model: {model}. When they say 'this model' they mean {model}.")
                if parts.get("chart"):
                    ctx_lines.append(f"Chart type: {'univariate' if parts['chart'] == 'uni' else 'multivariate'}.")
                if parts.get("view") == "2":
                    ctx_lines.append("The user is in the Advanced Insights view.")
                page_ctx_str = "=== USER'S CURRENT PAGE ===\n" + " ".join(ctx_lines) + "\n\n"
            elif page_context.startswith("lab"):
                # Parse rich lab state: "lab|step:2|files:30|groups:3|groupNames:faces,scenes,objects|model:clip_rn50|region:ffa|dataset:nsd_1000|hasResults:true"
                lab_parts = dict(p.split(":", 1) for p in page_context.split("|") if ":" in p)
                step = lab_parts.get("step", "1")
                step_names = {"1": "Upload Stimuli", "2": "Training Settings", "3": "Prediction Results"}
                ctx_lines = [f"The user is on the Lab page — Step {step}: {step_names.get(step, step)}."]
                files_count = lab_parts.get("files", "0")
                groups_count = lab_parts.get("groups", "0")
                if files_count != "0":
                    ctx_lines.append(f"They have uploaded {files_count} images in {groups_count} group(s).")
                group_names = lab_parts.get("groupNames", "")
                if group_names:
                    ctx_lines.append(f"Group names: {group_names.replace(',', ', ')}.")
                model = lab_parts.get("model", "")
                region = lab_parts.get("region", "")
                dataset = lab_parts.get("dataset", "")
                if model:
                    ctx_lines.append(f"Selected model: {model.replace('_', ' ')}.")
                if region:
                    ctx_lines.append(f"Selected brain region: {region.upper()}.")
                if dataset:
                    ctx_lines.append(f"Selected training dataset: {dataset.replace('_', ' ')}.")
                if lab_parts.get("hasResults") == "true":
                    ctx_lines.append("Prediction results have been generated and are visible.")
                    overall_mean = lab_parts.get("overallMean", "")
                    if overall_mean:
                        ctx_lines.append(f"Overall mean predicted voxel response: {overall_mean}.")
                    group_means = lab_parts.get("groupMeans", "")
                    if group_means:
                        ctx_lines.append(f"Per-group mean predicted responses: {group_means}.")
                    group_outliers = lab_parts.get("groupOutliers", "")
                    if group_outliers:
                        ctx_lines.append(f"Per-group highest and lowest responding images: {group_outliers}.")
                page_ctx_str = "=== USER'S CURRENT PAGE ===\n" + " ".join(ctx_lines) + "\n\n"

        prompt = (
            "You are the friendly assistant for Virtual Visual Cortex, a platform that bridges neuroscience and AI. "
            "Answer any question about the platform clearly and conversationally.\n\n"
            + page_ctx_str
            + "=== PLATFORM OVERVIEW ===\n"
            "Three main sections:\n"
            "1. Home — introduction and overview.\n"
            "2. The Lab — upload images, pick an AI vision model + training dataset (NSD or Murty185), "
            "select brain regions (FFA, PPA, EBA), and get predicted neural responses. "
            "Steps: upload images → select model → select training dataset → choose brain regions → run predictions.\n"
            "3. The Scoreboard — ranks AI models by how well they predict actual brain fMRI activity. "
            "Filter by training dataset, brain region, evaluation dataset to compare models.\n\n"
            "=== BRAIN REGIONS (ROIs) ===\n"
            "FFA (Fusiform Face Area) — face processing. "
            "PPA (Parahippocampal Place Area) — scene/spatial processing. "
            "EBA (Extrastriate Body Area) — body/body-part processing.\n\n"
            "=== TRAINING DATASETS ===\n"
            "NSD — 1,000 natural scene images, fMRI from 8 subjects (Allen et al., 2022). "
            "Murty185 — 185 naturalistic stimuli, 20+ repetitions, 4 participants in functionally-defined ROIs (Murty et al., 2021).\n\n"
            "=== EVALUATION DATASETS ===\n"
            "BOLD5000 (5,254 images, 4 subjects), Bonner2021 (810 objects, 81 categories), "
            "BMD2024 (1,102 video clips, challenging), KingBaker2019 (diverse cognitive tasks), "
            "Wardle2020 (face pareidolia stimuli), NSD Synthetic (284 controlled out-of-distribution images).\n\n"
            "=== LAB WORKFLOW GUIDANCE ===\n"
            "The Lab has 3 steps: (1) Upload Stimuli → (2) Training Settings → (3) Prediction Results.\n"
            "Step 1 — Upload Stimuli: Users upload images organized into groups (subfolders = groups). "
            "Groups represent experimental conditions (e.g., faces vs. scenes). "
            "Help users plan groups based on their hypothesis. "
            "Suggest hypotheses: FFA responds to faces, PPA to scenes/places, EBA to bodies. "
            "E.g., if they have face and scene images: 'FFA will respond more to faces; PPA will respond more to scenes.'\n"
            "Step 2 — Training Settings: Help users choose: "
            "(a) ROI — FFA for faces, PPA for scenes, EBA for bodies. "
            "(b) Model — CLIP and DINOv2 are top performers across regions; check Scoreboard for best per region. "
            "(c) Dataset — NSD (8 subjects, 1000 scenes, broader) vs. Murty185 (4 subjects, 185 stimuli, 20+ reps, high reliability). "
            "Based on their stimuli + group names + hypothesis, suggest specific model/ROI/dataset combinations.\n"
            "Step 3 — Prediction Results: When the user has results, you have access to their actual data "
            "(group means, per-group highest/lowest responding images). USE THESE NUMBERS in your answer.\n"
            "Bar chart: each bar = one image's mean predicted voxel response in the selected brain region. "
            "Higher bar = the model predicts the brain responds more strongly to that image. "
            "Error bars = standard error of the mean (SEM) across voxels — smaller bars = more reliable signal.\n"
            "RDM heatmap: shows pairwise neural dissimilarity across all images. "
            "Dark cell = two images activate similar voxel patterns. Bright cell = very different patterns. "
            "Images from the same category tend to cluster (dark blocks along the diagonal).\n"
            "Interpreting group differences: if group A has a higher mean than group B in region X, "
            "it suggests the model predicts X responds more strongly to group A's image category. "
            "E.g., faces group higher in FFA → expected, since FFA is specialized for faces.\n"
            "Outliers: an outlier is an image whose bar is far above or below the rest of its group. "
            "To find them: look for the tallest or shortest bar within a group — "
            "the per-group highest/lowest images are available in context when results exist. "
            "Outliers may have mixed visual features (e.g., a face image with a strong background scene).\n"
            "Score calibration: mean responses are Pearson correlations (range ~0–1). "
            "Values around 0.3–0.5 are typical for good models. Below 0.2 may indicate poor fit. "
            "Always compare relative differences across groups, not just absolute values.\n"
            "TONE: explain results at two levels — first a plain-English summary ('your face images drove "
            "stronger predicted brain activity than scenes'), then optionally a technical note for experts "
            "('the mean Pearson correlation for the faces group was X vs Y for scenes'). "
            "If the user seems like a beginner, keep it plain. If they use technical terms, go deeper.\n\n"
            "=== METHODOLOGY ===\n"
            "Model activations extracted → ridge regression maps activations to voxel responses → "
            "performance = Pearson correlation (predicted vs actual fMRI). "
            "Univariate = per-voxel prediction; multivariate = joint pattern across voxels. "
            "Global score = mean across all eval datasets (excluding NSD/Murty185 training sets), "
            "first averaged per-dataset across PPA/FFA/EBA, then averaged across datasets. "
            "Scores above ~0.4 are strong; 0.01–0.02 differences are meaningful. "
            "Ceiling = max possible score given measurement reliability.\n\n"
            "=== KEY MODELS ===\n"
            "Vision-language: BLIP2, CLIP (RN50/RN101/ViT-B32), Kosmos2, SigLIP, SigLIP2, AIMv2, Nomic. "
            "Self-supervised transformers: DINOv2 (base/large), BEiT, EVA-02, WebSSL-DINO300M, WebSSL-MAE300M. "
            "CNNs: ResNet, WideResNet, ConvNeXt, EfficientNet, DenseNet, VGG, AlexNet, BiT, Inception, Xception, HRNet, MobileNetV2. "
            "Brain-optimized: CORnet (S/RT/Z), TDANN, TopoNets, VOneNet variants. "
            "Task-trained: Taskonomy (depth, edges, segmentation, colorization, etc.). "
            "Baselines: random-weight variants; adversarially robust variants (epsilon parameter).\n\n"
            "STYLE:\n"
            "• Match answer length to the question — short questions get short answers.\n"
            "• No long bullet lists unless the user explicitly asks for a list.\n"
            "• For greetings or 'what can you do', give a 2–3 sentence friendly summary.\n"
            "• For 'why' or conceptual questions, give a 2–4 sentence explanation.\n"
            "• Off-topic (not about this platform): say exactly: "
            "I'm here to help with Virtual Visual Cortex! Ask me about the Lab, Scoreboard, "
            "brain regions (FFA, PPA, EBA), or models like BLIP2 or DINOv2.\n"
            "• NEVER use markdown symbols like * or ** for bullets or bold. "
            "Write in plain prose. If a list is truly needed, use a numbered format like '1) ... 2) ...' "
            "or write it as flowing sentences.\n\n"
            + (
                "SCOREBOARD DATA (real numbers — ground your answer in these):\n"
                + rule_context + "\n\n"
                if rule_context else ""
            )
            + "User: " + user_message
        )
        response = client.models.generate_content(model=model_id, contents=prompt)
        if response and response.text:
            return response.text.strip()
    except Exception as e:
        print(f"[gemini] ERROR: {type(e).__name__}: {e}")
    return None
