import { Meteor } from 'meteor/meteor';
import { GameCollection } from '/imports/db/Collections';

function getWinner(game) {
    return game.leftPaddle.score >= 10? 
                game.leftPaddle.player :
                (game.rightPaddle.score >= 10 ? game.rightPaddle.player : null); 
}

Meteor.methods({
    'games.new'() {
        let userId = Meteor.userId();
        GameCollection.insert({
            state : 'waiting',
            leftPaddle: { 
                player: userId,
                score: 0
            },
            rightPaddle: {
                player: null,
                score: 0
            },
            active: true,
            winner: null
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
                        state: "active"}});
    },
    'games.end'(gameId) {
        GameCollection.update(
            {_id: gameId},
            { $set : { active: false,
                       state: "ended"}}
        );
    },
    'games.update'(gameId) {
        const game = GameCollection.findOne({_id: gameId});
        let winner = getWinner(game);
        let newState = winner? "ended" : game.state;

        if (game.leftPaddle.player === this.userId) {
            let score = game.leftPaddle.score + 1;
            GameCollection.update(
                { _id: gameId },
                { $set : { "leftPaddle.score" : score,
                            state : newState,
                            winner: winner }});   
        }
        else if (game.rightPaddle.player === this.userId) {
            let score = game.rightPaddle.score + 1;
            GameCollection.update(
                { _id: gameId },
                { $set : { "rightPaddle.score" : score,
                            state : newState,
                            winner: winner }});   
        }

    } 
})