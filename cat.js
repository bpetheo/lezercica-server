$(function () {
    var cursor = {x: 0, y: 0};
    var $cat = $("#cat");
    var $catImg = $('div', $cat);

    var LOOKING_DIRECTION = {
        TOP_LEFT: 1,
        TOP_RIGHT: 2,
        BOTTOM_LEFT: 3,
        BOTTOM_RIGHT: 4
    }

    var cat = {
        left: $cat.position().left,
        top: $catImg.position().top,
        center: 0,
        width: $cat.width(),
        sprite: getSpriteNumber(),
        headRight: $cat.hasClass('flip'),
        lastSittingLeft: null,
        stamina: 400,
        lazy: false,
        moving: false,
        tired: false,
        sitting: false,
        sniffing: false,
        standingUp: false,
        lookingUp: false,
        lookingDirection: null // 1: bal fel, 2: jobb fel, 3: bal le, 4: jobb le
    };


    function iteration() {
        cat.left = $cat.position().left;
        cat.top = $catImg.position().top;
        cat.sprite = getSpriteNumber();
        cat.headRight = $cat.hasClass('flip');
        cat.sitting = isSitting();
        cat.sniffing = isSniffing();
        cat.center = (cat.width / 2) + cat.left;
        cat.lookingUp = (($(document).height() - cursor.y) - 100 > cat.top);
        cat.lazy = isLazy();
        cat.tired = canSitDown();

        var lookingHigh = (($(document).height() - cursor.y) - 200 > cat.top);
        if (cat.headRight) {
            if (cursor.x > cat.left + cat.width) {
                cat.lookingDirection = lookingHigh ? LOOKING_DIRECTION.TOP_LEFT : LOOKING_DIRECTION.BOTTOM_LEFT;
            } else {
                cat.lookingDirection = lookingHigh ? LOOKING_DIRECTION.TOP_RIGHT : LOOKING_DIRECTION.BOTTOM_RIGHT;
            }
        } else {
            if (cursor.x < cat.left) {
                cat.lookingDirection = lookingHigh ? LOOKING_DIRECTION.TOP_LEFT : LOOKING_DIRECTION.BOTTOM_LEFT;
            } else {
                cat.lookingDirection = lookingHigh ? LOOKING_DIRECTION.TOP_RIGHT : LOOKING_DIRECTION.BOTTOM_RIGHT;
            }
        }

        var offset = 3;
        var acceleration = Math.abs(Math.floor((cursor.x - cat.center) / 4));
        if (acceleration > 60) {
            acceleration = 60;
        }
        if(cat.tired && acceleration > 30){
            acceleration = 30;
        }

        // moving
        if (!cat.sitting && !cat.standingUp && !cat.lazy) {
            if (cursor.x < cat.center - offset) {
                // moving left

                cat.moving = true;
                cat.headRight = false;
                cat.stamina--;
                $cat.css({
                    'left': cat.left - acceleration
                });
            } else if (cursor.x > cat.center + offset) {
                // moving right

                cat.moving = true;
                cat.headRight = true;
                cat.stamina--;
                $cat.css({
                    'left': cat.left + acceleration
                });
            }
        }
        cat.tired = canSitDown();
        if ((Math.abs(cat.center - cursor.x) < cat.width)) {
            if ((Math.abs(cat.center - cursor.x) < offset * 2)) {
                // not moving - sitting down

                cat.sniffing = false;
                if (cat.tired) {
                    if (!cat.sitting) {
                        setSprite(43);
                    } else if (cat.sprite < 48) {
                        setSprite(cat.sprite + 1);
                    }
                }
            } else if (!cat.tired) {

                cat.moving = false;
                cat.sniffing = true;
                cat.sitting = false;

                var rangeMax = 100;
                var range = Math.abs(cat.center - cursor.x);
                range = range > rangeMax ? rangeMax : range;
                var sprites = [67, 69, 70, 71, 72].reverse();
                var spriteNum = Math.floor(range / (rangeMax / (sprites.length - 1)));
                console.log(range);

                setSprite(sprites[spriteNum]);
                //console.log(spriteNum, sprites[spriteNum], range);
                //console.log(cat.stamina);

                cat.headRight = cursor.x > cat.center;
            }
        }


        if (cat.moving) {
            if (cat.sitting) {
                cat.standingUp = true;
            }
            if (acceleration > offset) {
                // walking

                if (cat.sprite > 10 && !cat.sitting && !cat.standingUp) {
                    cat.sprite = 0;
                }
                if (!cat.sitting && !cat.sniffing) {
                    cat.standingUp = false;
                    cat.lastSittingLeft = null;
                }
                if (cat.standingUp) {
                    if (cat.sprite === 43) {
                        cat.sitting = false;
                        cat.standingUp = false;
                        setSprite(1);
                    } else if (cat.sprite > 48) {
                        setSprite(48);
                    } else {
                        setSprite(cat.sprite - 1);
                    }
                }
                if (!cat.standingUp && !cat.sitting && !cat.lazy) {
                    setSprite(cat.sprite + 1);
                }
            } else {
                // slow-mo
            }
        }

        if (cat.lazy && cat.sitting) {
            var sprite = 0;
            switch (cat.lookingDirection) {
                case LOOKING_DIRECTION.BOTTOM_LEFT:
                    sprite = 77;
                    break;
                case LOOKING_DIRECTION.TOP_LEFT:
                    sprite = 78;
                    break;
                case LOOKING_DIRECTION.TOP_RIGHT:
                    sprite = 79;
                    break;
                case LOOKING_DIRECTION.BOTTOM_RIGHT:
                    sprite = 80;
                    break;
            }
            setSprite(sprite);
        }


        if (cat.headRight) {
            $cat.addClass('flip');
        } else {
            $cat.removeClass('flip');
        }
    }

    function getSpriteNumber() {
        var classes = $('#cat div')[0].classList;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].search('sprite-') > -1) {
                return parseInt(classes[i].substr(classes[i].indexOf('-') + 1));
            }
        }
    }

    function setSprite(num) {
        cat.sprite = num;
        var $catImg = $('#cat div');
        var classes = $catImg[0].classList;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].search('sprite-') > -1) {
                $catImg.removeClass(classes[i]);
                $catImg.addClass('sprite-' + num);
            }
        }
    }

    function isSitting() {
        if (!cat.tired) {
            return false;
        }
        if (cat.lazy) {
            return true;
        }
        var sitting = ($.inArray(cat.sprite, [43, 44, 45, 46, 47, 48])) > -1;
        if (sitting && !cat.lastSittingLeft) {
            cat.lastSittingLeft = $cat.position().left;
        }
        return sitting;
    }

    function isSniffing() {
        return ($.inArray(cat.sprite, [67, 68, 69, 70, 71])) > -1;
    }

    function isLazy() {
        if (cat.lastSittingLeft) {
            return (
                ((cat.lastSittingLeft - cat.width) < cursor.x) &&
                ((cat.lastSittingLeft + (cat.width * 2)) > cursor.x)
                );
        }
        return false;
    }

    function canSitDown() {
        if (cat.stamina < 0) {
            cat.stamina = 0;
        }
        return cat.stamina <= 60;
    }

    $(document).on('mousemove', function (event) {
        setCursor(event.pageX, event.pageY);
    });

    var socket = io('http://192.168.62.208');
    socket.on('cursorMove', function (data) {
        console.log(data);
        if(typeof data === 'string'){
            data = JSON.parse(data);
        }
         setCursor(
         $(document).width() * (data.positions[0].x / 100),
         $(document).height() * (data.positions[0].y / 100)
         );
    });

    function setCursor(x, y) {
        cursor.x = x;
        cursor.y = y;
        /*$("#cursor").css({
         "top": x + '%',
         "left": y + '%'
         });*/
    }

    setInterval(iteration, 60);
});
