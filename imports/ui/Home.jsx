import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';


export const Home = () => {
    const startGame = () => {
        Meteor.call('games.new', (err, res)=> {
            if (err)
                alert(err);
        });
    }
    const joinGame = () => {
        let gameId = prompt('Enter game id: ');
        Meteor.call('games.join', gameId);
    }

    return (
    <div className='container has-text-centered'>
        <div onClick={startGame}> Start Game </div>
        <div onClick={joinGame}> Join Game </div>
    </div>);
}