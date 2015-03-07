jQuery(function($) {

  // socket.io
  var socket = window.io ? io.connect() : {
    on: function() {},
    emit: function() {}
  };
  var userId = '0';

  // トイレ所有者から返答があった時
  socket.on('owner.response', function(data) {
    console.log(data);

    var $li = $('#main-cards li[data-user-id="' + data.userId + '"]');
    setStatus($li, data.result ? 'allow' : 'deny');

    // ここへ行く
    if (data.result) {

      var pos = $li.attr("data-position");
      $li.children(".card")
        .append('<div class="map" style="background-image:url(https://maps.googleapis.com/maps/api/staticmap?center='+pos+'&zoom=15&size=400x200&markers='+pos+')"></div>');


      $li.find(".map").append($("<button />").addClass("go").html('<span class="glyphicons pin"></span>今から行く').on({"click":function(){

        if (!confirm('ここへ行きますか？')) return;

        if (!confirm('本当に行きますか？')) return;

        var currentPos = geolocation.result.coords.latitude + "," + geolocation.result.coords.longitude;

        //window.open("https://www.google.co.jp/maps/dir/"+currentPos+"/"+currentPos+"/@"+pos+",16z");

        //window.open("https://www.google.co.jp/maps/dir///@"+pos+",19z?hl=ja");
        window.location = "comgooglemaps://q="+pos+"&center="+pos;


        socket.emit('user.thankYou', {
          target: data.source,
          userId: userId
        });
      }})).append($("<button />").addClass("info").html('<span class="glyphicons eye_open"></span>詳細を見る').on({"click":function(){
        /**/
        window.open("http://unterest.cloudapp.net/toilet360/");
      }}));

      $li.on({'click': function() {
        $(this).children(".card").toggleClass("open");
      }});
    }
  });

  function setToiletCount(arg) {
    var $counter = $("#toilet-count").children(".counter");
    var i = 0;
    var interval = setInterval(function() {

      var tmp = Math.round(arg - (arg - (i++ * 2)));

      if (tmp >= arg) {
        $counter.text(arg);
        clearInterval(interval);
        setTimeout(function() {
          $("img.mark").animate({
            "opacity": 1
          });
        }, 300)
      } else {
        $counter.text(tmp);
      }

    }, 30);
  }

  function setStatus($el, status) {
    $el.removeClass("deny allow");
    $icon = $el.find(".glyphicons");

    $icon.removeClass("mode remove ok");
    if (status == "allow") {
      $el.addClass("allow");
      $icon.addClass("ok");
    } else if (status == "deny") {
      $el.addClass("deny");
      $icon.addClass("remove");
    } else {
      $icon.addClass("more");
    }
  }

  var Geokit = function(callback) {
    this.status = undefined;
    this.result = false;
    return false;
  }

  Geokit.prototype.done = function(pos) {
    this.status = "success";
    console.log(this.status, this);
    console.log("done:", pos, status);
    this.result = pos;
  }

  Geokit.prototype.fail = function(a) {
    this.status = false;
  }

  Geokit.prototype.get = function(callback) {
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        geolocation.done(pos);
        callback.call(this);
      },
      function(pos) {
        geolocation.fail(pos);
      });
  }


  var geolocation = new Geokit();

  var $entrance = $("#entrance");
  $entrance.find("button").on({
    "click": function() {
      $entrance.addClass("progress");
      geolocation.get(function() {
        $entrance.fadeOut();

        if (!!window.location.host.match("localhost")) {
          var url = "/api/toilet/@35.72518644882094,139.7632000846558";
          var sturl = '//maps.googleapis.com/maps/api/streetview?size=960x480&location=35.666087999999995,139.73195339999998&heading=235&sensor=false';
        } else {
          var url = "/api/toilet/@" + geolocation.result.coords.latitude + "," + geolocation.result.coords.longitude;
          var sturl = '//maps.googleapis.com/maps/api/streetview?size=960x480&location='+ geolocation.result.coords.latitude + "," + geolocation.result.coords.longitude + '&heading=235&sensor=false'
        }

        $vis = $(".visual.streetview");
        $vis.find("img").fadeOut(function(){
          var $img = $("<img />").attr('src',sturl).hide();
          $vis.append($img);
          $img.fadeIn()
        })


        $.ajax({
          url: url,
          dataType: "JSON",
          cache: false,
          success: function(data, textStatus) {
            setToiletCount(data.length);
          },
          error: function(xhr, textStatus, errorThrown) {

          }
        });

      });
    }
  });

  $(window).on({
    "resize": function() {
      var fullHeight = $(window).height() - $("#global-header").height() - $("#global-footer").height();
      console.log(fullHeight);
      $("#mainvisual.fullHeight").height(fullHeight)
    }
  }).trigger("resize");

  $(".buttonCommon").on({
    "click": function() {

      if ($("#mainvisual.fullHeight").length != 0) {


        $("#mainvisual.fullHeight").height("").removeClass("fullHeight")
        $(this).removeClass("mainvisualCenter");

        if (!!window.location.host.match("localhost")) {
          var url = "/api/toilet/@35.72518644882094,139.7632000846558";
        } else {
          var url = "/api/toilet/@" + geolocation.result.coords.latitude + "," + geolocation.result.coords.longitude;
        }


        $.ajax({
          url: url,
          dataType: "JSON",
          cache: false,
          success: function(data, textStatus) {
            console.log("done:", data)
            setTimeout(function() {
              $.each(data, function(i, item) {

                var $li = $("<li />")
                  .addClass("fullsize")
                  // 後で返答を受けた時に検索するために付ける
                  .attr('data-user-id', item.id)
                  .attr('data-socket-id', item.source)
                  .attr('data-position', item.toilet.geolocation[1]+","+item.toilet.geolocation[0])
                  .html('<div class="card"><span class="glyphicons more"></span>' + this.distance.toFixed(1) + ' m</div>')
                  .css("opacity", 0);
                $("#main-cards").append($li);
                setTimeout(function() {
                  $li.animate({
                    "opacity": 1
                  });
                }, i * 50);

              })

              // トイレ所有者にメッセージを送る
              socket.emit('user.help', {
                geolocation: {
                  lat: geolocation.result.coords.latitude,
                  lng: geolocation.result.coords.longitude
                },
                userId: userId
              });

            }, 300)
          },
          error: function(xhr, textStatus, errorThrown) {
            console.log("isError")
          }
        });
      } else {
        $("#mainvisual").addClass("fullHeight");
        $(this).addClass("mainvisualCenter");
        $(window).trigger("resize");
        $("#main-cards").children("li").fadeOut(function() {
          $(this).remove()
        });

        // キャンセルを通知
        socket.emit('user.cancel', {
          userId: userId
        });
      }
    }
  });

  $(window).on({
    "scroll": function() {

      $(".visual.streetview img").css("marginTop", (function() {

        return ($(this).scrollTop() / $(window).height() * 30) - 15 + "%"

      })());
    }
  });
});
