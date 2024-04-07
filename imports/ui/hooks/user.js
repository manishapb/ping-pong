import { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

const genstr = () =>
    (Math.random() + 1).toString(36).substring(7);

export const useUser = () => {
    const [username, setUsername] = useState(genstr());
    const [user, setUser] = useState(null);

    useEffect(() => {
        Meteor.call('user.new', username, err => {
            if (err)
                setUsername(genstr());
            else {
                Meteor.loginWithPassword(username, username, () => {
                    setUser(Meteor.user());
                });
            }
        })
    }, [username]);

    return user;
}