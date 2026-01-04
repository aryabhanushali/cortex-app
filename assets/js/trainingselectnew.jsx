import React from 'react';
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
import { TRAINING_OPTIONS, TRAINING_OPTIONS_VS } from './constants-scoreboard';

// 增加了 pageView prop，并保留了 dataset
const TrainingSelectNew = ({ training, setTraining, dataset, pageView }) => {
  
  // 判断是否为 rank 模式
  const isRankMode = pageView === 'rank';
  // 根据模式选择对应的常量选项
  const options = isRankMode ? TRAINING_OPTIONS : TRAINING_OPTIONS_VS;

  const handleChange = (value) => {
    // 如果不是 rank 模式（即对比模式），直接返回，不允许修改
    if (!isRankMode) return;
    setTraining((prev) => (prev === value ? '' : value));
  };

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
        <Typography sx={{ fontWeight: 'bold', color: 'black' }}>Training Dataset</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ pl: 2 }}>
        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <FormGroup>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    // 如果不是 rank 模式，强制设为选中状态
                    checked={!isRankMode ? true : training === option.value}
                    onChange={() => handleChange(option.value)}
                    // 如果不是 rank 模式，禁用交互（变灰不可点）
                    disabled={!isRankMode}
                    sx={{
                      '&.Mui-checked': { color: '#5562d6ff' },
                      // 确保禁用状态下勾选颜色依然明显，不至于太灰看不清
                      '&.Mui-disabled': { 
                        color: !isRankMode ? '#5562d6ff' : 'inherit',
                        opacity: !isRankMode ? 0.8 : 1 
                      },
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

export default TrainingSelectNew;