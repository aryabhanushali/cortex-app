import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

export default function LinearIndeterminate() {
  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress
        variant="indeterminate"
        sx={{
          backgroundColor: "transparent",

          "& .MuiLinearProgress-bar1Indeterminate": {
            backgroundColor: "transparent",
            backgroundImage: "var(--highlight-color-button)",
          },

          "& .MuiLinearProgress-bar2Indeterminate": {
            backgroundColor: "transparent",
            backgroundImage: "var(--highlight-color-button)",
            opacity: 1, 
          },
        }}
      />
    </Box>
  );
}