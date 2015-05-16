(function(){
    var p = player();
    p.login('test');
    $('body').on('click', '.start-btn', function(){
        var p = player();
        p.login('test', function(){
            $('.stage-show').addClass('stage-out').remove('stage-show');
            $('.stage-scaning').addClass('stage-show');

            setTimeout(function(){
                p.match(function(matchUser){
                    console.log(matchUser);
                    //alert('找到万家了，3秒后开始游戏!');
                })
            }, 2000)
        })
    });


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

    
})();

