import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import {
    ballHeight,
    ballWidth,
    boardWidth,
    gameInterval,
    gameAliveTimeout,
    FPS,
    initBallX, initBallY,
    lPadX,
    maxBallX, maxPadY,
    maxScore,
    minBallX,
    minPadY, paddleHeight, paddleVel,
    paddleWidth,
    ballVel
} from '../constants';
import { GameCollection } from '/imports/db/Collections';

const activeGameLoops = {};
const countDownLoops = {};

const randomBallVel = () => {
    return ballVel * (Math.random() > 0.5 ? 1 : -1);
}

const isColliding = (x1, y1, w1, h1, x2, y2, w2, h2) => {
    function boxContainsPoint(boxX, boxY, boxW, boxH, pointX, pointY) {
        return boxX <= pointX && pointX <= boxX + boxW
            && boxY <= pointY && pointY <= boxY + boxH;
    }

    function getBoxPoints(x, y, w, h) {
        return [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h]
        ];
    }

    function box2ContainsBox1Points(x1, y1, w1, h1, x2, y2, w2, h2) {
        return getBoxPoints(x1, y1, w1, h1)
            .map(([x, y]) => boxContainsPoint(x2, y2, w2, h2, x, y))
            .reduce((acc, x) => acc || x, false);
    }

    return box2ContainsBox1Points(x1, y1, w1, h1, x2, y2, w2, h2)
        || box2ContainsBox1Points(x2, y2, w2, h2, x1, y1, w1, h1);
}

Meteor.methods({
    'games.new'() {
        let userId = Meteor.userId();
        GameCollection.insert({
            player1: userId,
            state: 'waiting',
            active: true,
            winner: null,
            countdown: 5,
            board: {
                lPad: {
                    x: lPadX,
                    y: (1 - paddleHeight) / 2,
                    velY: 0,
                    score: 0
                },
                rPad: {
                    x: boardWidth - 1.15 * paddleWidth,
                    y: (1 - paddleHeight) / 2,
                    velY: 0,
                    score: 0
                },
                ball: {
                    x: initBallX,
                    y: initBallY,
                    velX: randomBallVel(),
                    velY: 1.5 * randomBallVel()
                }
            }
        });
    },
    'games.join'(gameId) {
        let player2 = Meteor.userId();
        let game = GameCollection.findOne({ _id: gameId });

        if (!game)
            return;

        if (game.player1 && game.player2
            && (game.player1 !== player2 || game.player2 !== player2))
            return;

        GameCollection.update(
            { _id: gameId },
            {
                $set: {
                    player2,
                    state: "ongoing"
                }
            }
        );

        let countdown = game.countdown;

        let i = Meteor.setInterval(()=> {
            countdown = countdown - 1;
            if (countdown <= 0) {
                clearInterval(countDownLoops[gameId]);
                Meteor.call('games.start', gameId);
            }

            GameCollection.update(
                { _id: gameId},
                { $set : { countdown: countdown}}
            );
        }, 1000);
        countDownLoops[gameId] = i;
    },
    'games.start'(gameId) {
        let player2 = Meteor.userId();
        let game = GameCollection.findOne({ _id: gameId });

        Meteor.setTimeout(() => {
            GameCollection.remove({ _id: gameId });
            Meteor.logout();
            Meteor.users.remove({
                $or: [
                    { _id: game.player1 },
                    { _id: player2 },
                ]
            });
        }, gameAliveTimeout);

        let i = Meteor.setInterval(() => {
            let game = GameCollection.findOne({ _id: gameId });

            let lPadY = game.board.lPad.y;
            let lPadScore = game.board.lPad.score;

            let rPadY = game.board.rPad.y;
            let rPadScore = game.board.rPad.score;

            let ball = game.board.ball;
            let ballX = ball.x;
            let ballY = ball.y;
            let ballVelX = ball.velX;
            let ballVelY = ball.velY;

            let updates = {};
            // move paddles
            if (game.board.lPad.velY !== 0)
                lPadY = game.board.lPad.y + game.board.lPad.velY;
            if (game.board.rPad.velY !== 0)
                rPadY = game.board.rPad.y + game.board.rPad.velY;

            // contain paddles in board
            if (lPadY < minPadY)
                lPadY = minPadY;
            if (lPadY > maxPadY)
                lPadY = maxPadY;
            if (rPadY < minPadY)
                rPadY = minPadY;
            if (rPadY > maxPadY)
                rPadY = maxPadY;

            // move ball
            if (game.board.ball.velX !== 0)
                ballX = game.board.ball.x + game.board.ball.velX;
            if (game.board.ball.velY !== 0)
                ballY = game.board.ball.y + game.board.ball.velY;

            // bounce ball from board
            let maxBallY = 1 - ballHeight;
            if (ballY < 0) {
                ballY = 0;
                ballVelY = -ballVelY;
            } else if (ballY > maxBallY) {
                ballY = maxBallY;
                ballVelY = -ballVelY;
            }

            // reset ball 
            let resetBall = () => {
                ballX = initBallX;
                ballY = initBallY;
                ballVelX = randomBallVel();
                ballVelY = 1.5 * randomBallVel();
            }
            if (ballX < minBallX) {
                rPadScore += 1;
                resetBall();
            } else if (ballX > maxBallX) {
                lPadScore += 1;
                resetBall();
            }

            // bounce ball from paddles
            let rPadX = boardWidth - paddleWidth;
            if (isColliding(
                ballX, ballY, ballWidth, ballHeight,
                lPadX, lPadY, paddleWidth, paddleHeight
            )) {
                ballVelX = -ballVelX;
                ballX = 1.5 * paddleWidth;
            } else if (isColliding(
                ballX, ballY, ballWidth, ballHeight,
                rPadX, rPadY, paddleWidth, paddleHeight
            )) {
                ballVelX = -ballVelX;
                ballX = boardWidth - 1.5 * paddleWidth - ballWidth;
            }

            updates['board.lPad.y'] = lPadY;
            updates['board.rPad.y'] = rPadY;
            updates['board.ball.x'] = ballX;
            updates['board.ball.y'] = ballY;
            updates['board.ball.velX'] = ballVelX;
            updates['board.ball.velY'] = ballVelY;
            updates['board.lPad.score'] = lPadScore;
            updates['board.rPad.score'] = rPadScore;

            // if ended
            if (rPadScore === maxScore || lPadScore === maxScore) {
                updates['state'] = "ended";
                updates['winner'] = lPadScore === maxScore ? game.player1 : player2;
                clearInterval(activeGameLoops[gameId]);
            }

            GameCollection.update(
                { _id: gameId },
                { $set: updates }
            );
        }, gameInterval);
        activeGameLoops[gameId] = i;

    },
    'games.move'(dir, gameId, userId, player) {
        check(player, Number);

        let game = GameCollection.findOne({ _id: gameId });

        // Only players can modify game
        if (![game.player1, game.player2].includes(Meteor.userId()))
            return;

        // Only player1 can move his paddle
        if (!(game && game['player' + player] === userId))
            return;
        let pad = player === 1 ? 'lPad' : 'rPad';
        let velY = dir === 'stop' ? 0 : (dir === 'up' ? -paddleVel : paddleVel);
        let update = {};
        update[`board.${pad}.velY`] = velY;

        GameCollection.update(
            { _id: gameId },
            { $set: update }
        );

    },
    'games.end'(gameId) {
        let userId = Meteor.userId();

        let game = GameCollection.findOne({ _id: gameId });
        if (![game.player1, game.player2].includes(userId))
            throw new Meteor.Error(401, 'Only players can end a game.');

        let gameLoop = activeGameLoops[gameId] || -1;
        Meteor.clearInterval(gameLoop);

        GameCollection.update(
            { _id: gameId },
            {
                $set: {
                    active: false,
                    state: "ended"
                }
            }
        );

        Meteor.users.remove({ _id: userId });
    }
})
