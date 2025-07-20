'use client';
import Link from 'next/link';
import * as React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Grid } from '@mui/material';

const Count = () => {
  return (
    <>
      <div id="intr" style={{ marginBottom: '2rem' }}>
        <p>
          Every year, there is a global event called{' '}
          <Link href="https://www.ipho-new.org/" target="_blank" style={{color: 'orange'}}>
            International Physics Olympiad
          </Link>
          , which is a physics festival for high school students around the world. It is usually for a week, where each country
          sends their own national team to participate in this event and compete for the medal. On this page, you can find all
          information about countries with a physics national team website, with a brief introduction.
        </p>
      </div>

      <Grid container spacing={4} justifyContent="center">
        {/* First Card */}
        <Grid item xs={12} sm={8} md={6}>
          <Card
            sx={{
              maxWidth: 500, 
              height: 500, 
              backgroundColor: '#001F70', 
              color: '#FFFFFF', 
              border: '1px solid #000020', 
              boxShadow: '0px 4px 10px rgba(0, 0, 139, 0.5)', 
              marginLeft: '130px',
            }}
          >
            <CardMedia
              component="img"
              height="200" 
              image="https://www.worldometers.info/img/flags/small/tn_ch-flag.gif"
              alt="Sample"
              sx={{
                padding: '0.5rem 1rem',
                objectFit: 'contain',
                backgroundColor: '#000033', 
                transition: 'transform 0.3s, box-shadow 0.3s', 
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 20px rgba(0, 0, 139, 0.5)', 
                },
              }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
               China
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFD700' }}>
                The Chinese National Team is one of the most successful teams in the history of the International Physics Olympiad, consistently winning numerous gold medals and achieving high rankings. The team is known for its rigorous training and strong emphasis on problem-solving skills.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" sx={{ color: '#FFD700' }}><Link href="https://ipho-unofficial.org/countries/CHN/individual" target="_blank" style={{color: 'inherit', textDecoration: 'none'}}>
                Learn More</Link>
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Second Card */}
        <Grid item xs={12} sm={8} md={6}>
          <Card
            sx={{
              maxWidth: 500, 
              height: 500, 
              backgroundColor: '#001F70',
              color: '#FFFFFF', 
              border: '1px solid #000020',
              boxShadow: '0px 4px 10px rgba(0, 0, 139, 0.5)', 
              marginLeft: '130px',
            }}
          >
            <CardMedia
              component="img"
              height="200" 
              image="https://www.worldometers.info/img/flags/us-flag.gif"
              alt="Sample"
              sx={{
                padding: '0.5rem 1rem',
                objectFit: 'contain',
                backgroundColor: '#000033', 
                transition: 'transform 0.3s, box-shadow 0.3s', 
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0px 8px 20px rgba(0, 0, 139, 0.5)',
                },
              }}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                United States
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFD700' }}>
                The national team of the United States is known for its strong performance in the International Physics Olympiad.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" sx={{ color: '#FFD700' }}><Link href="https://aapt.org/physicsteam/2024/index.cfm" target="_blank" style={{color: 'inherit', textDecoration: 'none'}}>
                Learn More</Link> 
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Count;
