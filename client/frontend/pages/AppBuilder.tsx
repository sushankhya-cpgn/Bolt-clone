import Navbar from "../components/Header/Navbar";
import OutlinedCard from "../components/Card/card"
import React from 'react';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Alert, AlertTitle, Box, Grid, TextareaAutosize } from "@mui/material";


const card = (
  <React.Fragment>
    <CardContent >
    
        <Typography gutterBottom color="white" variant="body1">
            Build a todoApp
        </Typography>
          <Alert variant="filled" severity="warning"  sx={{color:'warning.main',borderRadius:'10px', bgcolor:'rgb(59, 49, 35)'}}>
          <Grid container spacing={2}>
            <Grid size={8}>
         
          <AlertTitle sx={{color:'warning.main', fontWeight:'bold'}}>Error</AlertTitle>
          <Typography  color="grey" variant="subtitle2">You cancelled this message</Typography>
       
         
        </Grid>
         <Grid size={4}>
            <Button  variant="contained" color="warning" size="small">Retry</Button>
        </Grid>
        </Grid>
        </Alert>
       
  </CardContent>
  </React.Fragment>
);


function AppBuilder({ height = "100vh" }) {
  return (
    <Box display="flex" flexDirection="column" height={height} bgcolor='black'>
      <Navbar />

      {/* Main section */}
      <Box display="flex" height={height}  gap={2} mt={2}>
        {/* Left section */}
        <Box  display="flex"  flexDirection='column'  sx={{width:'40%'}}>
            <Box display="flex" justifyContent='end'>
          <OutlinedCard
            sx={{
              borderRadius: "8px",
              width: "340px",
              backgroundColor: "rgb(38, 38, 38)",
            }} card={card}
          >
          
          </OutlinedCard>
          </Box>
            <Box display="flex" sx={{height:'100%',width:'100%',margin:"12px",position:"relative"}} alignItems="end" >
     <TextareaAutosize
    minRows={4}
    maxRows={12}
    aria-label="maximum height"
    placeholder="Type your text..."
    defaultValue="Lorem ipsum dolor sit amet..."
    style={{
      width: '100%',      // ensures it fills the parent
      padding: '12px',     // optional for spacing
      boxSizing: 'border-box', // ensures padding doesn't break width
      borderRadius: '4px',
      backgroundColor: 'rgb(38, 38, 38)',
      color: 'white',
      border: '1px solid grey'
    }}
  />

  <Button sx={{position:'absolute', right:0}}>scn</Button>
        </Box>

        </Box>

      
        {/* Middle section */}
        <Box  display="flex" alignItems="center" justifyContent="center">
          <Typography variant="body1" color="white">
            slkdn
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
export default AppBuilder;