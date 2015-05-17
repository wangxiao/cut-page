void function() {

    var appId = '7f69g7feabv7lts11vtjlu13q5ngrtab0hs426535nh2eotl';
    var appKey = 'plvj3ewitm5k3wamysd593tp2l9f61bp6o4ma6vtxp9j7h5y';
    var roomId = '55571ad2e4b032516125f0e4';
    var maps = ['a', 'b', 'c'];

    AV.initialize(appId, appKey);

    window.player = function() {

        // 用户数据
        var attr = {
            name: '',
            score: []
        };

        var eventCenter = $({});
        var room;

        // 游戏状态  0 准备开始 1 正在玩 2 准备结束
        var status = 0;

        var otherData = {};

        function isEnd(myData, otherData) {
            if (status === 2) {
                eventCenter.trigger('end', {
                    results: [
                        myData, 
                        otherData
                    ]
                });
                status = 0;
            }
        }

        function isStart(otherData) {
            if (status === 0) {
                eventCenter.trigger('start', {
                    maps: maps,
                    user: otherData
                });
                status = 1;
            }
        }

        return {
            attr: attr,
            login: function(name, callback) {
                var me = this;
                me.attr.name = name;

                // 创建实时通信实例
                var rt = AV.realtime({
                    appId: appId,
                    clientId: name,
                    secure: false
                });
                rt.on('open', function() {
                    rt.room(roomId, function(obj) {
                        if (obj) {
                            room = obj;
                            room.join();
                            room.send({
                                status: 'online',
                                user: attr
                            }, function() {
                                callback && callback();
                            });

                            rt.on('message', function(data) {
                                otherData = data.msg.user;
                                switch(data.msg.status) {
                                    case 'online':
                                        room.send({
                                            status: 'start',
                                            user: attr
                                        });
                                        isStart(otherData);
                                    break;
                                    case 'start':
                                        isStart(otherData);
                                    break;
                                    case 'end':
                                        isEnd(me.attr, otherData);
                                        status = 2;
                                    break;
                                }
                            });                            
                        } else {
                            alert('服务器的聊天数据被删！');
                        }
                    });
                });
                return this;
            },
            end: function(myData) {
                var me = this;
                isEnd(me.attr, otherData);
                status = 2;
                for (var k in myData) {
                    me.attr[k] = myData[k];
                }
                room.send({
                    status: 'end',
                    user: me.attr
                });
                return this;
            },
            on: function(eventName, fun) {
                eventCenter.on(eventName, fun);
                return this;
            }
        };
    };
}();

// var p = window.player();

// // 登录游戏，准备开始
// p.login('aaa', function() {
//     console.log('123');
// });

// // 监听是否开始游戏
// p.on('start', function(event, data) {
//     console.log('start', data);
// });

// // 监听游戏是否结束
// p.on('end', function(event, data) {
//     console.log('end', data);
// });

// // 告知对方当前客户端已经结束游戏
// p.end({
//     // 每个的相似度等
//     score: [30, 20, 30]
// });

