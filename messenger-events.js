/*
 * This is an abstraction layer around facebook-chat-api to
 * allow more complex use cases such as reimplementing a
 * full-fledged chat client by injecting commonly desired
 * information such as the names of the users.
 * 
 * The syntaxic sugar comes at the cost of phasing out
 * certain features in the name of simplicity.
 */

const login = require("facebook-chat-api");
const nf = () => 0;

Function.prototype.clone = function () {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

/**
 * @param {Object} auth defines the `email` and `password` to login
 * @param {requestCallback} ready Will be called when the login sequence has been completed. Callback is either (false, err) or (true, {handlers, actions}).
*/
module.exports = (auth, ready) => {


    const options = { listenEvents: true, selfListen: true, updatePresence: true };
    function cloneObject(obj) {
        return Object.assign({}, obj)
    }
    login(auth, (err, api) => {

        if (err) return ready(false, err);

        // Events to handle
        let placeholder = () => 0;
        let h = {
            // message
            message: [],
            // typ
            typing: [],
            // read_receipt
            seen: [],
            // message_reaction
            reaction: [],
            // presence
            status: [],
            // sticker
            sticker: [],
            // file
            file: [],
            // photo
            photo: [],
            // animation
            animation: [],
            // share
            share: [],
            // video
            video: [],
            // event.log:user-nickname
            nick: [],
            // event.log:thread-icon
            icon: [],
            add: [],
            kick: [],

            // For legacy support
            legacyListener: [],
        }

        function addHandler(handle, f){
            let index = h[handle].push(f) - 1;
            let removeHandler = () => h[handle].splice(index, 1);
            return removeHandler;
        }
        let collection = {
            // Triggers
            onMessage: (f) => addHandler("message", f),
            onStatusChange: (f) => addHandler("status", f),
            onTyping: (f) => addHandler("typing", f),
            onSeen: (f) => addHandler("seen", f),
            onReaction: (f) => addHandler("reaction", f),
            onSticker: (f) => addHandler("sticker", f),
            onFile: (f) => addHandler("file", f),
            onImage: (f) => addHandler("photo", f),
            onAnimation: (f) => addHandler("animation", f),
            onShare: (f) => addHandler("share", f),
            onVideo: (f) => addHandler("video", f),
            onNicknameChange: (f) => addHandler("nick", f),
            onIconChange: (f) => addHandler("icon", f),
            onUserAdd: (f) => addHandler("add", f),
            onUserRemove: (f) => addHandler("kick", f),

            // Legacy
            legacyListen: (f) => addHandler("legacyListener", f),

            // Accessors
            getThread: getThreadInfo,
            getUser: getUserInfo,

            // Methods
            logout: api.logout,

            // API
            api: api
        }

        api.listenReal = api.listen.clone();
        api.listen = collection.legacyListen;
        api.setOptions(options)

        ready(true, collection);


        // Allow easy lookup of names
        let userCache = {};
        function getUserInfo(id, callback, threadContextID) {

            if (userCache[id]) {
                userCache[id].sendMessage = (msg, cb) => api.sendMessage(msg, id, cb)
                userCache[id].addUserToGroup = (threadID = threadContextID, cb) => api.addUserToGroup(id, threadID, cb)
                userCache[id].removeUserFromGroup = (threadID = threadContextID, cb) => api.removeUserFromGroup(id, threadID, cb)
                userCache[id].changeBlockedStatus = (block, cb) => api.changeBlockedStatus(id, block, cb)
                userCache[id].changeNickname = (nick, threadID = threadContextID, cb) => api.changeNickname(nick, threadID, id, cb)

                return callback(cloneObject(userCache[id]))
            }
            api.getUserInfo(id, (err, obj) => {
                //console.log(obj)
                if (err) {
                    callback(false);
                    return console.err(err);
                }
                userCache[id] = obj[id];
                userCache[id].id = id;
                userCache[id].sendMessage = (msg, cb) => api.sendMessage(msg, id, cb)
                userCache[id].addUserToGroup = (threadID = threadContextID, cb) => api.addUserToGroup(id, threadID, cb)
                userCache[id].removeUserFromGroup = (threadID = threadContextID, cb) => api.removeUserFromGroup(id, threadID, cb)
                userCache[id].changeBlockedStatus = (block, cb) => api.changeBlockedStatus(id, block, cb)
                userCache[id].changeNickname = (nick, threadID = threadContextID, cb) => api.changeNickname(nick, threadID, id, cb)

                callback(cloneObject(userCache[id]))
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

        function updateStatus(id, statuses, timestamp) {
            getUserInfo(id, (userInfo) => {
                let status = -1;
                if ((statuses == 0 && (status = false)) || (statuses == 2 && (status = true))) {
                    // 0 means offline, 2 means online
                    if (!userInfo.status || userInfo.status.isOnline != status) {

                        // User Status Changed
                        h.status.forEach((f) => f({
                            user: userInfo,
                        }, {
                                online: status,
                                timestamp: timestamp
                            }))
                    }
                    userCache[id].status = {
                        isOnline: status,
                        timestamp: timestamp
                    };

                }
            })
        }

        function getThreadInfo(threadID, callback) {
            api.getThreadInfo(threadID, (err, threadInfo) => {
                if (err) return callback({})
                threadInfo.sendMessage = (msg, cb) => api.sendMessage(msg, threadID, cb)
                threadInfo.id = threadID
                threadInfo.sendTypingIndicator = (cb) => api.sendTypingIndicator(threadID, cb)
                threadInfo.changeArchivedStatus = (archive, cb) => api.changeArchivedStatus(threadID, archive, cb)
                threadInfo.changeNickname = (nick, userid, cb) => api.changeNickname(nick, threadID, userid, cb)
                threadInfo.changeThreadColor = (color, cb) => api.changeThreadColor(color, threadID, cb)
                threadInfo.changeThreadEmoji = (emoji, cb) => api.changeThreadEmoji(emoji, threadID, cb)
                threadInfo.deleteThread = (cb) => api.deleteThread(threadID, cb)
                threadInfo.getThreadHistory = (amount, timestamp, cb) => api.getThreadHistory(threadID, amount, timestamp, cb)
                threadInfo.getThreadInfo = (cb) => api.getThreadInfo(threadID, cb)
                threadInfo.getThreadPictures = (offset, limit, cb) => api.getThreadPictures(threadID, offset, limit, cb)
                threadInfo.markAsRead = (cb) => api.markAsRead(threadID, cb)
                threadInfo.muteThread = (seconds, cb) => api.muteThread(threadID, seconds, cb)


                if (!threadInfo.isCanonical) {
                    threadInfo.setTitle = (newTitle, cb) => api.setTitle(newTitle, threadID, cb)
                    threadInfo.addUserToGroup = (userid, cb) => api.addUserToGroup(userid, threadID, cb)
                    threadInfo.removeUserFromGroup = (userid, cb) => api.removeUserFromGroup(userid, threadID, cb)
                    threadInfo.changeGroupImage = (image, cb) => api.changeGroupImage(image, threadID, cb)
                    threadInfo.createPoll = (title, options, cb) => api.createPoll(title, threadID, options, cb)

                }

                // Syntaxic sugar for participants
                threadInfo.participants = [];
                threadInfo.participantIDs.forEach((id) => {
                    getUserInfo(id, (userInfo) => {
                        userInfo.nickname = threadInfo.nicknames ? threadInfo.nicknames[userInfo.id] : ""
                        threadInfo.participants.push(userInfo);
                        if (threadInfo.participants.length == threadInfo.participantIDs.length) {
                            callback(cloneObject(threadInfo))
                        }
                    }, threadID)
                })

            })
        }
        api.listenReal((err, $) => {
            h.legacyListener.forEach((f) => f(err, $))
            if (err) {
                callback(false)
                return console.err(err)
            }
            //console.log($.threadID, $.type, JSON.stringify($))
            switch ($.type) {
                case "presence":
                    updateStatus($.userID, $.statuses)
                    break;
                case "message":
                    getThreadInfo($.threadID, (threadInfo) => {
                        getUserInfo($.senderID, (userInfo) => {
                            userInfo.nickname = threadInfo.nicknames ? threadInfo.nicknames[userInfo.id] : ""

                            h.message.forEach((f) => f({
                                user: userInfo,
                                thread: threadInfo,
                            }, {
                                    id: $.messageID,
                                    body: $.body,
                                    attachments: $.attachments,
                                    react: (reaction, cb) => api.setMessageReaction(reaction, $.messageID, cb)
                                }))
                            $.attachments.forEach((attachment) => {
                                switch (attachment.type) {
                                    case "sticker":
                                        h.sticker.forEach((f) => f({
                                            user: userInfo,
                                            thread: threadInfo,
                                        }, {
                                                id: attachment.stickerID,
                                                url: attachment.url,
                                                size: {
                                                    height: attachment.height,
                                                    width: attachment.width
                                                }
                                            }))
                                        break;
                                }

                            })
                        }, $.threadID)

                    })
                    break;
                case "typ":
                    getThreadInfo($.threadID, (threadInfo) => {
                        getUserInfo($.from, (userInfo) => {
                            h.typing.forEach((f) => f({
                                user: userInfo,
                                thread: threadInfo
                            }, {
                                    isTyping: $.isTyping,
                                    isMobile: $.fromMobile,
                                }))
                        }, $.threadID)
                    })
                    // {"isTyping":true,"from":"100003164670277","threadID":"1693875470645297","fromMobile":false,"userID":"100004805311217","type":"typ"}
                    break;
                //{ "type":"event","threadID":"100004805311217", "logMessageType":"log:user-nickname", "logMessageData":{ "participant_id":"100004805311217", "nickname":"Literally Me" },"logMessageBody":"You set your nickname to Literally Me.", "author":"100004805311217"}
                case "event":
                    getThreadInfo($.threadID, (threadInfo) => {
                        switch ($.logMessageType) {
                            case "log:user-nickname":
                                getUserInfo($.author, (userInfoAuthor) => {
                                    getUserInfo($.logMessageData.participant_id, (userInfoTarget) => {
                                        if (!userInfoTarget) return;
                                        h.nick.forEach((f) => f({
                                            user: userInfoAuthor,
                                            thread: threadInfo
                                        }, {
                                                user: userInfoTarget,
                                                nickname: $.logMessageData.nickname
                                            }))
                                        //console.log(userInfoTarget);
                                    }, $.threadID)
                                }, $.threadID)
                                break;
                            case "log:thread-icon":
                                getUserInfo($.author, (userInfo) => {
                                    h.icon.forEach((f) => f({
                                        user: userInfo,
                                        thread: threadInfo
                                    }, {
                                            thread: threadInfo,
                                            icon: $.logMessageData.thread_icon
                                        }))
                                }, $.threadID)
                                break;
                            case "log:unsubscribe":
                                getUserInfo($.author, (userInfoAuthor) => {
                                    getUserInfo($.logMessageData.leftParticipantFbId, (userInfoTarget) => {
                                        h.kick.forEach((f) => f({
                                            user: userInfoAuthor,
                                            thread: threadInfo
                                        }, {
                                                user: userInfoTarget
                                            }))
                                    }, $.threadID)
                                }, $.threadID)
                                break;
                            case "log:subscribe":
                                getUserInfo($.author, (userInfoAuthor) => {
                                    $.logMessageData.addedParticipants.forEach((participant) => {
                                        getUserInfo(participant.userFbId, (userInfo) => {
                                            if (!userInfo) return;
                                            h.add.forEach((f) => f({
                                                user: userInfoAuthor,
                                                thread: threadInfo
                                            }, {
                                                    user: userInfo
                                                }))
                                        }, $.threadID)
                                    })


                                }, $.threadID)
                                break;
                        }
                    })


                    break;
            }
        });
    });
}
