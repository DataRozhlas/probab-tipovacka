"use strict";

// responsive slider bazmek

!function (a) {
    function f(a, b) {
        if (!(a.originalEvent.touches.length > 1)) {
            a.preventDefault();var c = a.originalEvent.changedTouches[0],
                d = document.createEvent("MouseEvents");d.initMouseEvent(b, !0, !0, window, 1, c.screenX, c.screenY, c.clientX, c.clientY, !1, !1, !1, !1, 0, null), a.target.dispatchEvent(d);
        }
    }if (a.support.touch = "ontouchend" in document, a.support.touch) {
        var e,
            b = a.ui.mouse.prototype,
            c = b._mouseInit,
            d = b._mouseDestroy;b._touchStart = function (a) {
            var b = this;!e && b._mouseCapture(a.originalEvent.changedTouches[0]) && (e = !0, b._touchMoved = !1, f(a, "mouseover"), f(a, "mousemove"), f(a, "mousedown"));
        }, b._touchMove = function (a) {
            e && (this._touchMoved = !0, f(a, "mousemove"));
        }, b._touchEnd = function (a) {
            e && (f(a, "mouseup"), f(a, "mouseout"), this._touchMoved || f(a, "click"), e = !1);
        }, b._mouseInit = function () {
            var b = this;b.element.bind({ touchstart: a.proxy(b, "_touchStart"), touchmove: a.proxy(b, "_touchMove"), touchend: a.proxy(b, "_touchEnd") }), c.call(b);
        }, b._mouseDestroy = function () {
            var b = this;b.element.unbind({ touchstart: a.proxy(b, "_touchStart"), touchmove: a.proxy(b, "_touchMove"), touchend: a.proxy(b, "_touchEnd") }), d.call(b);
        };
    }
}(jQuery);

// mixer otazek
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

$(function () {
    var stamp = Date.now() + Math.floor(Math.random() * 10000);
    // otazky
    var questions = { "q1": "jistě",
     "q2": "každopádně",
     "q3": "určitě",
     "q4": "rozhodně",
     "q5": "nejspíš",
     "q6": "snad",
     "q7": "pravděpodobně",
     "q8": "asi",
     "q9": "možná",
     "q10": "spíše",
     "q11": "vždy",
     "q12": "často",
     "q13": "občas",
     "q14": "vzácně",
     "q15": "nikdy" };
    var divs = [];

    for (var i in questions) {
        i = i.slice(1);
        var div = $("<div class='qdiv" + i + "'>")
        $(div).append('<h3>$QNB. ' + questions["q" + i] + '</h3>');
        $(div).append('<div id="q' + i + '" class="slider"><div id="q' + i + 'handle" class="ui-slider-handle handle"></div></div>');
        $(div).append('<div class="button disabled" id="buttonq' + i + '">Potvrdit</div>');
        $(div).append('<div id="chartq' + i + '" style="width: 100%; margin: 0 auto"></div>');
        $(div).append('<div class="result hiddenresult" id="resq' + i + '"></div>');
        divs.push(div);
    };

    shuffle(divs);

    var nrcount = 1;
    for (div in divs) {
        divs[div][0].innerHTML = divs[div][0].innerHTML.replace("$QNB",nrcount);
        nrcount = nrcount + 1;
        $("#quiz").append(divs[div]);
    }

    for (div in divs) {
        $("#q" + (parseInt(div)+1)).slider({
            min: 0,
            max: 100,
            step: 1,
            value: 50,
            create: function create() {
                $(this).children().text($(this).slider("value") + " %");
            },
            slide: function slide(event, ui) {
                $(this).children().text(ui.value + " %");
                $(this).next().removeClass("disabled");
            }
        });
    }

    $(".button").click(function () {
        if (!$(this).hasClass("disabled")) {

            var qid = $(this).prev().attr('id');
            var val = $("#" + qid + "handle").text().slice(0,-2);
            $(this).text("Čekejte...");
            $.ajax({
                url: "https://lvehmkssr1.execute-api.eu-central-1.amazonaws.com/prod",
                type: "POST",
                crossDomain: !0,
                contentType: "application/json",
                data: JSON.stringify({ "uid": stamp, "qid": qid, "val": val }),
                dataType: "json",
                success: function success(response) {
                    var response = hist[qid];
                    response[val] += 1;

                    $("#" + qid).css("display", "none");
                    $("#button" + qid).css("display", "none");
                    
                    var total = 0;
                    var sum = 0;
                    for (i in response) {
                        total += response[i];
                        sum += i * response[i]
                    }
                    var avg = sum/total;
                    for (i in response) {
                        response[i] = response[i] / total * 100;
                    }

                    for (i = 1; i <= 100; i++) {
                        if (!(i in response)) {
                            response[i] = 0;
                        };
                    };

                    $("#chart" + qid).animate({ height: "200px" });
                    var chart = Highcharts.chart('chart' + qid, {
                        chart: {
                            type: 'column',
                            height: 200
                        },
                        title: {
                            text: null
                        },
                        xAxis: {
                            crosshair: true,
                            plotLines: [{
                                color: "darkblue",
                                dashStyle: "dash",
                                width: 2,
                                value: val
                            }]
                        },
                        legend: {
                            labelFormat: "<span id='darkbluedot'></span>Váš tip",
                            useHTML: true
                        },
                        credits: {
                            enabled: false
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: 'Podíl hlasů'
                            },
                            labels: {
                                format: "{value} %"
                            }
                        },
                        plotOptions: {

                            column: {
                                pointPadding: 0.1,
                                borderWidth: 0,
                                events: {
                                    legendItemClick: function () {
                                        return false; 
                                    }
                                }
                            }
                        },
                        tooltip: {
                            enabled: false
                        },
                        series: [{
                            name: 'otázka xy',
                            data: response
                        }]
                    });
                    var pct = " %";
                    $("#res" + qid).removeClass("hiddenresult")
                    $("#res" + qid).html("Váš tip byl <b>" + val + pct + "</b>. Čtenáři v průměru tipují <b>" + Math.round(avg) + pct + "</b>.");
                }
            });
        }
    });
});