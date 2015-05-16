AV.initialize("7f69g7feabv7lts11vtjlu13q5ngrtab0hs426535nh2eotl", 
    "plvj3ewitm5k3wamysd593tp2l9f61bp6o4ma6vtxp9j7h5y");

var player = function() {
    var Player = AV.Object.extend('Player');
    var p = new Player();

    function listAll(callback) {
        var query = new AV.Query(Player);
        query.find({
            success: function(results) {
                callback(results);
            }
        });
    }

    return {
        login: function(name, callback) {
            p.save({
                name: name
            }, {
                success: function(object) {
                    callback && callback();
                }
            });
        },
        match: function(callback) {
            listAll(function(results) {
                var i = Math.floor(Math.random() * (results.length - 1));
                callback(results[i].attributes);
            });
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
