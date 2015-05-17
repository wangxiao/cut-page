(function(){




    // setTimeout(function(){
    //     p.match(function(matchUser){
    //         console.log(matchUser);
    //         //alert('找到万家了，3秒后开始游戏!');
    //         $('.pkuser-avatar').addClass('scalein');
    //         $('.pking').addClass('scalein-lazy');
    //         $('.vsfinding').addClass('scaleout');


    //         setTimeout(function(){
    //             $('.stage-show').addClass('stage-out').remove('stage-show');
    //             $('.stage-battle').addClass('stage-show');
    //         }, 1200)
    //     })
    // }, 2000)

    var stage = (function(){

        return {
            switchTo: function(stageName){
                var stage = $('.stage-' + stageName );
                if(stage.hasClass('stage-show')) {
                    return;
                }
                $('.stage-show').addClass('stage-out').removeClass('stage-show');
                $('.stage-' + stageName ).addClass('stage-show').removeClass('stage-out');

                $('body').trigger('stage.change', stageName);
            }
        }
    })();


    var game = (function(){
        return {
            init: function(){
                stage.switchTo('login');
                this._initEvents();
            },
            _initEvents: function(){
                var self = this;
                $('body').on('click', '.start-btn', function(){
                    var nickname = $('.nickname').val();

                    if(/^(\s)?$/.test(nickname)) {
                        alert('请输入昵称!');
                        return;
                    }
                    console.log('nickname', nickname);
                    self.nickname = nickname;
                    self.playsocket = player();
                    $('.user-nickname').html(nickname);
                    stage.switchTo('scaning');

                    setTimeout(function(){
                        self._checkMatchUser();
                    }, 2000);
                });


                $('body').on('stage.change', function(e, stage){
                    switch(stage) {
                        case "battle":
                            game.initGame();
                        break;
                    }
                });
            },

            _checkMatchUser: function(){
                var self = this;
                console.log("_checkMatchUser");
                function _getOnlineUser(){
                    self.playsocket.off && self.playsocket.off('start');

                    self.playsocket.login(self.nickname, function(){
                    });

                    if(typeof self.playsocket.on == 'function') {
                        console.log('self.playsocket.on start');
                        self.playsocket.on('start', function(e, data){
                            var maps = data.maps;
                            var user = data.user;
                            self.showMatchUser(user);
                        });

                        // debug用
                        setTimeout(function(){
                            self.showMatchUser({name: 'TEST'})
                        }, 500)
                    } else {
                        setTimeout(function(){
                            self.showMatchUser({name: 'TEST'})
                        }, 2000)
                    }
                }
                _getOnlineUser();
            },

            showMatchUser: function(user){
                console.log('showMatchUser');
                $('.pkuser-avatar').addClass('scalein');
                $('.pking').addClass('scalein-lazy');
                $('.vsfinding').addClass('scaleout');

                //留时间给效果展示
                setTimeout(function(){
                    stage.switchTo('battle');
                }, 1200)
            },

            initGame: function(){
                 var game = jcuts.createGame({
                    edges: 5,
                    container: '#game-container',
                    onchange: function() {
                        var shape = this.getShape();
                        // pager.render(shape);
                    }
                });
            }
        }
    })();

    game.init();

})();

