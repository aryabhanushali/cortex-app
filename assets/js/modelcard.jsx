import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ModelCard = ({ modelName, modelType, description }) => {
  return (
    <Box sx={{ minWidth: 250, boxShadow: 3, borderRadius: 2 }}>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Model Info Card
          </Typography>
          <Typography variant="h5" component="div">
            {modelName}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {modelType}
          </Typography>
          <Typography variant="body2">
            {description}
          </Typography>
        </CardContent>
        {/* <CardActions>
          <Button size="small">View Details</Button>
        </CardActions> */}
      </Card>
    </Box>
  );
};

export default ModelCard;
