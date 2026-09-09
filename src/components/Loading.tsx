import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from '../assets/loading.json';

const Loading = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh',
      width: '100%'
    }}>
      <Player
        autoplay
        loop
        src={loadingAnimation}
        style={{ height: '300px', width: '300px' }}
      />
    </div>
  );
};

export default Loading;
