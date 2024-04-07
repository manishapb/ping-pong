import 'bulma/css/bulma.css';
import React from 'react';
import { Game } from './Game';
import { Home } from './Home';
import { GameCollection } from '/imports/db/Collections';
import { useUser } from '/imports/ui/hooks/user';
import { useSubscribe } from '/imports/ui/hooks/subscribe';
import { Loading } from '/imports/ui/Loading';

export const App = () => {
  const user = useUser();
  const [loading, game] = useSubscribe('games', () => {
    return [...GameCollection.find()][0];
  });

  return (
    <Loading
      loading={loading}
      element={(user && game && game.active ?
        <Game user={user} game={game} />
        : <Home />)}
    />
  );
}