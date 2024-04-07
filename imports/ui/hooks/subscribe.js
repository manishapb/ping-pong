import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

export const useSubscribe = (topic, onLoad) => {
    return useTracker(() => {
        let handler = Meteor.subscribe(topic);
        
        if (!handler.ready())
            return [true, null];
        else
            return [false, onLoad()];
    });
}