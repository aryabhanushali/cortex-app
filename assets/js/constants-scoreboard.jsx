// constants-scoreboard.js
export const UNAVAILABILITY = {
  trainingToDataset: {
    Murty185: ['murty185'], 
    NSD:['nsd1000' ],   
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
    { value: 'clip_rn50', label: 'CLIP-ResNet50' },
    { value: 'dinov2', label: 'dinov2' },
  ];
  
export const TRAINING_OPTIONS = [
  { value: 'Murty185', label: 'Murty185' },
  // { value: 'VS', label: 'Murty185 VS NSD1000'},
  { value: 'NSD', label: 'NSD' },
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

export const DATASETCARD_OPTIONS = [
  { value: "nsd_1000", label: "NSD1000" },
  { value: "murty185", label: "Murty185" }
  // add more datasets...
];

export const DATASETCARD_INFO_LOOKUP = {
  nsd_1000: {
    category: "Natural Scenes",
    size: "1000 images",
    subjects: 8,
    description: "The Natural Scenes Dataset subset with 1000 stimuli and fMRI responses from 8 participants.",
    cardUrl: "https://naturalscenesdataset.org/"
  },
  murty185: {
    category: "Faces & Objects",
    size: "185 images",
    subjects: 4,
    description: "Dataset of fMRI responses to 185 face/object stimuli, collected by Murty et al.",
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


  
