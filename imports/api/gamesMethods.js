import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GameCollection } from '/imports/db/Collections';

const activeGameLoops = {};

const getRandomVel = () => {
    return 0.08 * (Math.random() > 0.5 ? 1 : -1);
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
                    velX: getRandomVel(),
                    velY: getRandomVel()
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

            let update = {};
            if (game.board.lPad.velY !== 0)
                update['board.lPad.y'] = game.board.lPad.y + game.board.lPad.velY;
            if (game.board.rPad.velY !== 0)
                update['board.rPad.y'] = game.board.rPad.y + game.board.rPad.velY;
            if (game.board.ball.velX !== 0) 
                update['board.ball.x'] = game.board.ball.x + game.board.ball.velX;
            if (game.board.ball.velY !== 0) 
                update['board.ball.y'] = game.board.ball.y + game.board.ball.velY;

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
            });

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
