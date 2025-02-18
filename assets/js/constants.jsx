export const MODEL_OPTIONS = [
    { value: 'clip_rn50', label: 'Clip-ResNet50' },
    { value: 'dinov2', label: 'dinov2' },
  ];
  
  export const DATASET_OPTIONS = [
    { value: 'murty185', label: 'Murty185' },
    { value: 'nsd_1000', label: 'NSD' },
  ];
  
  export const REGION_OPTIONS = [
    { value: 'ffa', label: 'FFA' },
    { value: 'eba', label: 'EBA' },
    { value: 'ppa', label: 'PPA' },
    { value: 'fba', label: 'FBA', disabled: true},
    { value: 'ofa', label: 'OFA', disabled: true },
    { value: 'opa', label: 'OPA', disabled: true },
    { value: 'ofa', label: 'OFA', disabled: true },
    { value: 'rsc', label: 'RSC', disabled: true },
    { value: 'vwfa', label: 'VWFA', disabled: true },
  ];
  
  export const VOXEL_OPTIONS = [
    { value: 'all-participants', label: 'All Participants' },
    { value: 'specify-a-participant', label: 'Specify a Participant' },
    { value: 'random-voxels', label: 'Specify Number of Random Voxels' },
  ];
  
  export const PAPER_OPTIONS = [
    { value: 'Murty185', label: 'Murty185' },
    { value: 'Reza', label: 'Reza' },
  ];
  