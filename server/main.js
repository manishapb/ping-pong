import { Meteor } from 'meteor/meteor';
import { GameCollection } from '/imports/db/Collections';
import '/imports/api/userMethods';
import '/imports/api/gamesMethods'

Meteor.publish("games", function publishGames() {
  return GameCollection.find({
          $or : [
            { player1: this.userId },
            { player2: this.userId }
          ],
          active: true
  });
});
