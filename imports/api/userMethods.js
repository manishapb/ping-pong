import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
    'user.new'(username) {
        Accounts.createUser({
            username: username,
            password: username
        });
    }
})