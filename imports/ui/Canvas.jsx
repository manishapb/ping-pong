import React, { useRef, useEffect, useState } from 'react';

const paddleHeight = 50;
const paddleWidth = 4;

const canvasWidth = 400;
const canvasHeight = 200;
const initialGame = {
    state : null,
    leftPaddle: { 
        player: 'abc',
        x: paddleWidth,
        y: Math.floor(canvasHeight/2),
        score: 0
    },
    rightPaddle: {
        player: 'cdb',
        x: canvasWidth - paddleWidth,
        y: Math.floor(canvasHeight/2) - paddleHeight,
        score: 0
    }
}

const initialball = { x: 350, y: 60, speed: {dx: 4, dy: 1} }

export const Canvas = props => {
    const canvasRef = useRef(null);
    const [game, setGame] = useState(initialGame);
    const [ball, setBall] = useState(initialball);
    const [ winner, setWinner ] = useState(null);
    const [ frameId, setFrameId ] = useState(null);

    const drawBoard = ctx => {
        ctx.fillStyle = '#000000';
        const partition = {
          'from': [ Math.floor(canvasWidth/2), 0],
          'to'  : [ Math.floor(canvasWidth/2), canvasHeight]
        };
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        // draw partition
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.moveTo(...partition.from)
        ctx.lineTo(...partition.to)
        ctx.strokeStyle = "white";
        ctx.stroke()
      }

    const drawRightPaddle = (ctx) => {
        ctx.lineWidth = paddleWidth;
        ctx.setLineDash([]);
        ctx.moveTo(game.rightPaddle.x, game.rightPaddle.y);
        ctx.lineTo(game.rightPaddle.x, game.rightPaddle.y + paddleHeight);
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    const drawLeftPaddle = (ctx) => {        
        ctx.lineWidth = paddleWidth;
        ctx.setLineDash([]);
        ctx.moveTo(game.leftPaddle.x, game.leftPaddle.y);
        ctx.lineTo(game.leftPaddle.x, game.leftPaddle.y + paddleHeight);
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    const drawBall = (ctx) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "orange";
        ctx.fill();
    }

    const drawGame = () => {
        const currentCanvas = canvasRef.current;
        const ctx = currentCanvas.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawBoard(ctx);
        drawRightPaddle(ctx);
        drawLeftPaddle(ctx);
        drawBall(ctx);
        return () => ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
    
    useEffect(()=> {
        const currentCanvas = canvasRef.current;
        currentCanvas.addEventListener('keydown', (e)=> {
            e.preventDefault();
            if (e.code === "ArrowUp")
                movePaddleUp();
            if (e.code === "ArrowDown")
                movePaddleDown();
        })
        drawGame();
        let start = null;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            let progress = timestamp - start;
            moveBall();
            drawGame();
            if (!winner) {
                let newFrameId = window.requestAnimationFrame(step);
                setFrameId(newFrameId);
            }
        }
        window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(frameId);
    }, [ball]);

    const checkGameOver = () => {
        if (game.leftPaddle.score >=10 || game.rightPaddle.score >=10) {
            let w = game.leftPaddle.score>10 ?
                        game.leftPaddle.player :
                        game.rightPaddle.player;
            setWinner(w);
            stopGame();
        }
    }

    const stopGame = () => {
        window.cancelAnimationFrame(frameId);
    }

    const collidesPaddle = (newBall) => {
        if (newBall.x <= game.leftPaddle.x + paddleWidth &&
            newBall.y >= game.leftPaddle.y &&
            newBall.y <= game.leftPaddle.y + paddleHeight ) {
            newBall.speed.dx = 6;
            newBall.speed.dy = -3;
            let newGame = game;
            newGame.leftPaddle.score +=1;
            setGame(newGame);
        }
        if (newBall.x >= game.rightPaddle.x - paddleWidth &&
            newBall.y >= game.rightPaddle.y &&
            newBall.y <= game.rightPaddle.y + paddleHeight ) {
            newBall.speed.dx = -6;
            newBall.speed.dy = 3;
            let newGame = game;
            newGame.rightPaddle.score +=1;
            setGame(newGame);
        }
        checkGameOver();
        return newBall;
    }

    const collidesWall = (newBall) => {
        if (newBall.x <= 0)
            newBall.speed.dx = 4;
        if (newBall.x >= canvasWidth)
            newBall.speed.dx = -4;
        if (newBall.y <= 0)
            newBall.speed.dy = 1;
        if (newBall.y >= canvasHeight) 
            newBall.speed.dy = -1;
        return newBall;
    }

    const changeDirectionOnCollide = (newBall) => {
        newBall = collidesWall(newBall);
        newBall = collidesPaddle(newBall);
        return newBall;
    }

    const moveBall = () => {
        let newBall = ball;
        newBall.x += newBall.speed.dx;
        newBall.y += newBall.speed.dy;
        newGame = changeDirectionOnCollide(newBall);
        setBall(newBall);        
    }
    
    const movePaddleUp = () => {
        let newGame = game;
        if(newGame.leftPaddle.y > 0)
            newGame.leftPaddle.y -= 4;
        setGame(newGame);
        drawGame();
    }

    const movePaddleDown = () => {
        let newGame = game;
        if (newGame.leftPaddle.y < canvasHeight);
            newGame.leftPaddle.y += 4;
        setGame(newGame);
        drawGame();
    }

    return <><canvas 
            tabIndex='1'
            ref={canvasRef}
            {...props} />
            {winner? 
            <div>Current Score </div>:
            <div className=''>Game over </div>}</>
}