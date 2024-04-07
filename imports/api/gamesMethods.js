import { Meteor } from 'meteor/meteor';
import { GameCollection } from '/imports/db/Collections';
import { Game } from '../ui/Game';

const paddleHeight = 90;
const boardWidth = 400;
const boardHeight = 160;

function getWinner(game) {
    return game.leftPaddle.score >= 10? 
                game.leftPaddle.player :
                (game.rightPaddle.score >= 10 ? game.rightPaddle.player : null); 
}

const missedRightPaddle = (game) => {
    // negative right is right
    let ball = game.ball;
    if (ball.right <= 0 - Math.floor(boardWidth/2) &&
        (ball.top < game.rightPaddle.position || ball.top > game.rightPaddle.position + paddleHeight))
        return true;
    return false;
}

const missedLeftPaddle = (game) => {
    let ball = game.ball;
    console.log("ball.right : ", ball.right, "r paddle : ", game.rightPaddle.position);
    if (ball.right >= Math.floor(boardWidth/2) &&
        (ball.top < game.leftPaddle.position || ball.top > game.leftPaddle.position + paddleHeight) )
        return true;
    return false;
}

const collidesWall = (ball) => {
    if (ball.top <= 0 || ball.top >= boardHeight)
        return true;
    return false;
}

const hitsPaddle = (game) => {
    if (game.ball.right >= Math.floor(boardWidth/2) &&
        game.ball.top >= game.leftPaddle.position &&
        game.ball.top <= game.leftPaddle.position + paddleHeight ) 
            return true;
    if (game.ball.right <= (0 - Math.floor(boardWidth/2)) &&
        game.ball.top >= game.rightPaddle.position &&
        game.ball.top <= game.rightPaddle.position + paddleHeight )
            return true;
    return false;
}

const moveBall = (game) => {
    let newBall = game.ball;
    if (collidesWall(newBall)) 
        newBall.speed.dt = -newBall.speed.dt;
    if (hitsPaddle(game))
        newBall.speed.dr = -newBall.speed.dr;
    newBall.top += newBall.speed.dt;
    newBall.right += newBall.speed.dr;
    return newBall
}

const getBallSpeed = (min, max) => {
    let speed = Math.floor(Math.random() * (max + min))
    let dir = Math.round(Math.random()) ? 1 : -1;
    while (speed === 0)
        speed = Math.floor(Math.random() * (max + min))
    return speed * dir;
}

Meteor.methods({
    'games.new'() {
        let userId = Meteor.userId();
        GameCollection.insert({
            state : 'waiting',
            leftPaddle: { 
                player: userId,
                position: 50,
                score: 0
            },
            rightPaddle: {
                player: null,
                position: 50,
                score: 0
            },
            ball: {
                top: 50,
                right: 0,
                speed: { dt: getBallSpeed(1, 3), dr: getBallSpeed(3, 5)}
            },
            active: true,
            winner: null,
            currentPlayer: null
        });
        let game = GameCollection.findOne({
            "leftPaddle.player" : userId, active: true
        });
        return game;
    },
    'games.join'(gameId) {
        GameCollection.update(
            {_id: gameId},
            { $set : { "rightPaddle.player": Meteor.userId(),
                        state: "ongoing" }});

        let intervalId = Meteor.setInterval(function() {
            const game = GameCollection.findOne({_id: gameId});
            let newBall = moveBall(game);
            let missedLeft = missedLeftPaddle(game);
            let missedRight = missedRightPaddle(game);
            if (missedLeft || missedRight)
                newBall = {
                    top: 50,
                    right: 0,
                    speed: { 
                        dt: getBallSpeed(1, 2), 
                        dr: getBallSpeed(3, 5)
                }};

            let winner = getWinner(game);
            let newState = winner? "ended" : game.state;

            if (missedRight) {
                // if right missed hitting the ball then left scores
                let newScore = game.leftPaddle.score + 1;
                GameCollection.update(
                    { _id: gameId},
                    { $set: {   "leftPaddle.score" : newScore,
                                ball: newBall,
                                winner: winner,
                                state: newState }});
            }
            else if(missedLeft) {
                let newScore = game.rightPaddle.score + 1;
                GameCollection.update(
                    { _id: gameId},
                    { $set: {   "rightPaddle.score": newScore,
                                ball: newBall,
                                winner: winner,
                                state: newState }});
            } else {
                GameCollection.update(
                    { _id: gameId },
                    { $set : { ball: newBall }});
            }
        }, 100);
    },
    'games.end'(gameId) {
        GameCollection.update(
            {_id: gameId},
            { $set : { active: false,
                       state: "ended"}}
        );
    },
    'games.updatePaddle'(gameId, direction) {
        const game = GameCollection.findOne({ _id: gameId});

        if (game.leftPaddle.player === this.userId)
            GameCollection.update(
                { _id: gameId },
                { $set: { "leftPaddle.position": game.leftPaddle.position + direction  }});
        else if (game.rightPaddle.player === this.userId)
                GameCollection.update(
                    { _id: gameId },
                    { $set: { "rightPaddle.position": game.rightPaddle.position + direction  }});
    }
})
