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
import { TRAINING_OPTIONS } from './constants-scoreboard';

const TrainingSelectNew = ({ training, setTraining, dataset }) => {
  const handleChange = (value) => {
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
            {TRAINING_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={training === option.value}
                    onChange={() => handleChange(option.value)}
                    sx={{
                      '&.Mui-checked': { color: '#5562d6ff' },
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
