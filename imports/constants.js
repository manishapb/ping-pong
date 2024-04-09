// UI constants
export const screenHeightRatio = 0.4

export const boardWidthRatio = 0.8;
export const boardHeightRatio = 0.7;
export const boardXYRatio = 0.1;

export const padWidthRatio = 0.01;
export const padHeightRatio = 0.25;

export const ballXRatio = 0.02;


// backend constants
export const maxScore = 5;
export const gameAliveTimeout = 5 * 60 * 1000;
export const FPS = 60;
export const gameInterval = 1000 / FPS;

export const boardWidth = 1;
export const boardHeight = 1;

export const paddleWidth = 0.01;
export const paddleHeight = 0.25;
export const paddleVel = 0.02;
export const lPadX = 0;
export const minPadY = 0;
export const maxPadY = boardHeight - paddleHeight;

export const ballWidth = 0.02;
export const ballHeight = ballWidth / 0.32;
export const initBallX = (boardWidth - ballWidth)/2;
export const initBallY = (boardHeight - ballHeight)/2;
export const minBallX = 0;
export const maxBallX = 0.98;
