import { Meteor, check } from 'meteor/meteor';
import { GameCollection } from '/imports/db/Collections';

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
                    x: 0.99,
                    y: 0,
                    velY: 0
                },
                ball: {
                    x: 0.49,
                    y: 0.49,
                    velX: 0,
                    velY: 0
                }
            }
        });
    },
    'games.join'(gameId) {
        let game = GameCollection.findOne({ _id: gameId });
        if (!game)
            return;

        // let i = Meteor.setInterval(() => {
        //     let game = GameCollection.findOne({ _id: gameId });

        //     let update = {};
        //     if (game.board.lPad.velY !== 0)
        //         update['board.lPad.y'] = game.board.lPad.y + game.board.lPad.velY;
        //     if (game.board.rPad.velY !== 0)
        //         update['board.rPad.y'] = game.board.rPad.y + game.board.rPad.velY;

        //     GameCollection.update(
        //         { _id: gameId },
        //         { $set: update }
        //     );
        // }, 100);

        GameCollection.update(
            { _id: gameId },
            {
                $set: {
                    player2: Meteor.userId(),
                    state: "ongoing",
                    // driver: i
                }
            });

    },
    'games.move'(dir, gameId, userId, player) {
        check(player, Number);

        let game = GameCollection.findOne({ _id: gameId });
        if (!(game && game.board['player' + player] === userId))
            return;

        let pad = player === 1 ? 'lPad' : 'rPad';
        let velY = dir === 'stop' ? 0 : (dir === 'up' ? -0.01 : 0.01);
        let update = {};
        update[`board.${pad}.velY`] = velY;
        GameCollection.update(
            { _id: gameId },
            { $set: update }
        );
    },
    'games.end'(gameId) {
        let game = GameCollection.findOne({ _id: gameId });
        Meteor.clearInterval(game.driver || -1);

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
