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

$(function () {
    var stamp = Date.now() + Math.floor(Math.random() * 10000);

    // otazky
    var headlines = { "q1": "Cizinci mezi vězni", "q2": "Potraty", "q3": "Chytré telefony", "q4": "Adopce homosexuálními páry", "q5": "Sociální dávky", "q6": "Alkohol", "q7": "Romové", "q8": "Životní spokojenost" };
    var questions = { "q1": "Kolik procent odsouzených v českých věznicích jsou cizinci?",
        "q2": "Kolik umělých přerušení těhotenství v Česku připadá na 100 živě narozených dětí?",
        "q3": "Kolik procent Čechů starších 16 let používá internet v mobilu?",
        "q4": "Kolik Čechů ze sta si myslí, že homosexuální páry by měly mít právo adoptovat děti z dětských domovů?",
        "q5": "Jaký podíl státního rozpočtu se loni vydal na sociální dávky - podporu v nezaměstnanosti a pomoc v hmotné nouzi?",
        "q6": "Kolik procent Čechů ve věku 15-64 let pije alkohol tolik, že se nachází v kategorii rizikové konzumace?",
        "q7": "Jak velký podíl Čechů hodnotí negativně soužití s Romy?",
        "q8": "Kolik procent Čechů je spokojených se svým životem?"
    };

    for (var i = 1; i <= 8; i++) {
        $("#quiz").append('<h3>' + i + '. ' + headlines["q" + i] + '</h3>');
        $("#quiz").append('<div>' + questions["q" + i] + '</b>');
        $("#quiz").append('<div id="q' + i + '" class="slider"><div id="q' + i + 'handle" class="ui-slider-handle handle"></div></div>');
        $("#quiz").append('<div class="button disabled" id="buttonq' + i + '">Potvrdit</div>');
        $("#quiz").append('<div id="chartq' + i + '" style="width: 100%; margin: 0 auto"></div>');
        $("#quiz").append('<div class="result" id="resq' + i + '"></div>');

        $("#q" + i).slider({
            min: 0,
            max: 100,
            step: 1,
            value: 50,
            create: function create() {
                $(this).children().text($(this).slider("value"));
            },
            slide: function slide(event, ui) {
                $(this).children().text(ui.value);
                $(this).next().removeClass("disabled");
            }
        });
    };

    $(".button").click(function () {
        if (!$(this).hasClass("disabled")) {

            var qid = $(this).prev().attr('id');
            var val = $("#" + qid + "handle").text();
            $(this).text("Čekejte...");
            $.ajax({
                url: "https://lvehmkssr1.execute-api.eu-central-1.amazonaws.com/prod",
                type: "POST",
                crossDomain: !0,
                contentType: "application/json",
                data: JSON.stringify({ "qid": qid, "val": val }),
                dataType: "json",
                success: function success(response) {
                    delete response.qid;
                    console.log(response);
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

                    var data = Object.keys(response).map(function(e) {
                      return response[e]
                    })
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
                            data: data
                        }]
                    });
                    var pct = " %";
                    $("#res" + qid).html("Váš tip byl <b>" + val + pct + "</b>. Čtenáři v průměru tipují <b>" + Math.round(avg) + pct + "</b>.");
                }
            });
        }
    });
});