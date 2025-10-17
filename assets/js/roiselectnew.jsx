import React, { useState, useEffect } from 'react';
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
  const [effectiveToggle, setEffectiveToggle] = useState(allowToggle);

  useEffect(() => {
    setEffectiveToggle(allowToggle);
  }, [allowToggle]);

  // ✅ 检查当前选项是否允许选择
  const isEnabled = (option) => {
    if ((dataset === 'bold_5000' || dataset === 'bonner_2021') && (option.value === 'ffa' || option.value === 'eba'))
      return false;
    if ((dataset === 'kingbaker_2019' || dataset === 'wardle_2020') && option.value === 'eba')
      return false;
    return true;
  };

  // ✅ 点击时添加或移除该选项
  const handleChange = (value) => {
    if (!isEnabled({ value })) return;

    setRegion((prev) => {
      if (Array.isArray(prev)) {
        // 已选则移除
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        } else {
          // 未选则添加
          return [...prev, value];
        }
      } else {
        // 若是字符串（初始化），转成数组
        return [value];
      }
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
                    checked={isChecked(option.value)} // ✅ 多选状态判断
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
