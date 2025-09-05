// RegionSelector.jsx

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import React, { useState, useEffect } from 'react';

import { ROI_OPTIONS, OVERALL_OPTION, REGION_OPTIONS } from './constants-scoreboard';
import { all } from 'axios';

const ROISelect = ({ region, setRegion, dataset,setDataset, allowToggle, mode,training }) => {
   const [effectiveToggle, setEffectiveToggle] = useState(allowToggle);

 
  const isEnabled = (option) => {
    // === 互斥逻辑 ===
    if((dataset === 'bold_5000'|| dataset ==='bonner_2021') && (option.value === "ffa" || option.value === "eba")) return false;
    if((dataset === 'kingbaker_2019' || dataset === 'wardle_2020') && ( option.value === "eba")) return false;
    
    if (mode == 1) {
       if (
        training !== "" &&
        (dataset === "bonner_2021" || dataset === "bold_5000")
      ) {
        return option.value === "ppa"; // 只允许 PPA
      }

    }
   
    return true;
  };

  // RegionSelector.jsx
  useEffect(() => {
    if (
      mode === 1 &&
      training !== "" &&
      (dataset === "bonner_2021" || dataset === "bold_5000")
    ) {
      // ✅ 只有当 region 还没设置时，才自动绑定一次 PPA
      if (region === "") {
        setRegion("ppa");
      }
      setEffectiveToggle(true); // 允许 toggle
    } else {
      setEffectiveToggle(allowToggle);
    }
  }, [training, dataset, setRegion, allowToggle]); 

  const renderButtons = (options) =>
    options.map((option) => (
      <Button
        key={option.value}
        // onClick={() => {
        //   if (!isEnabled(option)) return;
        //   if (effectiveToggle) {
        //     setRegion((prev) => (prev === option.value ? "" : option.value));
        //   } else {
        //     setRegion(option.value);
        //   }
        // }}
        onClick={() => {
          if (!isEnabled(option)) return;
          if (effectiveToggle) {
            if (region === option.value) {
              // 🚀 只有在 mode == 1 且 dataset 是 bonner/bold 的时候，点掉 PPA → 清空 dataset
              if (
                mode === 1 &&
                (dataset === "bonner_2021" || dataset === "bold_5000") &&
                option.value === "ppa"
              ) {
                setRegion("");
                setDataset(""); // ✅ 清掉 dataset
              } else {
                setRegion("");
              }
            } else {
              setRegion(option.value);
            }
          } else {
            setRegion(option.value);
          }
        }}
        variant={region === option.value ? "contained" : "outlined"}
        disabled={!isEnabled(option)}
        sx={{
          "&.Mui-disabled": {
            backgroundColor: "#f3f3f3",
            color: "#c0c0c0",
          },
        }}
      >
        {option.label}
      </Button>
    ));

  return (
    <FormControl sx={{ minWidth: 120 }} fullWidth>
      <FormLabel
        id="region-buttons-group-label"
        sx={{
          textAlign: "left",
          color: "black",
          marginBottom: 1,
        }}
      >
        Region of Interest:
      </FormLabel>
      <ButtonGroup fullWidth>
        {mode === 1 && renderButtons(ROI_OPTIONS)}
        {mode === 2 && renderButtons(ROI_OPTIONS)}
        {mode === 3 && renderButtons(ROI_OPTIONS)}
      </ButtonGroup>
    </FormControl>
  );
};

export default ROISelect;
