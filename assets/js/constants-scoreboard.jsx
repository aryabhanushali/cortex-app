export const MODEL_OPTIONS = [
    { value: 'clip_rn50', label: 'CLIP-ResNet50' },
    { value: 'dinov2', label: 'dinov2' },
  ];
  
export const TRAINING_OPTIONS = [
  { value: 'Murty185', label: 'Murty185' },
  { value: 'NSD', label: 'NSD' },
];
  
export const ROI_OPTIONS = [
  
  { value: 'PPA', label: 'PPA' },
  { value: 'FFA', label: 'FFA' },
  { value: 'EBA', label: 'EBA' },
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

export const DATASET_OPTIONS_LEFT = [
    { value: 'murty185', label: 'Murty185' },
    { value: 'nsd_1000', label: 'NSD' },
    { value: 'bold_5000', label: 'BOLD5000' },
    { value: 'bonner_2021', label: 'Bonner' },
    { value: 'bmd_2024', label: 'BMD' },
    { value: 'kingbaker_2019', label: 'KingBaker' },
    { value: 'wardle_2020', label: 'Wardle' },
    { value: 'nsd_syn', label: 'NSD_SYN' },
  ];

export const DATASET_OPTIONS_RIGHT = [
    { value: 'DuplicatePaper', label: 'DuplicatePaper' }
  ];


export const CHART_TYPE_OPTIONS = [
  { value: 'uni', label: 'Univariate' },
  { value: 'multi', label: 'Multivariate' },
];

export const CHART_SCOPE_OPTIONS = [
  { value: 'all', label: 'All Models' },
  { value: 'top', label: 'Top 10 Models' },
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

  