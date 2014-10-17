/*var socket = io('http://localhost');
 socket.on('cursorMove', function (data) {
 console.log(data.positions);
 });*/


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
        lazy: false,
        moving: false,
        sitting: false,
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
        cat.center = (cat.width / 2) + cat.left;
        cat.lookingUp = (($(document).height() - cursor.y) - 100 > cat.top);
        cat.lazy = isLazy();

        var lookingHight = (($(document).height() - cursor.y) - 200 > cat.top);
        if (cat.headRight) {
            if (cursor.x > cat.left + cat.width) {
                cat.lookingDirection = lookingHight ? LOOKING_DIRECTION.TOP_LEFT : LOOKING_DIRECTION.BOTTOM_LEFT;
            } else {
                cat.lookingDirection = lookingHight ? LOOKING_DIRECTION.TOP_RIGHT : LOOKING_DIRECTION.BOTTOM_RIGHT;
            }
        } else {
            if (cursor.x < cat.left) {
                cat.lookingDirection = lookingHight ? LOOKING_DIRECTION.TOP_LEFT : LOOKING_DIRECTION.BOTTOM_LEFT;
            } else {
                cat.lookingDirection = lookingHight ? LOOKING_DIRECTION.TOP_RIGHT : LOOKING_DIRECTION.BOTTOM_RIGHT;
            }
        }

        var offset = 3;
        var acceleration = Math.abs(Math.floor((cursor.x - cat.center) / 4));
        if (acceleration > 50) {
            acceleration = 50;
        }

        // moving
        if (!cat.sitting && !cat.standingUp && !cat.lazy) {
            if (cursor.x < cat.center - offset) {
                // moving left

                cat.moving = true;
                cat.headRight = false;
                $cat.css({
                    'left': cat.left - acceleration
                });
            } else if (cursor.x > cat.center + offset) {
                // moving right

                cat.moving = true;
                cat.headRight = true;
                $cat.css({
                    'left': cat.left + acceleration
                });
            }
        }
        if (Math.abs(cat.center - cursor.x) < offset * 2) {
            // not moving - sitting down

            if (!cat.sitting) {
                setSprite(43);
            } else if (cat.sprite < 48) {
                setSprite(cat.sprite + 1);
            }
        }


        if (cat.moving) {
            if (cat.sitting) {
                cat.standingUp = true;
            }
            if (acceleration > offset) {
                // walking

                cat.moving = true;
                if (cat.sprite > 10 && !cat.sitting) {
                    cat.sprite = 0;
                }
                if (!cat.sitting) {
                    cat.standingUp = false;
                    cat.lastSittingLeft = null;
                }
                if (cat.standingUp) {
                    if (cat.sprite === 43) {
                        setSprite(1);
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
        if(cat.lazy){
            return true;
        }
        var sitting = ($.inArray(cat.sprite, [43, 44, 45, 46, 47, 48])) > -1;
        if (sitting && !cat.lastSittingLeft) {
            cat.lastSittingLeft = $cat.position().left;
        }
        return sitting;
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

    $(document).on('mousemove', function (event) {
        cursor.x = event.pageX;
        cursor.y = event.pageY;
    });
    setInterval(iteration, 60);
});
