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
                    self.paper = jcuts.createRender({
                        container: '#game-container'
                    });
                    self.paper.render(shape);

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
                            console.log(maps, user);
                            self.levels = [{"edges":5,"polygon":[[238.42141923067115,214.36479258238256],[216.90105608615227,148.13192521846366],[238,120],[251,104],[262,92],[270,82],[273,79],[275,77],[273,77],[259,69],[236.8928721783263,59.788696740969286],[311.8033988749895,59.7886967409693],[301.91164764499814,90.23237665534683],[275,119],[263,134],[255,142],[245,154],[244,154],[244,155],[243,155],[243,157],[244,157],[247,160],[250,166],[255,172],[260,181],[267,196],[267.26195218355235,196.87317394517453],[259.08713459029286,222.03267547135982],[243,216]]}] || maps;
                            self.showMatchUser(user);
                        });


                        self.playsocket.on('end', function(e, data){

                            stage.switchTo('result');

                            var results = data.results;
                            console.log(arguments);

                            var mydata = results[0];
                            var pkerdata = results[1];

                            $('.left').html(mydata.name);
                            $('.right').html(pkerdata.name);

                            var myscores = 0;
                            mydata.levels.forEach(function(level){
                                myscores += level.score;
                            })

                            var pkerscore = 0;
                            pkerdata.levels.forEach(function(level){
                                pkerscore += level.score;
                            })

                            // results.forEach(function(item){
                            //     var maps = item.maps;
                            //     var user = item.user;

                            //     var score = user.score;
                            //     var shape = user.shape;

                            //     console.log(maps, score, user. shape);
                            // }); 
                        });

                        //debug用
                        // setTimeout(function(){
                        //     self.showMatchUser({name: 'TEST'})
                        // }, 200)
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

                var levels = this.levels;
                
                var _currentLevel = 0;
                function _initLevel(){
                    level.init(levels[_currentLevel], {
                        observeTime: 3,
                        playTime: 5
                    });
                }

                var levelResult = [];

                $('body').on('level.end', function(e, levelData){

                    levelResult[_currentLevel] = levelData;

                    _currentLevel++;
                    if(_currentLevel < levels.length) {
                        _initLevel();
                    } else {
                        game.playsocket.end({levels:levelResult});
                        
                    }
                });

                _initLevel();
            }
        };

        
    })();

    game.init();

})();

