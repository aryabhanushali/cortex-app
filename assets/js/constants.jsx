export const MODEL_OPTIONS = [
    { value: 'clip_rn50', label: 'CLIP-ResNet50', type: 'Vision Language Model', cardUrl: 'https://github.com/openai/clip/blob/main/model-card.md' },
    { value: 'dinov2', label: 'DINOv2', type: 'Self-Supervised Vision Transformer Model', cardUrl: 'https://github.com/facebookresearch/dinov2/blob/main/MODEL_CARD.md'},
  ];
  
export const DATASET_OPTIONS = [
  { value: 'murty185', label: 'murty185' },
  { value: 'nsd_1000', label: 'nsd_1000' },
];
  
export const REGION_OPTIONS = [
  { value: 'ffa', label: 'FFA' },
  { value: 'eba', label: 'EBA' },
  { value: 'ppa', label: 'PPA' },
  { value: 'fba', label: 'FBA'},
  { value: 'ofa', label: 'OFA'},
  { value: 'opa', label: 'OPA'},
  { value: 'rsc', label: 'RSC'},
  { value: 'vwfa', label: 'VWFA'},
];
  
export const VOXEL_OPTIONS = [
  { value: 'all-participants', label: 'All Participants' },
  // { value: 'specify-a-participant', label: 'Specify a Participant' },
  // { value: 'random-voxels', label: 'Specify Number of Random Voxels' },
];
  
export const PAPER_OPTIONS = [
  { value: 'Murty185', label: 'Murty185' },
  { value: 'Reza', label: 'Reza' },
];

//Regions included in each dataset
export const MURTY185_INCLUDED_REGIONS = ['ffa', 'eba', 'ppa'];

//Modelcard info
export const MODELCARD_INFO_LOOKUP = {
  'murty185': {
    'ffa': {
      'clip_rn50': { bestLayer: 'layer4.0.downsample.0', corrScore: 0.78 },
      'dinov2': { bestLayer: 'blocks.8.mlp.fc1', corrScore: 0.74 }
    },
    'eba': {
      'clip_rn50': { bestLayer: 'layer4.0.conv1', corrScore: 0.73 },
      'dinov2': { bestLayer: 'blocks.11.mlp.fc1', corrScore: 0.70 }
    },
    'ppa': {
      'clip_rn50': { bestLayer: 'model.layer3.4.conv1', corrScore: 0.73 },
      'dinov2': { bestLayer: 'blocks.8.mlp.fc2', corrScore: 0.72 }
    },
  },
  'nsd_1000': {
    'eba': {
          'clip_rn50': {
            bestLayer: 'model.layer4.1.conv1',
            corrScore: 0.7398091554641724
          },
          'dinov2': {
            bestLayer: 'model.blocks.9.attn.proj',
            corrScore: 0.6434767842292786
          }
        },
        'fba': {
          'clip_rn50': {
            bestLayer: 'model.layer4.0.conv3',
            corrScore: 0.6117726564407349
          },
          'dinov2': {
            bestLayer: 'model.blocks.9.attn.proj',
            corrScore: 0.5964367985725403
          }
        },
        'ffa': {
          'clip_rn50': {
            bestLayer: 'model.layer3.5.conv3',
            corrScore: 0.777091383934021
          },
          'dinov2': {
            bestLayer: 'model.blocks.9.attn.proj',
            corrScore: 0.5661504864692688
          }
        },
        'ofa': {
          'clip_rn50': {
            bestLayer: 'model.layer3.5.conv2',
            corrScore: 0.5193833708763123
          },
          'dinov2': {
            bestLayer: 'model.blocks.9.attn.proj',
            corrScore: 0.5083171725273132
          }
        },
        'opa': {
          'clip_rn50': {
            bestLayer: 'model.layer4.1.conv3',
            corrScore: 0.521541953086853
          },
          'dinov2': {
            bestLayer: 'model.blocks.8.attn.proj',
            corrScore: 0.5530202984809875
          }
        },
        'ppa': {
          'clip_rn50': {
            bestLayer: 'model.layer4.1.conv1',
            corrScore: 0.7444085478782654
          },
          'dinov2': {
            bestLayer: 'model.blocks.8.attn.proj',
            corrScore: 0.6152588129043579
          }
        },
        'rsc': {
          'clip_rn50': {
            bestLayer: 'model.layer3.5.conv2',
            corrScore: 0.5806496739387512
          },
          'dinov2': {
            bestLayer: 'model.blocks.8.attn.proj',
            corrScore: 0.57708740234375
          }
        },
        'vwfa': {
          'clip_rn50': {
            bestLayer: 'model.layer4.2.conv2',
            corrScore: 0.367062509059906
          },
          'dinov2': {
            bestLayer: 'model.blocks.9.attn.proj',
            corrScore: 0.3194778263568878
          }
        }
  }
};


  