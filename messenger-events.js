/*
 * This is an abstraction layer around facebook-chat-api to
 * allow more complex use cases such as reimplementing a
 * full-fledged chat client by injecting commonly desired
 * information such as the names of the users
 */

const login = require("facebook-chat-api");
/**
 * @param {Object} auth defines the `email` and `password` to login
 * @param {Object} options Options which will be directly passed to the chat library
 * @param {requestCallback} ready Will be called when the login sequence has been completed. Callback is either (false, err) or (true, {handlers, actions}).
*/
module.exports = (auth, options, ready) => {

    login(auth, (err, api) => {
        if (err) return ready(false, err);

        let h = {};
        let a = {};

        // Events to handle
        h = {
            // message
            message: Function,
            // typ
            typing: Function,
            // read_receipt
            seen: Function,
            // message_reaction
            reaction: Function,
            // presence
            status: Function,
            // sticker
            sticker: Function,
            // file
            file: Function,
            // photo
            photo: Function,
            // animation
            animation: Function,
            // share
            share: Function,
            // video
            video: Function
        }

        ready(true, { handlers: h, actions: a });
        api.setOptions(options)


        // Allow easy lookup of names
        let userInfo = {};
        function _(id, callback){
            if (userInfo[id]){
                return callback(userInfo[id].name)
            }
            api.getUserInfo(id, (err, obj)=>{
                //console.log(obj)
                callback(obj[id].name)
                userInfo[id] = {};
                userInfo[id].name = obj[id].name;
                userInfo[id].thumb = obj[id].thumbsrc;
            })
            /*api.getThreadList(0,20, (err, arr)=>{
                arr.forEach((thread)=>{
                    nameIDs[thread.threadID] = thread.name;
                    if (thread.threadID == id){
                        callback(thread.name)
                    }
                })
            })*/
        }

        api.listen((err, $) => {
            //api.sendMessage(message.body, message.threadID);
            //console.log($.threadID, $.type, JSON.stringify($))
            switch ($.type) {
                case "message":
                    _($.senderID, (name)=>{
                        h.message({
                            name: name,
                            id: $.senderID,
                            thread: $.threadID,
                            getInfo: (cb) => api.getThreadInfo($threadID, cb)
                        }, {
                                body: $.body,
                                attachments: $.attachments
                            })
                        $.attachments.forEach((attachment) => {
                            switch (attachment.type) {
                                case "sticker":
                                    h.sticker({
                                        name: name,
                                        id: $.senderID,
                                        thread: $.threadID,
                                        getInfo: (cb) => api.getThreadInfo($threadID, cb)
                                    }, {
                                            id: attachment.stickerID,
                                            url: attachment.url,
                                            size: {
                                                height: attachment.height,
                                                width: attachment.width
                                            }
                                        })
                                    break;
                                case "sticker":
                                    h.sticker({
                                        name: name,
                                        id: $.senderID,
                                        thread: $.threadID,
                                        getInfo: (cb) => api.getThreadInfo($threadID, cb)
                                    }, {
                                            body: $.body,
                                            attachments: $.attachments
                                        })
                                    break;
                                case "sticker":
                                    h.sticker({
                                        name: name,
                                        id: $.senderID,
                                        thread: $.threadID,
                                        getInfo: (cb) => api.getThreadInfo($threadID, cb)
                                    }, {
                                            body: $.body,
                                            attachments: $.attachments
                                        })
                                    break;
                            }
    
                        })
                    })
                    
                    break;
                case "typ":

                    break;
            }
        });
    });
}
