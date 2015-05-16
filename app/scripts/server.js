AV.initialize("7f69g7feabv7lts11vtjlu13q5ngrtab0hs426535nh2eotl", 
    "plvj3ewitm5k3wamysd593tp2l9f61bp6o4ma6vtxp9j7h5y");

var player = function() {
    var Player = AV.Object.extend('Player');
    var p = new Player();
    var attr = {
        name: '',
        level: 1,
        score: 0
    };

    function listAll(callback) {
        var query = new AV.Query(Player);
        query.find({
            success: function(results) {
                callback(results);
            }
        });
    }

    return {
        attr: attr,
        login: function(name, callback) {
            var me = this;
            attr.name = name;
            p.save(me.attr, {
                success: function(object) {
                    callback && callback();
                }
            });
        },
        match: function(callback) {
            var me = this;
            var max = 5;
            listAll(function(results) {
                f(results);
            });
            var f = function(results) {
                var i = Math.floor(Math.random() * (results.length - 1));
                if (results[i].attributes.name !== attr.name && results[i].attributes.score) {
                    callback(results[i].attributes);
                } else if (max) {
                    max --;
                    f(results);
                } else {
                    callback({});
                }
            };
        },
        set: function(data, callback) {
            p.save(data, {
                success: function(object) {
                    callback && callback();
                }
            });            
        }
    }
};

// var t = player();
// t.login('wangxiao', function() {
//     t.match(function(data) {
//         console.log(data);
//         t.set({
//             level: 1,
//             score: 60
//         });
//     });
// });
