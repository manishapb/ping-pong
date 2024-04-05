import React, { useRef, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

const paddleHeight = 90;
const boardWidth = 400;
const boardHeight = 160;

const initialball = { t: 0, r:0, speed: {dt: 1, dr: 2} }


const Paddle = ({ position, id })=> (
    <div className='paddle has-background-white' id={id}
        style={{position: 'relative', top: position}}>
    </div>
)

const Ball = ({ incScore, leftPaddlePos, rightPaddlePos }) => {
    const [ ball, setBall ] = useState(initialball);
    const [ ballTop, setBallTop ] = useState(initialball.t);
    const [ ballRight, setBallRight ] = useState(initialball.r);
    
    const collidesWall = () => {
        let newBall = ball;
        if (newBall.t <= 0)
            newBall.speed.dt = 1;
        if (newBall.t >= boardHeight)
            newBall.speed.dt = -1;
        if (newBall.r <= 0 - Math.floor(boardWidth/2))
            newBall.speed.dr = -newBall.speed.dr;
        if (newBall.r >= Math.floor(boardWidth/2))
            newBall.speed.dr = -2;
        return newBall;
    }

    const collidesPaddle = () => {
        let newBall = ball;
        if (newBall.r >= Math.floor(boardWidth/2) &&
            newBall.t >= leftPaddlePos &&
            newBall.t <= leftPaddlePos + paddleHeight ) {
            incScore();
        }
        if (newBall.r <= (0 - Math.floor(boardWidth/2)) &&
            newBall.t >= rightPaddlePos &&
            newBall.t <= rightPaddlePos + paddleHeight ) {
            incScore();
        }
    }

    const changeDirectionOnCollide = () => {
        let newBall = collidesWall();
        collidesPaddle();
        return newBall;
    }

    const moveBall = () => {
        let newBall = changeDirectionOnCollide();
        newBall.t += newBall.speed.dt;
        newBall.r += newBall.speed.dr;
        setBallTop(newBall.t);
        setBallRight(newBall.r);
        setBall(newBall);        
    }

    const interval = setInterval(() => moveBall(), 1000);

    return (
    <figure className='image is-16x16' 
        style={{position: 'relative', top: ballTop, right: ballRight}}>
        <img className='is-rounded has-background-white' 
                src="https://bulma.io/assets/images/placeholders/256x256.png"/>
    </figure>);
}

export const Game = ( { game } ) => {
    // const [ winner, setWinner ] = useState(null);
    const [ leftPaddlePos, setLeftPaddlePos] = useState(50);
    const [ rightPaddlePos, setRightPaddlePos] = useState(80);
    const player = Meteor.userId();

    const movePaddle = (e) => {
        e.preventDefault();
        if (e.code === 'ArrowUp')
            movePaddleUp(e);
        else if (e.code === 'ArrowDown')
            movePaddleDown(e);
    }

    const movePaddleDown = (e)=> {
        e.preventDefault();
        if (game.leftPaddle.player === player &&
            leftPaddlePos <= boardHeight - paddleHeight/2) {
            let newPos = leftPaddlePos + 10;
            setLeftPaddlePos(newPos);
        }
        if (game.rightPaddle.player === player &&
            rightPaddlePos <= boardHeight - paddleHeight/2+10) {
            let newPos = rightPaddlePos + 10;
            setRightPaddlePos(newPos);
        }
    }

    const movePaddleUp = (e) => {
        e.preventDefault();
        if (game.leftPaddle.player === player &&
                leftPaddlePos >= 0) {
            let newPos = leftPaddlePos -10;
            setLeftPaddlePos(newPos);
        }
        if (game.rightPaddle.player === player &&
                rightPaddlePos >= 0) {
            let newPos = rightPaddlePos - 10;
            setRightPaddlePos(newPos);
        }
    }

    const updateScore = () => {
        Meteor.call('games.update', game._id, player, (err, _)=> {
            if(err)
                alert(err);
        })
    }



    const endGame = () => {
        Meteor.call('games.end', game._id, (err, _)=>{
            if(err)
                alert(err);
        });
    }

    return (
    <div className='container mt-4'>
       <div className='box game-board'
            tabIndex="1"
            onKeyDown={movePaddle}>
          <div className='is-pulled-left'>
            <Paddle position={leftPaddlePos} />
          </div>
          {game && (game.state === 'ended' || game.state === 'waiting')? 
            <></> :
            <Ball incScore={updateScore}
                leftPaddlePos={leftPaddlePos}
                rightPaddlePos={rightPaddlePos} />}
          <div className='is-pulled-right'>
            <Paddle position={rightPaddlePos} />
          </div>
       </div>
       <div className='container is-family-code'>
           {game.winner? 
                <div className='is-size-4 has-text-weight-bold'>Game over
                    <div> Winner: {game.winner} </div>
                </div> :
                <div> 
                    <div>Game id: {game._id} </div>
                    <div>Current Score </div>
                    <div>Left : {game.leftPaddle.score}</div>
                    <div>Right: {game.rightPaddle.score}</div>
                </div>}
            <div> <button onClick={endGame}>End Game</button></div>
       </div>
    </div>);
}