import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import constants from '/imports/constants';

console.log("constants : ",constants.screenHeightRatio);

const screenWidth = globalThis.innerWidth;
const screenHeight = constants.screenHeightRatio * screenWidth;

const boardWidth = constants.boardWidthRatio * screenWidth;
const boardHeight = constants.boardHeightRatio * screenHeight;
const boardX = constants.boardXYRatio * screenWidth;
const boardY = constants.boardXYRatio * screenHeight;

const paddleWidth = constants.padWidthRatio * boardWidth;
const paddleHeight = constants.padHeightRatio * boardHeight;
const ballWidth = constants.ballXRatio * boardWidth;
const ballHeight = ballWidth;


const keysPressed = {};
addEventListener('keydown', e => {
    keysPressed[e.key] = true;
});
addEventListener('keyup', e => {
    delete keysPressed[e.key];
});

const endGame = (gameId, logout) => {
    Meteor.call('games.end', gameId, err => {
        logout();
        if (err)
            alert(err);
    });
}

const Paddle = ({ id, x, y }) => (
    <div
        id={id}
        style={{
            background: 'white',
            position: 'absolute',
            borderRadius: "5%",
            left: x,
            top: y,
            width: paddleWidth,
            height: paddleHeight
        }}
    >
    </div>
)

const Ball = ({ x, y }) => (
    <div
        id='ball'
        style={{
            position: 'absolute',
            background: 'white',
            position: 'absolute',
            borderRadius: "50%",
            left: x,
            top: y,
            width: ballWidth,
            height: ballHeight
        }}
    >
    </div>
)

const Board = ({ lPad, rPad, ball }) => (
    <div
        id='board'
        style={{
            position: 'absolute',
            border: "1px solid white",
            left: boardX,
            top: boardY,
            width: boardWidth,
            height: boardHeight
        }}
    >
        <div
            style={{
                position: 'absolute',
                left: 0.5 * boardWidth,
                top: 0,
                width: 1,
                height: 1 * boardHeight,
                border: '1px dashed white'
            }}
        >
        </div>
        <div
            style={{
                position: 'absolute',
                left: 0.2 * boardWidth,
                top: 0.05 * boardHeight,
                fontSize: 0.5 * boardHeight
            }}
        >
            {lPad.score}
        </div>
        <div
            style={{
                position: 'absolute',
                left: 0.7 * boardWidth,
                top: 0.05 * boardHeight,
                fontSize: 0.5 * boardHeight
            }}
        >
            {rPad.score}
        </div>

        <Paddle
            id="leftPaddle"
            x={lPad.x * boardWidth}
            y={lPad.y * boardHeight}
        />
        <Paddle
            id="rightPaddle"
            x={rPad.x * boardWidth}
            y={rPad.y * boardHeight}
        />

        <Ball
            x={ball.x * boardWidth}
            y={ball.y * boardHeight}
        />
    </div>
)

export const Game = ({ user, logout, game }) => {
    const player = game.player1 === user._id ? 1 : 2;
    const pad = player === 1 ? 'lPad' : 'rPad';

    useEffect(() => {
        let f = () => {
            if (keysPressed['ArrowDown']
                && game.board[pad].velY <= 0) {
                Meteor.call('games.move', 'down', game._id, user._id, player);
            } else if (keysPressed['ArrowUp']
                && game.board[pad].velY >= 0) {
                Meteor.call('games.move', 'up', game._id, user._id, player);
            } else if (!keysPressed['ArrowDown']
                && !keysPressed['ArrowUp']
                && game.board[pad].velY !== 0) {
                Meteor.call('games.move', 'stop', game._id, user._id, player);
            }
        };
        let i = setInterval(f, 200);
        f();
        return () => clearInterval(i);
    });

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    left: boardX,
                    top: boardY + boardHeight + 5
                }}
            >
                <p>
                    <b>Game ID: </b> {game._id}
                </p>
                <p>
                    <b>Game state: </b> {game.state}
                </p>
                <p>
                    <b>You are: </b> Player {player}
                </p>
                {game.winner ?
                    (game.winner === user._id ?
                        <b>You Win!</b>
                        : <b>You Lose! </b>)
                    : <></>
                }
                <p>
                    <button
                        className='button'
                        onClick={() => endGame(game._id, logout)}
                    >
                        End Game
                    </button>
                </p>
            </div>
            <Board
                lPad={game.board.lPad}
                rPad={game.board.rPad}
                ball={game.board.ball}
            />
        </>
    );
}