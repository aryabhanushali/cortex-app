// import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControl,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ROI_OPTIONS } from './constants-scoreboard';

const ROISelectNew = ({ region, setRegion, dataset, setDataset, allowToggle, mode, training }) => {
  // 1. 定义常量以便逻辑判断 (对应 constants 中的 value)
  const ACROSS_VAL = 'Across Regions';
  const SPECIFIC_ROIS = ['ppa', 'ffa', 'eba'];

  // ✅ 检查当前选项是否允许选择 (保持你原有的逻辑)
  const isEnabled = (option) => {
    if ((dataset === 'bold_5000' || dataset === 'bonner_2021') && (option.value === 'ffa' || option.value === 'eba'))
      return false;
    if ((dataset === 'kingbaker_2019' || dataset === 'wardle_2020') && option.value === 'eba')
      return false;
    return true;
  };

  // ✅ 核心互斥逻辑
  const handleChange = (value) => {
    if (!isEnabled({ value })) return;

    setRegion((prev) => {
      // 确保 prev 始终是数组
      const current = Array.isArray(prev) ? prev : (prev ? [prev] : []);
      const isSelected = current.includes(value);

      // --- 情况 A: 点击的是 "Across Regions" ---
      if (value === ACROSS_VAL) {
        if (isSelected) {
          // 如果已经是选中状态，点击则取消选中
          return current.filter((v) => v !== value);
        } else {
          // 如果新选中 Across Regions：清空所有具体的 ROI，只选中它自己
          return [value];
        }
      }

      // --- 情况 B: 点击的是具体的 ROI (PPA/FFA/EBA) ---
      if (SPECIFIC_ROIS.includes(value)) {
        if (isSelected) {
          // 已选中，点击则移除
          return current.filter((v) => v !== value);
        } else {
          // 新选中一个具体 ROI：自动移除 "Across Regions"，并保留已选的其他具体 ROI
          const filtered = current.filter((v) => v !== ACROSS_VAL);
          return [...filtered, value];
        }
      }

      // --- 情况 C: 其他情况 (兜底) ---
      return isSelected 
        ? current.filter((v) => v !== value) 
        : [...current, value];
    });
  };

  // ✅ 判断当前项是否被选中
  const isChecked = (value) => Array.isArray(region) && region.includes(value);

  return (
    <Accordion defaultExpanded disableGutters sx={{ bgcolor: 'transparent' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
        sx={{
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          '&.Mui-expanded': { bgcolor: '#eaeaea' },
          minHeight: 40,
          px: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 'bold', color: 'black' }}>Region of Interest</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ pl: 2 }}>
        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <FormGroup sx={{ mt: 0.5 }}>
            {ROI_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={isChecked(option.value)}
                    onChange={() => handleChange(option.value)}
                    disabled={!isEnabled(option)}
                    sx={{
                      '&.Mui-checked': { color: '#e8de70ff' },
                      '&.Mui-disabled': { color: '#b0b0b0' },
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
};

export default ROISelectNew;