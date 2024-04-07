import { Meteor } from 'meteor/meteor';

const paddleHeight = 90;
const boardWidth = 400;
const boardHeight = 160;

function getWinner(game) {
    return game.leftPaddle.score >= 10? 
                game.leftPaddle.player :
                (game.rightPaddle.score >= 10 ? game.rightPaddle.player : null); 
}

const changeDirectionOnCollide = (ball) => {
    if (ball.top <= 0)
        ball.speed.dt = 1;
    if (ball.top >= boardHeight)
        ball.speed.dt = -1;
    if (ball.right <= 0 - Math.floor(boardWidth/2))
        ball.speed.dr = -ball.speed.dr;
    if (ball.right >= Math.floor(boardWidth/2))
        ball.speed.dr = -2;
    return ball;
}

const collidesPaddle = () => {
    if (ball.right >= Math.floor(boardWidth/2) &&
        ball.top >= leftPaddlePos &&
        ball.top <= leftPaddlePos + paddleHeight ) {
        incScore();
    }
    if (ball.right <= (0 - Math.floor(boardWidth/2)) &&
        ball.top >= rightPaddlePos &&
        ball.top <= rightPaddlePos + paddleHeight ) {
        incScore();
    }
}

const moveBall = (ball) => {
    let newBall = changeDirectionOnCollide(ball);
    newBall.top += newBall.speed.dt;
    newBall.right += newBall.speed.dr;
    return newBall
}