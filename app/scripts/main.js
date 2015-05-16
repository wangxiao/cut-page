(function(){
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
})();

