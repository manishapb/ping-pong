import React, { useRef, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

const paddleHeight = 90;
const boardWidth = 400;
const boardHeight = 160;
const UP = -5;
const DOWN = 5;

const Paddle = ({ position, id })=> (
    <div className='paddle has-background-white' id={id}
        style={{position: 'relative', top: position}}>
    </div>
)

const Ball = ({ ball }) => (
    <figure className='image is-16x16' 
        style={{position: 'relative', top: ball.top, right: ball.right}}>
        <img className='is-rounded has-background-white' 
                src="https://bulma.io/assets/images/placeholders/256x256.png"/>
    </figure>
)


export const Game = ( { game } ) => {
    const player = Meteor.userId();

    const movePaddleDown = (e)=> {
        e.preventDefault();
        if (game.leftPaddle.position <= boardHeight - paddleHeight/2 &&
            game.leftPaddle.player === player) {
                updatePaddle(DOWN);
        }
        else if (game.rightPaddle.position <= boardHeight - paddleHeight/2 &&
            game.rightPaddle.player === player) {
                updatePaddle(DOWN);
        }
    }

    const movePaddleUp = (e) => {
        e.preventDefault();
        if (game.leftPaddle.position >= 0 &&
            game.leftPaddle.player === player) {
                updatePaddle(UP);
            }
        else if (game.rightPaddle.position >= 0 && 
            game.rightPaddle.player === player) {
                updatePaddle(UP);
        }
    }

    const movePaddle = (e) => {
        e.preventDefault();
        if (game.state === 'ended')
            return;
        if (e.code === 'ArrowUp')
            movePaddleUp(e);
        else if (e.code === 'ArrowDown')
            movePaddleDown(e);
    }

    const endGame = () => {
        Meteor.call('games.end', game._id, (err, _)=>{
            if(err)
                alert(err);
        });
    }

    const updatePaddle = (direction) => {
        Meteor.call('games.updatePaddle', game._id, direction, ()=> {})
    }

    const isGameActive = () => {
        return game && !(game.state === 'ended' || game.state === 'waiting')
    } 

    // useEffect(update, []);

    return (
    <div className='container mt-4'>
       <div className='box game-board'
            tabIndex="1"
            onKeyDown={movePaddle}>
            <div className='is-pulled-left'>
                <Paddle position={game.leftPaddle.position} />
            </div>
            <div className='border-left'>
            </div>
            {isGameActive?
                <Ball ball={game.ball} /> : 
                <></>}
            <div className='is-pulled-right'>
                <Paddle position={game.rightPaddle.position} />
            </div>
       </div>
       <div className='container is-family-code is-centered is-size-4 has-text-weight-bold'>
           {game.winner? 
                <div>Game over
                    <div> Winner: 
                        {game.winner === player? "You win!" : "You Lose!"}
                    </div>
                </div> :
                <div> 
                    <div>Game id: {game._id} </div>
                    <div className='is-pulled-left ml-6'> {game.leftPaddle.score}</div>
                    <div className='is-pulled-right mr-6'> {game.rightPaddle.score}</div>
                </div>
            }
            <div className='is-size-6 mt-4'>
                <br></br>
                <button onClick={endGame}>End Game</button>
            </div>
       </div>
    </div>);
}