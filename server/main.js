import { Meteor } from 'meteor/meteor';
import { GameCollection } from '/imports/db/Collections';
import '/imports/api/userMethods';
import '/imports/api/gamesMethods'


Meteor.publish("games", function publishGames() {
  return GameCollection.find({
          $or : [
            { 'rightPaddle.player': this.userId },
            { 'leftPaddle.player': this.userId }
          ],
          active: true
  });
});
