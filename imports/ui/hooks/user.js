import { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

const genstr = () =>
    (Math.random() + 1).toString(36).substring(7);

const newUser = (setUser) => {
    let username = genstr();
    Meteor.call('user.new', username, err => {
        if (err)
            newUser(setUser);
        else {
            Meteor.loginWithPassword(username, username, () => {
                setUser(Meteor.user());
            });
        }
    })
}

export const useUser = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if(!user)
            newUser(setUser)
    }, [user]);

    const logout = () => {
        if(user)
            Meteor.logout();
        setUser(null);
    }

    return [user, logout];
}