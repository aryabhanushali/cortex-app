import React, { useState } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import Uploader from './uploader.tsx';
import BarChart from './barchart.jsx';

import useBarchartData from './useBarchartData.jsx';
import useHeatmapData from './useHeatmapData.jsx';
import Settings from './settings.jsx';
import Heatmap from './heatmap.jsx';

const { Step } = Steps;

const Stepper: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const DEFAULT_MODEL = 'clip_rn50';
  const DEFAULT_DATASET = 'murty185';
  const DEFAULT_VOXEL = 'all-participants';

  const [model, setModel] = useState(DEFAULT_MODEL);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [region, setRegion] = useState('');
  const [voxelOption, setVoxelOption] = useState(DEFAULT_VOXEL);
  const [voxelNumber, setVoxelNumber] = useState('');
  const [paper, setPaper] = useState('');
  const [participantName, setParticipantName] = useState('');

  const next = () => {
    setCurrent((prev) => prev + 1);
  };

  const prev = () => {
    setCurrent((prev) => prev - 1);
  };

  const onChange = (value: number) => {
    console.log('onChange:', value);
    setCurrent(value);
  };

  const contentStyle: React.CSSProperties = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const { barchartData } = useBarchartData();

  const { heatmapData, originalFilenames, sortedFilenames } = useHeatmapData();

  const steps = [
    {
      title: 'Upload Stimuli',
      content: (
        <div><Uploader /></div>
      ),
    },
    {
      title: 'Training Settings',
      content: (
        <div>
        <Settings
          region={region}
          setRegion={setRegion}
          model={model}
          setModel={setModel}
          dataset={dataset}
          setDataset={setDataset}
          voxelOption={voxelOption}
          setVoxelOption={setVoxelOption}
          voxelNumber={voxelNumber}
          setVoxelNumber={setVoxelNumber}
          participantName={participantName}
          setParticipantName={setParticipantName}
          paper={paper}
          setPaper={setPaper}
        />
      </div>
      ),
    },
    {
      title: 'Prediction Results',
      content: (
        <div>
        <BarChart barChartData={barchartData} height={500}/>
        <Heatmap heatmapData={heatmapData} originalFilenames={originalFilenames} sortedFilenames={sortedFilenames} width={1000} height={1000} />
        </div>
      ),
      icon: <SmileOutlined />,
    },
  ];

  return (
    <>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      <div style={contentStyle}>{steps[current].content}</div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: "8px" }}>
      {current === 1 && (
        <Button type="primary" onClick={() => message.info("Run prediction!")}>
          Predict
        </Button>
      )}
      {current === steps.length - 1 && (
        <Button type="primary" onClick={() => message.success("Processing complete!")}>
          Download Data
        </Button>
      )}
    </div>

    </>
  );
};

export default Stepper;
