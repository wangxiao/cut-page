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

    var level = (function(){

            return {
                init: function(shape, options){
                    var self = this;
                    self.options = $.extend({
                        observeTime: 10,
                        playTime: 20,
                    }, options|| {});

                    self.shape = shape;

                    $('.ready').addClass('ready-out');
                    $('.go').addClass('go-out');

                    setTimeout(function(){
                        var paper = jcuts.createRender({
                            container: '#game-container'
                        });
                        paper.render(shape);
                        self.paper = paper;
                        self.initCountDownTip(2);
                    }, 1800)
                },
                begin: function(){
                    var self = this;
                    var options = self.options;

                    self.paper.free();

                    self.game = jcuts.createGame({
                        edges: self.shape.edges,
                        fill:'#ffffff',
                        stroke: 'none',
                        container: '#game-container',
                        onchange: function() {
                            var shape = this.getShape();
                        }
                    });

                    $('.action-tip').html('<b></b><br />本局游戏请在'+ options.playTime +'秒内完成！');
                    $('.action-tip').removeClass('tip-hide').addClass('tip-show');

                    setTimeout(function(){
                        $('.action-tip').removeClass('tip-show').addClass('tip-hide');
                    }, 3000)

                    setTimeout(function(){
                        self.end();
                    }, options.playTime*1000)
                },
                end: function(){

                    var self = this;
                    var options = self.options;

                    var shape = self.game.getShape();
                    var score = jcuts.diffPolygon(self.shape.polygon, shape);
                    self.game.free();
                    self.paper = jcuts.createRender({
                        container: '#game-container'
                    });
                    self.paper.render(shape);

                    setTimeout(function(){
                        $('body').trigger('level.end', {score: Math.random() || score, shape: shape});
                    }, 3000);
                },
                initCountDownTip: function(count){
                    var self  = this;
                    var options = self.options;


                    count = count || 10;
                    $('.action-tip').removeClass('tip-hide').addClass('tip-show');
                    function _countdown(){
                        
                        $('.action-tip').html('<b>'+count+'</b><br />观察图案'+ options.observeTime +'秒钟并记住他');
                        count--;

                        if(count < 0) {
                            $('.action-tip').removeClass('tip-show').addClass('tip-hide');
                            self.begin();
                        } else {
                            setTimeout(function(){
                                _countdown();
                            }, 1000)
                        }
                    }
                    _countdown();
                }
            }
        })();


    var game = (function(){
        return {
            init: function(){
                stage.switchTo('login');
                this._initEvents();
            },

            reset: function(){
                stage.switchTo('scaning');
                self._checkMatchUser();
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

                $('body').on('click', '.play-again', function(){
                    game.reset();
                });


                $('body').on('stage.change', function(e, stage){
                    switch(stage) {
                        case "battle":
                            game.initGame();
                        break;
                    }
                });
            },

            _handleResult: function(data){
                stage.switchTo('result');

                var results = data.results;

                var mydata = results[0];
                var pkerdata = results[1];

                $('.left').removeClass('winner').html(mydata.name);
                $('.right').removeClass('winner').html(pkerdata.name);

                console.log(mydata, pkerdata);

                var myscores = 0;
                mydata.levels && mydata.levels.forEach(function(level){
                    myscores += level.score;
                })

                var pkerscore = 0;
                pkerdata.levels && pkerdata.levels.forEach(function(level){
                    pkerscore += level.score;
                });

                console.log(myscores, pkerscore);

                if(myscores > pkerscore) {
                    $('.left').addClass('winner');
                    $('.win').addClass('win-in');
                } 
                if(myscores < pkerscore) {
                    $('.right').addClass('winner');
                    $('.lose').addClass('lose-in');
                }

                // results.forEach(function(item){
                //     var maps = item.maps;
                //     var user = item.user;

                //     var score = user.score;
                //     var shape = user.shape;

                //     console.log(maps, score, user. shape);
                // }); 
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
                            debuguser && clearTimeout(debuguser);
                            var maps = data.maps;
                            var user = data.user;
                            console.log(maps, user);
                            self.levels = [{"edges":6,"base":{"center":[250,450],"radius":400},"polygon":[[151.0132645212032,63.6296694843727],[146.47238195899175,63.6296694843727],[250,450],[305.04704990042353,244.56161296484032],[284,217],[220,141],[182,97]]}] || maps;
                            self.showMatchUser(user);
                        });


                        self.playsocket.on('end', function(e, data){

                            game._handleResult(data)
                        });

                        //debug用
                        var debuguser = setTimeout(function(){
                            self.levels = [{"edges":6,"base":{"center":[250,450],"radius":400},"polygon":[[151.0132645212032,63.6296694843727],[146.47238195899175,63.6296694843727],[250,450],[305.04704990042353,244.56161296484032],[284,217],[220,141],[182,97]]}];
                            self.showMatchUser({name: '机器人A', debug: true})
                        }, 10000)
                    } else {
                        setTimeout(function(){
                            self.showMatchUser({name: 'TEST'})
                        }, 2000)
                    }
                }
                _getOnlineUser();
            },

            showMatchUser: function(user){
                self.pkuer = user;
                console.log('showMatchUser');
                $('.pkuser-avatar').addClass('scalein');
                $('.pking').addClass('scalein-lazy');
                $('.vsfinding').addClass('scaleout');

                $('.pkuser-name').html(user.name);

                //留时间给效果展示
                setTimeout(function(){
                    stage.switchTo('battle');
                }, 1200)
            },

            initGame: function(){

                var levels = this.levels;
                
                var _currentLevel = 0;
                function _initLevel(){
                    level.init(levels[_currentLevel], {
                        observeTime: 3,
                        playTime: 6
                    });
                }

                var levelResult = [];

                $('body').on('level.end', function(e, levelData){

                    levelResult[_currentLevel] = levelData;

                    _currentLevel++;
                    if(_currentLevel < levels.length) {
                        _initLevel();
                    } else {
                        if(self.pkuer.debug) {
                            var pkresults = levelResult.map(function(item){
                                var newitem = $.extend({}, item, {
                                    score: Math.random()
                                });
                                return newitem;
                            });

                            game._handleResult({
                                results: [
                                    {
                                        levels:levelResult,
                                        name: game.nickname
                                    },

                                    {
                                        levels:pkresults,
                                        name: self.pkuer.name
                                    }
                                ]
                            })
                        } else {
                            game.playsocket.end({levels:levelResult});
                        }
                        
                        
                    }
                });

                _initLevel();
            }
        };

        
    })();

    game.init();
    
})();

