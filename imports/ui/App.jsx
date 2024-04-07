import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Game } from './Game';
import { Home } from './Home';
import 'bulma/css/bulma.css';
import { GameCollection } from '/imports/db/Collections';
import { useSubscribe } from '../ui/hooks/subscribe';


const genstr = () => {
  return (Math.random() + 1).toString(36).substring(7);
}

const Loading = () => 
  <div>Loading...</div>;

export const App = () => {
  let usr = genstr();
  const [username, setUsername] = useState(usr);
  
  useEffect(()=> {
    Meteor.call('user.new', username, (err, _)=> {
      if(err)
        setUsername(genstr());
      else
        Meteor.loginWithPassword(username, username);
    })
  }, [username]);
    
  const [loading, game] = useSubscribe('games', () => {
    return [...GameCollection.find()][0];
  });
  
  return (
    <div>
      <center>
        <div className='mt-4 is-family-code is-size-1'>
          <h1>Ping Pong</h1>
        </div>
        {loading ?
          <Loading />
          : (game && game.active ?
              <Game game={game}/>
              : <Home /> )}
      </center>
    </div>
  );
}