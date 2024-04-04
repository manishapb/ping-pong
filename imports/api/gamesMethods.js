import { Meteor } from 'meteor/meteor';
import { GameCollection } from '/imports/db/Collections';

const paddleHeight = 50;
const paddleWidth = 4;

const canvasWidth = 400;
const canvasHeight = 200;

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
            active: true
        });
        let game = GameCollection.findOne({
            $or:[
                { "leftPaddle.player" : userId, active: true },
                { "rightPaddle.player": userId, active: true }
            ]
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
            { $set : { active: false}}
        );
    },
    'games.update'(gameId) {
        const game = GameCollection.findOne({_id: gameId});

        let score = (game.leftPaddle.player === this.userId? 
                        game.leftPaddle.score : game.rightPaddle.score) + 1;
        let newState = score>=10? "ended" : game.state;

        if (game.leftPaddle.player === this.userId) {
            GameCollection.update(
                { _id: gameId },
                { $set : { "leftPaddle.score" : score,
                            state : newState }});   
        }
        else if (game.rightPaddle.player === this.userId) {
            GameCollection.update(
                { _id: gameId },
                { $set : { "rightPaddle.score" : score,
                            state : newState }});   
        }
    } 
})