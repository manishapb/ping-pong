import MD from 'meteor/react-meteor-data';

export const useSubscribe = (topic, onLoad) => {
    return MD.useTracker(() => {
        let isLoading = MD.useSubscribe(topic);
        
        if (isLoading())
            return [true, null];
        else
            return [false, onLoad()];
    });
}