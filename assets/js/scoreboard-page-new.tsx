import React, { useState, useEffect } from 'react';
import { Typography, Button, Radio } from 'antd';

import TrainingSelectNew from './trainingselectnew.jsx';
import ROISelectNew from './roiselectnew.jsx';
import DatasetSelectNew from './datasetselectnew.jsx';
import SelectedFiltersBar from './selectFiltersBar.jsx';
import ChartSelect from './chartselect.jsx'; 
import HeatmapOverview from './heatmapOverview.jsx';
import HeatmapDetail from './heatmapDetail.jsx';
import ScatterMurtyVsNsd from './scatterMurtyVsNsd.jsx';
import PageSelect from './pageselect.jsx';
import BarChartDetail from './barchartdetail.jsx'; 
import BarChartOverview from './barchartoverview.jsx';
import QuestionSelect from './questionselect.jsx';
import ScatterGapCeiling from './roiDatasetScatter.jsx';



import useLoadDataNew from './loadDataNew.jsx';

const { Title } = Typography;


const ScoreboardPageNew: React.FC = () => {
  const [training, setTraining] = useState('NSD');
  const [region, setRegion] = useState(['Across Regions']);
  const [dataset, setDataset] = useState([]);

  const [chartType, setChartType] = useState('uni'); 
  const [rank, setRank] = useState(''); 
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // interaction variable for overview and details
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  const [pageView, setPageView] = useState('rank');
 
  const isDatasetDetailMode = pageView === 'rank' && dataset.length > 0;
  const [activeQuestion, setActiveQuestion] = useState('q1');

  const isVS = pageView === '2' && activeQuestion === 'q1';

  useEffect(() => {
  if (isVS) {
    setTraining('Murty185 VS NSD1000');
  } else {
    
    if (training === 'Murty185 VS NSD1000') {
      setTraining('NSD');
    }
  }
}, [isVS]);

  // pageview logic
  useEffect(() => {
    if (pageView === 'rank') {
      // 1. rank (Scoreboard)
      setTraining('NSD'); 
    } 
    else if (pageView === '2') {
      // 2.  2 (Comparison)
      // force to comparison
      setTraining('Murty185 VS NSD1000'); 
    } 
    // else if (pageView === '3') {
    //   // 3. 
 
    //   setTraining('NSD'); 
    // }
  }, [pageView]);





  type newData = {
    //group by ppa
    murty_uni?: Record<string, any>;
    nsd_uni?: Record<string, any>;
    murty_multi?: Record<string, any>;
    nsd_multi?: Record<string, any>;
  
    // 
    ceiling_uni?: Record<string, any>;
    ceiling_multi?: Record<string, any>;
  
      
    roi_dataset_Murty185_uni?: Record<string, any>;
    roi_dataset_Murty185_multi?: Record<string, any>;
    roi_dataset_NSD_uni?: Record<string, any>;
    roi_dataset_NSD_multi?: Record<string, any>;
  };
  
    const { data: newData, loading: loadingNew } = useLoadDataNew() as {
      data: newData;
      loading: boolean;
    };
  
  
    const murtyData = chartType === "uni" ? newData?.murty_uni : newData?.murty_multi;
    const nsdData   = chartType === "uni" ? newData?.nsd_uni   : newData?.nsd_multi;
    const ROI_DATASET_Murty = chartType === "uni" ? newData?.roi_dataset_Murty185_uni : newData?.roi_dataset_Murty185_multi;
    const ROI_DATASET_NSD = chartType === "uni" ? newData?.roi_dataset_NSD_uni : newData?.roi_dataset_NSD_multi;
    const Ceiling = chartType === "uni" ? newData?.ceiling_uni : newData?.ceiling_multi;
    const yLabel = chartType === "uni" ? "Pearson Correlation" : "Spearman Correlation";
  
  


  const hasFilters =
    (training && training !== '') ||
    (Array.isArray(dataset) && dataset.length > 0) ||
    (Array.isArray(region) && region.length > 0);

  const clearFilters = () => {
    setTraining('NSD');
    setRegion(['Across Regions']);
    setDataset([]);
  };

  const clearSingle = (key: string, value: string) => {
    if (key === 'training') setTraining('');
    if (key === 'dataset') setDataset((prev) => prev.filter((r) => r !== value));
    if (key === 'region') setRegion((prev) => prev.filter((r) => r !== value));
  };

  const getDataByTraining = (training: string) => {
  if (training === "NSD") {
    return  nsdData;
  } else if (training === "Murty185") {
    return murtyData;
  } else {
    return {}; 
  }
};


return (
    <div
      style={{
        // 1. restrict to screen's height
        height: '100vh', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', 
        padding: '16px',    
        boxSizing: 'border-box',
        background: '#fff' 
      }}
    >
      {/* 2. SelectedFiltersBar */}
      {/* flex: 0 0 auto  */}
      {/* <div style={{ flex: '0 0 auto', marginBottom: 16 }}>
        <SelectedFiltersBar
          training={training}
          region={region}
          dataset={dataset}
          clearSingle={clearSingle}
        />
      </div> */}

      {/* --- 顶部工具栏：SelectedFiltersBar 在左(自动换行)，PageSelect 在右(固定) --- */}
      <div style={{ 
        flex: '0 0 auto', 
        marginBottom: 16, 
        display: 'flex', 
        flexDirection: 'row',          
        justifyContent: 'space-between', 
        alignItems: 'flex-start',      
        width: '100%',
        gap: '10px'                    
      }}>
        
        {/* left：auto warp*/}
        <div style={{ 
          flex: '1 1 auto', 
          minWidth: 0 
        }}>
          <SelectedFiltersBar
            training={training}
            region={region}
            dataset={dataset}
            clearSingle={clearSingle}
          />
        </div>

        {/* right page setting */}
        <div style={{ 
          flex: '0 0 auto',
          whiteSpace: 'nowrap' 
        }}>
          <PageSelect value={pageView} onChange={setPageView} />
        </div>
      </div>
      {/* 3. body part（left: Filter + right: Charts） */}
      {/* flex: 1 fit all space */}
   
     
      <div
        style={{
          flex: 1,
          minHeight: 0, 
          display: 'grid',
          // gridTemplateColumns: '1.5fr 7fr', // ratio for overview and detail
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 7fr)',
          gap: 16,
        }}
      >
        
        {/* --- left Filters --- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',     // fill height
            overflowY: 'auto',  // 
            paddingRight: 4,    // 
            scrollbarWidth: 'thin',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={4} style={{ margin: 0 }}>Filters</Title>
            <Button
              type="default"
              disabled={!hasFilters}
              onClick={clearFilters}
              size="small" 
              style={{
                borderRadius: 6,
                fontWeight: 500,
                color: hasFilters ? '#1890ff' : '#aaa',
                borderColor: hasFilters ? '#1890ff' : '#ccc',
              }}
            >
              Default
            </Button>
          </div>

          {/* ChartSelect button group*/}
          <div
            style={{
              flex: '0 0 auto', 
              background: '#f5f5f5',
              borderRadius: 8,
              padding: '4px',
              display: 'flex',
              justifyContent: 'center',
              marginBottom:12
            }}
          >
            <ChartSelect
              chartType={chartType}
              setChartType={setChartType}
              rank={rank}
              setRank={setRank}
              enable={true} 
            />
          </div>

          

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <TrainingSelectNew training={training} setTraining={setTraining} dataset={dataset} vsOption = {isVS} />
            <ROISelectNew
              region={region}
              setRegion={setRegion}
              dataset={dataset}
              setDataset={setDataset}
              allowToggle={true}
              mode={1}
              training={training}
            />
            <DatasetSelectNew
              dataset={dataset}
              setDataset={setDataset}
              training={training}
              region={region}
              allowToggle={true}
              mode={1}
            />
            
          </div>
        </div>

        {/* --- right（ChartSelect + overview + details） --- */}

      
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // fill height
            gap: 16,
            minHeight: 0, // 
            minWidth: 0,
          }}

        >
          {pageView === '2' && (
            <QuestionSelect 
              value={activeQuestion} 
              onChange={(val: string) => setActiveQuestion(val)} 
            />
          )}

          {/* chart: horizontal*/}
        <div 
          style={{ 
            flex: 1, 
            minHeight: 0, 
            display: isDatasetDetailMode ? 'flex' : 'grid', 
            flexDirection: 'column',                        
            gridTemplateColumns: pageView === '2' ? '1fr' : '1fr 6fr', 
            gap: 16 
          }}
        >
            
           {/* --- Overview Section --- */}

      
            {pageView !== '2' && ( 
              <div
                style={{
                  background: 'transparent', 
                  borderRadius: 8,
                  padding: '0px',
                  height: isDatasetDetailMode ? '25%' : '100%', 
                  display: 'flex',       
                  // flexdirection change logic
                  flexDirection: dataset.length > 0 ? 'column' : 'row', 
                  overflowY: dataset.length > 0 ? 'auto' : 'hidden', // rollable 
                  overflowX: dataset.length > 0 ? 'hidden' : 'hidden', 
                  flexShrink: 0,
                  
                  gap: dataset.length > 0 ? 12 : 0, 
                  border: isDatasetDetailMode ? '1px solid #f0f0f0' : 'none',
                  width: '100%',
                }}
              >
                {dataset.length > 0 ? (
                  /* vertical for barchart --- */
                  dataset.map((dsName) => (
                    region.map((roiValue) => (
                      <div 
                        key={`${dsName}-${roiValue}`} 
                        style={{ 
                          flex: 1,
                          minHeight: '80px',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '6px 4px',
                          background: '#fafafa', 
                          borderRadius: 6,
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: 4 }}>
                          {roiValue === 'Across Regions' ? 'Overall' : roiValue} ({dsName})
                        </div>
                        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                          <BarChartOverview
                            data={getDataByTraining(training)}
                            roi={roiValue === 'Across Regions' ? 'Overall' : roiValue}
                            dataset={dsName} 
                            ceiling={Ceiling}
                            rank={rank}
                            onModelClick={(m: string | null) => setSelectedModel(m)}
                            selectedModel={selectedModel}
                          />
                        </div>
                      </div>
                    ))
                  ))
                ) : (
                  /* --- horizontal for heap map --- */
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    flex: 1, 
                    height: '100%',
                    width: '100%',
                    gap: 12, 
                    overflow: 'hidden' 
                  }}>
                    {region.map((roiValue) => (
                      <div 
                        key={roiValue} 
                        style={{ 
                         
                          flex: '1 1 0%', 
                          minWidth: 0,
                          display: 'flex', 
                          flexDirection: 'column',
                          height: '100%',
                          overflow: 'hidden'
                        }}
                      >
                        {/* ROI subtitle */}
                        <div style={{ 
                          textAlign: 'center', 
                          fontSize: '10px', 
                          fontWeight: 'bold', 
                          color: '#888',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {roiValue === 'Across Regions' ? 'Overall' : roiValue}
                        </div>
                        
                        {/* chart container*/}
                        <div style={{ 
                          flex: 1, 
                          position: 'relative', 
                          width: '100%', 
                          minHeight: 0,
                          overflow: 'hidden', 
                          marginBottom: 8
                        }}>
                          <HeatmapOverview
                            data={getDataByTraining(training)} 
                            roi={roiValue === 'Across Regions' ? 'Overall' : roiValue}
                            dataset={''}
                            rank={rank}
                            selectedModel={selectedModel}
                            onModelClick={(m: string) => setSelectedModel(m)}
                            visibleRange={visibleRange}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            



            {/* chart 2: Detail */}
           
            <div
              style={{
                background: '#fafafa',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0, 
                
                overflow: 'hidden',
                flex: isDatasetDetailMode ? 1 : 'none',
                overflowY: 'auto',
              }}
            >
             <h3
                style={{
                  flex: '0 0 auto',
                  marginBottom: 8,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#333',
                  textAlign: 'center', 
                }}
              >
               
                {isDatasetDetailMode 
                  ? `Performance On Specific Dataset Trained on ${training === 'NSD' ? 'NSD1000' : 'Murty185'} `
                  : (training === 'Murty185 VS NSD1000' 
                      ? 'Murty185 vs NSD1000 Performance Comparison' 
                      : `${region[0]?.toUpperCase()} Performance (Trained on ${training === 'NSD' ? 'NSD1000' : 'Murty185'})`)
                }
              </h3>

              {/* content */}
              <div
                style={{
                  flex: 1,
                 overflowY: isDatasetDetailMode ? "auto" : "hidden",
                
                  overflowX: isDatasetDetailMode ? "hidden" : "auto",
                  position: 'relative',
                  display: 'flex', // 始终使用 flex 布局以支持多图横向排列
                  flexDirection: isDatasetDetailMode ? 'column' : 'row',
                  justifyContent: training === 'Murty185 VS NSD1000' ? 'center' : 'flex-start',
                  gap: isDatasetDetailMode ? 0 : 24, 
                  paddingBottom: 10
                  
                }}
              >
                {/* scatter plot */}
                {(training === 'Murty185 VS NSD1000') &&  activeQuestion === "q1" && (
                  <ScatterMurtyVsNsd
                    murtyData={murtyData}
                    nsdData={nsdData}
                    roi={region[0] === 'Across Regions' ? 'Overall' : region[0]}
                    dataset={dataset} // dataset list filter
                    chartType={chartType}
                    showOverlay={true}
                    onModelClick={(m: string) => setSelectedModel(m)}
                  />
                )}

                 {activeQuestion === "q2" && (
                  <ScatterGapCeiling 
                    nsdData={ROI_DATASET_NSD} 
                    murtyData={ROI_DATASET_Murty} 
                    ceilingData={Ceiling} 
                    // 确保 region[0] 存在，否则传空字符串
                    roi={""} 
                    // 散点图通常显示所有数据集，如果只想看选中的，传 dataset[0]
                    dataset={""} 
                    training={training}
                  />
                )}

                

              {isDatasetDetailMode && dataset.map((dsName) => (
                      <React.Fragment key={dsName}>
                        {region.map((roiValue) => (
                          <div 
                            key={`${dsName}-${roiValue}`} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              width: '100%', 
                              position: 'relative' 
                            }}
                          >
                            {/* ✨ 纵向吸顶标题 */}
                            <div style={{ 
                              position: 'sticky',
                              top: 0,           // 向下滚动时固定在顶部
                              zIndex: 10,
                              background: '#fafafa', 
                              padding: '10px 0',
                              borderBottom: '2px solid #1890ff',
                              marginBottom: 15,
                              fontWeight: 'bold',
                              color: '#1890ff',
                              fontSize: '14px',
                              textTransform: 'uppercase'
                            }}>
                              {dsName} —— {roiValue === 'Across Regions' ? 'Overall' : roiValue}
                            </div>

                            {/* 柱状图组件 */}
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                              <BarChartDetail
                                data={getDataByTraining(training)}
                                roi={roiValue === 'Across Regions' ? 'Overall' : roiValue}
                                dataset={dsName}
                                ceiling={Ceiling}
                                rank={rank}
                                yLabel={yLabel}
                                onModelClick={(m: string | null) => setSelectedModel(m)}
                              />
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
        
                

                {pageView === "rank" &&  training !== 'Murty185 VS NSD1000' &&  dataset.length === 0 && region.map((roiValue, index) => (
                <div 
                  key={roiValue} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    // 如果是第一个（带 Y 轴标签），宽度设宽一点，后面不带标签的设窄一点
                    minWidth: index === 0 ? 450 : 350, 
                    flexShrink: 0 
                  }}
                >
                  {/* 区域小标题 */}
                  <div style={{ 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    marginBottom: 12, 
                    fontSize: '14px', 
                    color: '#555',
                    textTransform: 'uppercase',
                    background: '#eee',
                    padding: '4px 0',
                    borderRadius: '4px'
                  }}>
                    {roiValue === 'Across Regions' ? 'Across Regions' : roiValue}
                  </div>

                  <HeatmapDetail
                    data={getDataByTraining(training)} 
                    roi={roiValue === 'Across Regions' ? 'Overall' : roiValue}
                    dataset={dataset[0] || ''}
                    rank={rank}
                    selectedModel={selectedModel}
                    onModelClick={(m: string) => setSelectedModel(m)}
                    onScrollUpdate={(range: {start: number, end: number}) => setVisibleRange(range)}
                    // ✨ 新增 Props：控制是否显示左侧模型名称
                    showYAxis={index === 0} 
                    isMultiRegion={region.length > 1}
                  />
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScoreboardPageNew;


    