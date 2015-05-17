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

                    $('.ready').css({
                        display: 'block'
                    });
                    $('.go').css({
                        display: 'block'
                    });

                    $('.ready').addClass('ready-out');
                    $('.go').addClass('go-out');

                    setTimeout(function(){
                        var paper = jcuts.createRender({
                            container: '#preview-container'
                        });
                        paper.render(shape);
                        self.paper = paper;
                        self.initCountDownTip(options.observeTime);

                        $('.ready').css({
                            display: 'none'
                        });
                        $('.go').css({
                            display: 'none'
                        });
                    }, 1800)
                },
                begin: function(){
                    var self = this;
                    var options = self.options;

                    //self.paper.free();

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
                    }, 3000);

                    self._playCountdown(options.playTime);

                    setTimeout(function(){
                        self.end();
                    }, options.playTime*1000)
                },
                end: function(){

                    var self = this;
                    var options = self.options;

                    var shape = self.game.getShape();
                    var score = jcuts.diffShape?jcuts.diffShape(self.shape, shape):Math.random();

                    self.game.free();
                    self.paper2 = jcuts.createRender({
                        container: '#game-container'
                    });
                    self.paper2.render(shape);

                    setTimeout(function(){
                        $('body').trigger('level.end', {score: score, shape: shape});
                    }, 3000);
                },
                initCountDownTip: function(count){
                    var self  = this;
                    var options = self.options;


                    count = count || 10;
                    $('.action-tip').removeClass('tip-hide').addClass('tip-show');
                    function _countdown(){

                        $('.action-tip').html('<b>'+count+'</b><br />剪出右下角图案，'+options.observeTime+'秒观察时间');
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
                },

                _playCountdown: function(count){
                    var self  = this;
                    var options = self.options;



                    count = count || 10;
                    $('.getted-scores').css('height', (count/options.playTime*100) + '%');
                    function _countdown(){
                        $('.getted-scores').css('height', (count/options.playTime*100) + '%');
                        if(count > 0 ) {
                            setTimeout(function(){
                                count--;
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
                var self = this;
                stage.switchTo('scaning');

                self.pkuer = null;

                $('.pkuser-avatar').removeClass('scalein');
                $('.pking').removeClass('scalein-lazy');
                $('.vsfinding').removeClass('scaleout');

                $('.win').removeClass('win-in');
                $('.lose').removeClass('lose-in');

                $('.pkuser-name').html('');

                game._checkMatchUser();
            },
            _initEvents: function(){
                var self = this;
                $('body').on('touchstart', '.start-btn', function(){
                    var nickname = $('.nickname').val();

                    if(/^(\s)?$/.test(nickname)) {
                        nickname = 'U' + Math.floor(Math.random()*1000%61);
                    }
                    console.log('nickname', nickname);
                    self.nickname = nickname;
                    self.playsocket = player();
                    $('.user-nickname').html(nickname);
                    stage.switchTo('scaning');

                    setTimeout(function(){
                        game._checkMatchUser();
                    }, 10);
                });

                $('body').on('touchstart', '.play-again', function(){
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

                $('#my-paper').empty();
                $('#pk-paper').empty();

                var p1 = jcuts.createRender({
                    container: '#my-paper'
                });
                p1.render({
                    "edges":game.levels[0].edges,
                    "base":game.levels[0].base || {},
                    "polygon":mydata.levels[0].polygon});

                var p2 = jcuts.createRender({
                    container: '#pk-paper'
                });
                p2.render({
                    "edges":game.levels[0].edges,
                    "base":game.levels[0].base || {},
                    "polygon":pkerdata.levels[0].polygon});

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
                            if(maps[0] && maps[0].edges) {
                                self.levels = maps;
                            } else {
                                self.levels = [{"edges":6,"base":{"center":[250,450],"radius":400},"polygon":[[151.0132645212032,63.6296694843727],[146.47238195899175,63.6296694843727],[250,450],[305.04704990042353,244.56161296484032],[284,217],[220,141],[182,97]]}]
                            }

                            self.showMatchUser(user);
                        });


                        self.playsocket.on('end', function(e, data){
                            game.endtimer && clearTimeout(game.endtimer);
                            game._handleResult(data)
                        });

                        //debug用
                        var debuguser = setTimeout(function(){
                            self.levels = [{"edges":6,"base":{"center":[250,450],"radius":400},"polygon":[[151.0132645212032,63.6296694843727],[146.47238195899175,63.6296694843727],[250,450],[305.04704990042353,244.56161296484032],[284,217],[220,141],[182,97]]}];
                            self.showMatchUser({name: '机器人A', debug: true})
                        }, 4000)
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
                }, 2200)
            },

            initGame: function(){

                var levels = this.levels;

                var _currentLevel = 0;
                function _initLevel(){
                    level.init(levels[_currentLevel], {
                        // observeTime: 10,
                        // playTime: 10
                    });
                }

                var levelResult = [];

                $('#game-container').empty();

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

                            $('body').on('game.end',function(e, data){
                                game.endtimer = setTimeout(function(){
                                    var levels = data.levels;
                                    var pkresults = levels.map(function(item){
                                        var newitem = $.extend({}, item, {
                                            score: Math.random()
                                        });
                                        return newitem;
                                    });

                                    game._handleResult({
                                        results: [
                                            {
                                                levels:levels,
                                                name: game.nickname
                                            },

                                            {
                                                levels:pkresults,
                                                name: self.pkuer.name
                                            }
                                        ]
                                    })
                                }, 6000);

                            });

                            $('body').trigger('game.end',{levels:levelResult});
                        }


                    }
                });

                _initLevel();
            }
        };


    })();

    game.init();



})();

