// RegionSelector.jsx
// import React from 'react';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';
// import { REGION_OPTIONS } from './constants';

// const RegionSelector = ({ region, setRegion }) => (
//   <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
//     <FormLabel 
//       id="region-radio-buttons-group-label"
//       sx={{
//         textAlign: 'left',
//         color: 'black',
//       }}
//     >
//       Select a Region of Interest
//     </FormLabel>
//     <RadioGroup
//       row
//       aria-labelledby="region-radio-buttons-group-label"
//       name="region-radio-buttons-group"
//       value={region}
//       onChange={(e) => setRegion(e.target.value)}
//     >
//       {REGION_OPTIONS.map((option) => (
//         <FormControlLabel 
//           key={option.value} 
//           value={option.value} 
//           control={<Radio />} 
//           label={option.label} 
//         />
//       ))}
//     </RadioGroup>
//   </FormControl>
// );

// export default RegionSelector;

// RegionSelector.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { REGION_OPTIONS } from './constants';

const RegionSelector = ({ region, setRegion }) => (
  <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
    <FormLabel
      id="region-buttons-group-label"
      sx={{
        textAlign: 'left',
        color: 'black',
        marginBottom: 1,
      }}
    >
      Select a Region of Interest
    </FormLabel>
    <ButtonGroup 
      aria-labelledby="region-buttons-group-label"
      fullWidth
    >
      {REGION_OPTIONS.map((option) => (
        <Button
          key={option.value}
          onClick={() => !option.disabled && setRegion(option.value)}
          variant={region === option.value ? "contained" : "outlined"}
          disabled={option.disabled}
          sx={{
            "&.Mui-disabled": {
              backgroundColor: "#f3f3f3",
              color: "#c0c0c0"
            }
          }}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  </FormControl>
);

export default RegionSelector;

