export const MODEL_OPTIONS = [
    { value: 'clip_rn50', label: 'CLIP-ResNet50' },
    { value: 'dinov2', label: 'dinov2' },
  ];
  
export const TRAINING_OPTIONS = [
  { value: 'Murty185', label: 'Murty185' },
  { value: 'NSD', label: 'NSD' },
];
  
export const REGION_OPTIONS = [
  { value: 'overall', label: 'Cross-Regions' },
  { value: 'PPA', label: 'PPA' },
  { value: 'FFA', label: 'FFA' },
  { value: 'EBA', label: 'EBA' },
  { value: 'FBA', label: 'FBA'},
  { value: 'OFA', label: 'OFA'},
  { value: 'OPA', label: 'OPA'},
  { value: 'RSC', label: 'RSC'},
  { value: 'VWFA', label: 'VWFA'},
];

export const DATASET_OPTIONS = [
    { value: 'Murty185', label: 'Murty185' },
    { value: 'NSD', label: 'NSD' },
    { value: 'algonauts', label: 'algonauts' },
    { value: 'BOLD5000', label: 'BOLD5000' },
    { value: 'BonnerEpstein', label: 'BonnerEpstein' },
    { value: 'KingBaker', label: 'KingBaker' }
  ];


    
export const MURTY185_DATASET = ['NSD','algonauts', 'BOLD5000', 'BonnerEpstein','KingBaker'];
export const NSD_DATASET = ['Murty185','algonauts', 'BOLD5000', 'BonnerEpstein','KingBaker'];


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

  