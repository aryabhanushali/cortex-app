// constants-scoreboard.js
export const UNAVAILABILITY = {
  trainingToDataset: {
     NSD:['nsd1000' ],   
    Murty185: ['murty185'], 
   
  },

  datasetToTraining: {
    murty185: ["Murty185"], 
    nsd1000: ["NSD"],                             
  },
  datasetToROI: {           
    bold_5000: ["ffa", "eba"], 
    bonner_2021: ["ffa", "eba"], 
    kingbaker_2019: ["eba"],
    wardle_2020: ["eba"],
  },
  roiToDataset: {
    ffa: ["bold_5000","bonner_2021"],
    eba: ["bold_5000", "bonner_2021","wardle_2020"],
  },
};



export const MODEL_OPTIONS = [
  { value: 'adversarial_inceptionv3', label: 'Adv. Inception-v3' },
  { value: 'aimv2', label: 'AIMv2' },
  { value: 'alexnet', label: 'AlexNet' },
  { value: 'alexnet_random', label: 'AlexNet (random)' },
  { value: 'beit', label: 'BEiT' },
  { value: 'bit', label: 'BiT' },
  { value: 'blip2', label: 'BLIP-2' },
  { value: 'briaai', label: 'BRIA AI' },
  { value: 'clip_rn101', label: 'CLIP-ResNet101' },
  { value: 'clip_rn101_random', label: 'CLIP-ResNet101 (random)' },
  { value: 'clip_rn50', label: 'CLIP-ResNet50' },
  { value: 'clip_rn50_random', label: 'CLIP-ResNet50 (random)' },
  { value: 'clip_vit_b32', label: 'CLIP-ViT-B/32' },
  { value: 'clip_vit_b32_random', label: 'CLIP-ViT-B/32 (random)' },
  { value: 'convnext', label: 'ConvNeXt' },
  { value: 'cornet_rt', label: 'CORnet-RT' },
  { value: 'cornet_s', label: 'CORnet-S' },
  { value: 'cornet_z', label: 'CORnet-Z' },
  { value: 'cross_vit', label: 'CrossViT' },
  { value: 'densenet121', label: 'DenseNet-121' },
  { value: 'densenet161', label: 'DenseNet-161' },
  { value: 'densenet169', label: 'DenseNet-169' },
  { value: 'densenet201', label: 'DenseNet-201' },
  { value: 'dinov2', label: 'DINOv2-B' },
  { value: 'dinov2_large', label: 'DINOv2-L' },
  { value: 'dinov2_random', label: 'DINOv2-B (random)' },
  { value: 'dreamsim_vitb16', label: 'DreamSim ViT-B/16' },
  { value: 'dreamsim_vitb32', label: 'DreamSim ViT-B/32' },
  { value: 'efficient_net', label: 'EfficientNet' },
  { value: 'ese_vovnet', label: 'VoVNet (ESE)' },
  { value: 'eva2', label: 'EVA-02' },
  { value: 'fbnet', label: 'FBNet' },
  { value: 'ghost_net', label: 'GhostNet' },
  { value: 'google_vit', label: 'Google ViT' },
  { value: 'hrnet', label: 'HRNet' },
  { value: 'inception_rn_v2', label: 'Inception-ResNet-v2' },
  { value: 'inceptionv3', label: 'Inception-v3' },
  { value: 'inceptionv4', label: 'Inception-v4' },
  { value: 'kosmos2', label: 'Kosmos-2' },
  { value: 'mixnet', label: 'MixNet' },
  { value: 'mnasnet', label: 'MNASNet' },
  { value: 'mobilenetv2', label: 'MobileNetV2' },
  { value: 'nomic', label: 'Nomic Embeddings' },
  { value: 'resnet101', label: 'ResNet-101' },
  { value: 'resnet101_imagenet1kv1', label: 'ResNet-101 (ImageNet v1)' },
  { value: 'resnet101_random', label: 'ResNet-101 (random)' },
  { value: 'resnet18', label: 'ResNet-18' },
  { value: 'resnet18_random', label: 'ResNet-18 (random)' },
  { value: 'resnet50', label: 'ResNet-50' },
  { value: 'resnet50_places365', label: 'ResNet-50 (Places365)' },
  { value: 'resnet50_random', label: 'ResNet-50 (random)' },
  { value: 'resnet50_vggface2', label: 'ResNet-50 (VGGFace2)' },
  { value: 'robust_densenet161_epsilon_3', label: 'Robust DenseNet-161 (ε=3)' },
  { value: 'robust_mnasnet_epsilon_3', label: 'Robust MNASNet (ε=3)' },
  { value: 'robust_mobilenetv2_epsilon_3', label: 'Robust MobileNetV2 (ε=3)' },
  { value: 'robust_rn18_epsilon_003', label: 'Robust RN18 (ε=0.03)' },
  { value: 'robust_rn18_epsilon_01', label: 'Robust RN18 (ε=0.1)' },
  { value: 'robust_rn18_epsilon_025', label: 'Robust RN18 (ε=0.25)' },
  { value: 'robust_rn18_epsilon_3', label: 'Robust RN18 (ε=3)' },
  { value: 'robust_rn18_epsilon_5', label: 'Robust RN18 (ε=5)' },
  { value: 'robust_rn50_blur_strong', label: 'Robust RN50 (blur strong)' },
  { value: 'robust_rn50_blur_weak', label: 'Robust RN50 (blur weak)' },
  { value: 'robust_rn50_epsilon_003', label: 'Robust RN50 (ε=0.03)' },
  { value: 'robust_rn50_epsilon_01', label: 'Robust RN50 (ε=0.1)' },
  { value: 'robust_rn50_epsilon_025', label: 'Robust RN50 (ε=0.25)' },
  { value: 'robust_rn50_epsilon_3', label: 'Robust RN50 (ε=3)' },
  { value: 'robust_rn50_epsilon_5', label: 'Robust RN50 (ε=5)' },
  { value: 'robust_vgg16_blur_strong', label: 'Robust VGG-16 (blur strong)' },
  { value: 'robust_vgg16_blur_weak', label: 'Robust VGG-16 (blur weak)' },
  { value: 'robust_vgg16_bn_epsilon_3', label: 'Robust VGG-16-BN (ε=3)' },
  { value: 'robust_vgg19_blur_strong', label: 'Robust VGG-19 (blur strong)' },
  { value: 'robust_vgg19_blur_weak', label: 'Robust VGG-19 (blur weak)' },
  { value: 'robust_wideresnet50_epsilon_003', label: 'Robust WideResNet-50 (ε=0.03)' },
  { value: 'robust_wideresnet50_epsilon_01', label: 'Robust WideResNet-50 (ε=0.1)' },
  { value: 'robust_wideresnet50_epsilon_025', label: 'Robust WideResNet-50 (ε=0.25)' },
  { value: 'robust_wideresnet50_epsilon_3', label: 'Robust WideResNet-50 (ε=3)' },
  { value: 'robust_wideresnet50_epsilon_5', label: 'Robust WideResNet-50 (ε=5)' },
  { value: 'siglip', label: 'SigLIP' },
  { value: 'siglip2', label: 'SigLIP-2' },
  { value: 'taskonomy_autoencoding', label: 'Taskonomy: Autoencoding' },
  { value: 'taskonomy_class_object', label: 'Taskonomy: Class Object' },
  { value: 'taskonomy_class_scene', label: 'Taskonomy: Class Scene' },
  { value: 'taskonomy_colorization', label: 'Taskonomy: Colorization' },
  { value: 'taskonomy_curvature', label: 'Taskonomy: Curvature' },
  { value: 'taskonomy_denoising', label: 'Taskonomy: Denoising' },
  { value: 'taskonomy_depth_euclidean', label: 'Taskonomy: Depth (Euc.)' },
  { value: 'taskonomy_depth_zbuffer', label: 'Taskonomy: Depth (Z-buf.)' },
  { value: 'taskonomy_edge_occlusion', label: 'Taskonomy: Edge Occlusion' },
  { value: 'taskonomy_edge_texture', label: 'Taskonomy: Edge Texture' },
  { value: 'taskonomy_ego_motion', label: 'Taskonomy: Ego Motion' },
  { value: 'taskonomy_inpainting', label: 'Taskonomy: Inpainting' },
  { value: 'taskonomy_jigsaw', label: 'Taskonomy: Jigsaw' },
  { value: 'taskonomy_keypoints2d', label: 'Taskonomy: Keypoints 2D' },
  { value: 'taskonomy_keypoints3d', label: 'Taskonomy: Keypoints 3D' },
  { value: 'taskonomy_non_fixated', label: 'Taskonomy: Non-fixated' },
  { value: 'taskonomy_normal', label: 'Taskonomy: Normal' },
  { value: 'taskonomy_point_matching', label: 'Taskonomy: Point Matching' },
  { value: 'taskonomy_reshading', label: 'Taskonomy: Reshading' },
  { value: 'taskonomy_rgb2depth', label: 'Taskonomy: RGB→Depth' },
  { value: 'taskonomy_rgb2mist', label: 'Taskonomy: RGB→MiST' },
  { value: 'taskonomy_rgb2sfnorm', label: 'Taskonomy: RGB→SF Norm' },
  { value: 'taskonomy_room_layout', label: 'Taskonomy: Room Layout' },
  { value: 'taskonomy_segment_semantic', label: 'Taskonomy: Segment (Semantic)' },
  { value: 'taskonomy_segment_unsup2d', label: 'Taskonomy: Segment (Unsupervised 2D)' },
  { value: 'taskonomy_surface_normals', label: 'Taskonomy: Surface Normals' },
  { value: 'taskonomy_vanishing_points', label: 'Taskonomy: Vanishing Points' },
  { value: 'toponets_rn18', label: 'TopoNets ResNet-18' },
  { value: 'toponets_rn18_tau_0.5', label: 'TopoNets ResNet-18 (τ=0.5)' },
  { value: 'toponets_rn18_tau_1', label: 'TopoNets ResNet-18 (τ=1)' },
  { value: 'toponets_rn18_tau_20', label: 'TopoNets ResNet-18 (τ=20)' },
  { value: 'toponets_rn18_tau_5', label: 'TopoNets ResNet-18 (τ=5)' },
  { value: 'toponets_rn18_tau_50', label: 'TopoNets ResNet-18 (τ=50)' },
  { value: 'toponets_rn50', label: 'TopoNets ResNet-50' },
  { value: 'toponets_vit', label: 'TopoNets ViT' },
  { value: 'vgg16_imagenet1kv1', label: 'VGG-16 (ImageNet v1)' },
  { value: 'vgg16_imagenet1kv1_random', label: 'VGG-16 (ImageNet v1, random)' },
  { value: 'vgg19_imagenet1kv1', label: 'VGG-19 (ImageNet v1)' },
  { value: 'vgg19_imagenet1kv1_random', label: 'VGG-19 (ImageNet v1, random)' },
  { value: 'vone_alexnet', label: 'VOneNet AlexNet' },
  { value: 'vone_cornet_s', label: 'VOneNet CORnet-S' },
  { value: 'vone_rn50', label: 'VOneNet ResNet-50' },
  { value: 'webssl_dino300m', label: 'WebSSL DINO-300M' },
  { value: 'webssl_mae300m', label: 'WebSSL MAE-300M' },
  { value: 'wideresnet101', label: 'WideResNet-101' },
  { value: 'wideresnet50', label: 'WideResNet-50' },
  { value: 'xception', label: 'Xception' },
  // Random variants
  { value: 'densenet161_random', label: 'DenseNet-161 (random)' },
  { value: 'google_vit_random', label: 'Google ViT (random)' },
  { value: 'nomic_random', label: 'Nomic Embeddings (random)' },

  // Robust RN18 blur
  { value: 'robust_rn18_blur_weak', label: 'Robust RN18 (blur weak)' },
  { value: 'robust_rn18_blur_strong', label: 'Robust RN18 (blur strong)' },

  // Taskonomy variant
  { value: 'taskonomy_segment_unsup25d', label: 'Taskonomy: Segment (Unsupervised 2.5D)' },

  // TDANN family
  { value: 'tdann_simclr', label: 'TDANN SimCLR' },
  { value: 'tdann_simclr_alpha_2', label: 'TDANN SimCLR (α=2)' },
  { value: 'tdann_simclr_alpha_5', label: 'TDANN SimCLR (α=5)' },
  { value: 'tdann_simclr_alpha_10', label: 'TDANN SimCLR (α=10)' },
  { value: 'tdann_simclr_alpha_100', label: 'TDANN SimCLR (α=100)' },
];

  
export const TRAINING_OPTIONS = [
   { value: 'NSD', label: 'NSD' },
  { value: 'Murty185', label: 'Murty185' },
  // { value: 'VS', label: 'Murty185 VS NSD1000'},
 
];

export const TRAINING_OPTIONS_VS= [
  { value: 'Murty185', label: 'Murty185' },
  { value: 'VS', label: 'Murty185 VS NSD1000'},
  { value: 'NSD', label: 'NSD' },
];
  
export const ROI_OPTIONS = [
  
  { value: 'ppa', label: 'PPA' },
  { value: 'ffa', label: 'FFA' },
  { value: 'eba', label: 'EBA' },
  // { value: 'FBA', label: 'FBA'},
  // { value: 'OFA', label: 'OFA'},
  // { value: 'OPA', label: 'OPA'},
  // { value: 'RSC', label: 'RSC'},
  // { value: 'VWFA', label: 'VWFA'},
];

export const OVERALL_OPTION = [
  { value: 'Overall', label: 'Cross-Regions' },

];

export const REGION_OPTIONS = [
  { value: 'Overall', label: 'Cross-Regions' },
  { value: 'ppa', label: 'PPA' },
  { value: 'ffa', label: 'FFA' },
  { value: 'eba', label: 'EBA' }

];

export const DATASET_OPTIONS = [
    { value: 'murty185', label: 'Murty185' },
    { value: 'nsd_1000', label: 'NSD1000' },
    { value: 'bold_5000', label: 'BOLD5000v2' },
    { value: 'bonner_2021', label: 'Bonner2021' },
    { value: 'bmd_2024', label: 'BMD2024' },
    { value: 'kingbaker_2019', label: 'King2019' },
    { value: 'wardle_2020', label: 'Wardle2020' },
    { value: 'nsd_syn', label: 'NSD synthetic' },
  ];

export const DATASET_OPTIONS_LESS = [

    { value: 'bold_5000', label: 'BOLD5000v2' },
    { value: 'bonner_2021', label: 'Bonner2021' },
    { value: 'bmd_2024', label: 'BMD2024' },
    { value: 'kingbaker_2019', label: 'King2019' },
    { value: 'wardle_2020', label: 'Wardle2020' },
    { value: 'nsd_syn', label: 'NSD synthetic' },
  ];



export const CHART_TYPE_OPTIONS = [
  { value: 'uni', label: 'Univariate' },
  { value: 'multi', label: 'Multivariate' },
];

export const RANK = [
  { value: 'rank', label: 'Rank' },
];




    
export const MURTY185_DATASET = ['nsd_1000', 'bold_5000', 'bonner_2021','bmd_2024','kingbaker_2019','wardle_2020','nsd_syn' ];
export const NSD_DATASET = ['murty185','bold_5000', 'bonner_2021','bmd_2024','kingbaker_2019','wardle_2020','nsd_syn'];


export const VOXEL_OPTIONS = [
  { value: 'all-participants', label: 'All Participants' },
  { value: 'specify-a-participant', label: 'Specify a Participant' },
  { value: 'random-voxels', label: 'Specify Number of Random Voxels' },
];
  
export const PAPER_OPTIONS = [
  { value: 'Murty185', label: 'Murty185' },
  { value: 'Reza', label: 'Reza' },
];

//Regions included in each dataset
export const MURTY185_INCLUDED_REGIONS = ['overall','ffa', 'eba', 'ppa'];

//Modelcard info
export const MODELCARD_INFO_LOOKUP = {
  'murty185': {
    'ffa': {
      'clip_rn50': { bestLayer: 'layer3.5.conv3', corrScore: 0.79 },
      'dinov2': { bestLayer: 'placeholder', corrScore: 0.70 }
    },
    'eba': {
      'clip_rn50': { bestLayer: 'layer4.1.relu1', corrScore: 0.75 },
      'dinov2': { bestLayer: 'placeholder', corrScore: 0.70 }
    },
    'ppa': {
      'clip_rn50': { bestLayer: 'layer4.0.relu1', corrScore: 0.73 },
      'dinov2': { bestLayer: 'placeholder', corrScore: 0.70 }
    },
    // Add more regions and models for Murty185 dataset
  },
  'nsd_1000': {
    'ffa': {
      'clip_rn50': { bestLayer: 'placeholder', corrScore: 0.70 },
      'dinov2': { bestLayer: 'placeholder', corrScore: 0.70 }
    },
    // Add more regions and models for NSD dataset
  }
};

export const DATASETCARD_OPTIONS = [
  { value: "nsd_1000", label: "Natural Scenes Dataset (NSD1000)" },
  { value: "murty185", label: "Murty185" }
  // add more datasets...
];

export const DATASETCARD_INFO_LOOKUP = {
  nsd_1000: {
    category: "Natural Scenes",
    size: "1000 images",
    subjects: 8,
    description: "A subset of the Natural Scenes Dataset (NSD) with fMRI dataset measurements of 8 healthy adult subjects while they viewed a thousand images of color natural scenes (Allen et al., 2022).",
    cardUrl: "https://naturalscenesdataset.org/"
  },
  murty185: {
    category: "Faces & Objects",
    size: "185 images",
    subjects: 4,
    description: "An fMRI dataset of four participants responses in functionally-defined regions of interest (fROIs) to a diverse set of 185 naturalistic stimuli. Each of the 185 images was presented at least 20 times to each participant (Murty et al., 2021).",
    cardUrl: "https://www.nature.com/articles/s41467-021-25409-6"
  },
};

// =====================
// ROI constants
// =====================
export const ROICARD_OPTIONS = [
  { value: "ffa", label: "Fusiform Face Area (FFA)" },
  { value: "ppa", label: "Parahippocampal Place Area (PPA)" },
  { value: "eba", label: "Extrastriate Body Area (EBA)" },
];

export const ROICARD_INFO_LOOKUP = {
  ffa: {
    description:
      "The fusiform face area (FFA) is a part of the human visual system that is specialized for facial recognition.",
    cardUrl: "https://www.jneurosci.org/content/17/11/4302",
  },
  ppa: {
    description:
      "The Parahippocampal Place Area (PPA) is a brain region strongly activated by scenes and spatial layouts.",
    cardUrl: "https://www.nature.com/articles/33402",
  },
  eba: {
    description:
      "The Extrastriate Body Area (EBA) responds selectively to images of human bodies and body parts.",
    cardUrl: "https://www.science.org/doi/10.1126/science.1063414",
  },
};


  
