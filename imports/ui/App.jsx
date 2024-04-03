import React from 'react';
import { Canvas } from './Canvas';
import 'bulma/css/bulma.css';

const canvasWidth = 400;
const canvasHeight = 200;

export const App = () => {
  return (
    <div>
      <center>
        <div className='mt-4 is-family-code is-size-1'>
          <h1>Ping Pong</h1>
        </div>
        <Canvas
            className='mt-4'
            id='canvas'
            width={canvasWidth}
            height={canvasHeight}
        />
      </center>
    </div>
  );
}