import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GameCollection } from '/imports/db/Collections';

const activeGameLoops = {};

const randomBallVel = () => {
    return 0.02 * (Math.random() > 0.5 ? 1 : -1);
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
            board: {
                lPad: {
                    x: 0,
                    y: 0,
                    velY: 0
                },
                rPad: {
                    x: 0.987,
                    y: 0,
                    velY: 0
                },
                ball: {
                    x: 0.49,
                    y: 0.49,
                    velX: randomBallVel(),
                    velY: 1.5 * randomBallVel()
                }
            }
        });
    },
    'games.join'(gameId) {
        let game = GameCollection.findOne({ _id: gameId });
        if (!game)
            return;

        let i = Meteor.setInterval(() => {
            let game = GameCollection.findOne({ _id: gameId });
            let lPadY = game.board.lPad.y;
            let rPadY = game.board.rPad.y;
            let ball = game.board.ball;
            let ballX = ball.x;
            let ballY = ball.y;
            let ballVelX = ball.velX;
            let ballVelY = ball.velY;

            let update = {};
            // move paddles
            if (game.board.lPad.velY !== 0)
                lPadY = game.board.lPad.y + game.board.lPad.velY;
            if (game.board.rPad.velY !== 0)
                rPadY = game.board.rPad.y + game.board.rPad.velY;

            // contain paddles in board
            if (lPadY < 0)
                lPadY = 0;
            if (lPadY > 0.75)
                lPadY = 0.75;
            if (rPadY < 0)
                rPadY = 0;
            if (rPadY > 0.75)
                rPadY = 0.75;

            // move ball
            if (game.board.ball.velX !== 0)
                ballX = game.board.ball.x + game.board.ball.velX;
            if (game.board.ball.velY !== 0)
                ballY = game.board.ball.y + game.board.ball.velY;

            // bounce ball from board
            let ballHeight = 0.02 / 0.32;
            let maxBallY = 1 - ballHeight;
            if (ballY < 0) {
                ballY = 0;
                ballVelY = -ballVelY;
            } else if (ballY > maxBallY) {
                ballY = maxBallY;
                ballVelY = -ballVelY;
            }

            // reset ball
            if (ballX < 0 || ballX > 0.98) {
                ballX = 0.49;
                ballY = 0.49;
                ballVelX = randomBallVel();
                ballVelY = 1.5 * randomBallVel();
            }

            // bounce ball from paddles
            if (isColliding(
                ballX, ballY, 0.02, ballHeight,
                0, lPadY, 0.01, 0.25
            )) {
                ballVelX = -ballVelX;
                ballX = 0.015;
            } else if (isColliding(
                ballX, ballY, 0.02, ballHeight,
                0.99, rPadY, 0.01, 0.25
            )) {
                ballVelX = -ballVelX;
                ballX = 0.99 - 0.025;
            }

            update['board.lPad.y'] = lPadY;
            update['board.rPad.y'] = rPadY;
            update['board.ball.x'] = ballX;
            update['board.ball.y'] = ballY;
            update['board.ball.velX'] = ballVelX;
            update['board.ball.velY'] = ballVelY;

            GameCollection.update(
                { _id: gameId },
                { $set: update }
            );
        }, 67);
        activeGameLoops[gameId] = i;

        GameCollection.update(
            { _id: gameId },
            {
                $set: {
                    player2: Meteor.userId(),
                    state: "ongoing"
                }
            }
        );
    },
    'games.move'(dir, gameId, userId, player) {
        check(player, Number);

        let game = GameCollection.findOne({ _id: gameId });
        if (!(game && game['player' + player] === userId))
            return;
        let pad = player === 1 ? 'lPad' : 'rPad';
        let velY = dir === 'stop' ? 0 : (dir === 'up' ? -0.08 : 0.08);
        let update = {};
        update[`board.${pad}.velY`] = velY;

        GameCollection.update(
            { _id: gameId },
            { $set: update }
        );

    },
    'games.end'(gameId) {
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
    }
})
