function get_image_url(title, getData) {
    var apikey = "039ca5944d2fb2ccdc3e1bac636d5388";
    $.ajax({
        url: 'https://apis.daum.net/search/image',
        dataType: 'jsonp',
        type: 'GET',
        data: {
            'apikey': apikey,
            'q': title,
            'output': 'json'
        },
        success: function (result) {
            if(result['channel']['item'].length > 0)
            {
                getData(result['channel']['item'][0]['image']);
            }
        }
    });
}

function apply_mansonry() {
    var container = document.querySelector('#display_news');
    var msnry = new Masonry( container, {
      // options
      columnWidth: 290,
      itemSelector: '.card'
    });
}
function getNews(page, regdate) {
    page = typeof page !== 'undefined' ? page : '1';
    regdate = typeof regdate !== 'undefined' ? regdate : '';
    ga('send', 'event', 'getNews', 'getNews(page='+page+', regdate='+regdate+')');
    $.ajax({
        url:'http://media.daum.net/api/service/news/list/important/media.jsonp',
        dataType:'jsonp',
        type:'GET',
        data:{'page':page,
              'regdate':regdate
        },
        success:function(result){
            var values = new Array();
            $.each(result['simpleNews'], function(index, value) {
                var custom_imageUrl = value['imageUrl'];
                var img_display = "none";
                if(custom_imageUrl) {
                    img_display = "block";
                }
                else {
                     get_image_url(value['title'], function(output){
                            custom_imageUrl = output;
                        }
                    );
                }
                values.push({
                    newsId: value['newsId'],
                    title: value['title'],
                    imageUrl: custom_imageUrl,
                    imageDisplayOption : img_display,
                    contents: value['contents'],
                    modiDt: value['modiDt'],
                    cpKorName: value['cpKorName'],
                });
                //getClickCount(value['newsId']);
            });
            $('#news_template').tmpl(values).appendTo('#display_news')
        }
    });
    //apply_mansonry();
}

function getClickCount(id) {
    $.ajax({url: '/getClickCount/'+id, dataType:'text', success: function(result){
            //console.log(result)
            $("#"+id+" > div > div > div > i").text(result);
            if( result > 3 ) {
                result = 5;
            }
            $("#"+id).css('border', result+'px solid #f05f40');
        }
    });
}

$(document).ready(function() {

    window.scrollTo(0,0);

    var page = 1;
    var regdate = '';

    getNews(page, regdate);
    page = page+1;

    //page_event
    $('.segment')
      .visibility({
        once: false,
        // update size when new content loads
        observeChanges: true,
        // load content on bottom edge visible
        onBottomVisible: function() {
          // loads a max of 5 times
          getNews(page, regdate);
          page = page+1;
        }
      })
    ;

    //auto_refresh
    refresh_time = 180000
    refresh_interval = setInterval(auto_refresh, refresh_time);
});

function auto_refresh() {
    $("#freeow").freeow("10초 뒤 새로고침합니다", refresh_time/60000+"분 동안 스크롤 움직임 감지안됨", {
        classes: ["smokey", "slide"],
        autoHide: true,
        autoHideDelay: 10000,
        hideStyle: {opacity: 0, left: "400px"},
        showStyle: {opacity: 1, left: 0}
    });
    refresh_event = window.setTimeout(window.location.reload.bind(window.location), 11000)
}

function clear_refresh(){
    if(typeof refresh_event != 'undefined') {
        clearTimeout(refresh_event);
        delete refresh_event;
        $("#freeow").freeow("새로고침 예약이 해제되었습니다", "스크롤 움직임 감지", {
            classes: ["smokey", "slide"],
            autoHide: true,
            autoHideDelay: 10000,
            hideStyle: {opacity: 0, left: "400px"},
            showStyle: {opacity: 1, left: 0}
        });
    }
    if(typeof refresh_interval != 'undefined') {
        clearInterval(refresh_interval);
        refresh_interval = setInterval(auto_refresh, refresh_time);
    }
}

function click_news(id) {
    //console.log("click "+id);
    $.ajax({
        url: '/click/'+id,
    });
    var count = $("#"+id+" > div > div > div > i").text() *1
    $("#"+id+" > div > div > div > i").text(count+1);

    if(typeof refresh_interval != 'undefined') {
        clearInterval(refresh_interval);
        refresh_interval = setInterval(auto_refresh, refresh_time*2);
    }
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-46873354-3', 'auto');
ga('send', 'pageview');