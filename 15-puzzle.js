(function(){
    'use strict';

    function getRandomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function thenIfCondition(array,condition,handler){
        for (var idx = 0; idx < array.length; idx++){
            for(var jdx = 0; jdx < array[idx].length; jdx++){
                var item = array[idx][jdx],
                    value = item;
                if(eval(condition)){
                    handler(array[idx][jdx]);
                }
            }
        }
    }



    function eachMatrix(array, handler){
        for (var idx = 0; idx < array.length; idx++){
            for(var jdx = 0; jdx < array[idx].length; jdx++){
                handler(array[idx][jdx], idx, jdx);
            }
        }
    }

    var FifteenPuzzle = function (selector, opt) {
        var self = this;

        var defaultOptions = {
            //puzzleSize: 16,
            canvasSize: 400,
            matrix: 4,
            callBackAfterVictory: function(){
                alert("you won!");
                return false; // change to true for new game
            },
            fontColor: '#FFFFFF', //white
            puzzleColor: '#f55',//red
           // puzzleColor: '#98AFC7', //blueGray
            backgroundColor: "#333",
            puzzleColorAfter: '#008000',
            border: true,
            puzzleBorderColor: '#FFFFFF', //white,
            puzzleBorderWidth:2

        };

        var options = _.merge({}, defaultOptions, opt);
        var gameOver = true;
        self.selector = selector;

        self.canvas = new fabric.Canvas(selector);
        self.canvas.backgroundColor = options.backgroundColor;
        self.canvas.selection = false;
        self.canvas.setWidth(options.canvasSize);
        self.canvas.setHeight(options.canvasSize);

        var puzzleWidth = options.canvasSize / options.matrix,
            puzzleHeight = puzzleWidth;

        var offset = 2;

        function isEmpty(element){
            return !element.hasOwnProperty('element') || _.isUndefined(element.element) || _.isNull(element.element);
        }

        function afterVictory(){
            gameOver = true;
            if(_.isFunction(options.callBackAfterVictory)){
                if(options.callBackAfterVictory() === true){
                    gameOver = false;
                };

            }
            if(!gameOver){
                instance = newGame(),
                    matrix = instance.matrix,
                    elements = instance.elements;
            }
        }

        function checkSolution(_matrix){

            var counter = 1;
            var N = 0, E = 0;
            var EMPTY = -1;
            var flat = [];

            var isEven = function( num ) {
                return !(num & 1);
            };

            var isOdd = function( num ) {
                return !!( num & 1 );
            };



            for(var idx in _matrix){
                for(var jdx in _matrix[idx]){

                    if(isEmpty(_matrix[idx][jdx])){
                        E = parseInt(idx) + 1;
                    }
                    else {
                        flat.push(parseInt(_matrix[idx][jdx].element._objects[1].text));
                    }

                    //console.log("[i]",counter,":",_matrix[idx][jdx]._objects);
                    counter++;
                }
            }
            for(var i in flat){
                var k = 0;
                var length = flat.length;
                for(var j = i; j < length; j++){
                    if(flat[i] > flat[j]){
                        k++;
                    }
                }
                N +=k;
            }

            N += E;
            // console.log( "N", N);
            // console.log( "E", E);
            return isEven(N);
        }

        function getFreePositon(){
            var _pos;
            eachMatrix(matrix, function(value){
                if (!_.isObject(value.element)){
                    _pos = value;
                }
            });
            return _pos;
        }

        function createMatrix(){
            //создаем сетку
            var matrix = [];
            var w = options.matrix, //Ширина сетки
                h = options.matrix; //Высота сетки
            
            for (var idx = 0; idx < options.matrix; idx++){
                matrix[idx] = [];
                for(var jdx = 0; jdx < options.matrix; jdx++){
                    matrix[idx][jdx] = {
                        x:jdx,
                        y:idx,
                        left: jdx*puzzleWidth+offset-1,
                        top: idx*puzzleHeight+offset-1
                    };
                }
            }
            return matrix;
        }

        function createPuzzle(text){
                //создаем квадраты
                var rect = new fabric.Rect({
                    // left: idx*puzzleWidth+offset-1,
                    // top: jdx*puzzleWidth+offset-1,
                    rx: 5,
                    ry: 5,
                    fill: options.puzzleColor,
                    stroke: options.puzzleBorderColor,
                    strokeWidth: options.puzzleBorderWidth,
                    width: puzzleWidth - offset * 2,
                    height: puzzleHeight - offset * 2,
                    originX: 'center',
                    originY: 'center'

                });
                //создаем надписи
                var txt = new fabric.Text(text,{
                    //   left: puzzleWidth/4,
                    //   top: puzzleWidth/4,
                    fontSize: 56,
                    fill: options.puzzleBorderColor,
                    fontWeight: 'bold',
                    originX: 'center',
                    originY: 'center'

                });
                //пихаем их в группы
                var group = new fabric.Group([rect, txt ], {
                    //left: jdx*puzzleWidth+offset-1,
                    //top: idx*puzzleWidth+offset-1,
                    selectable: false,
                    width: 2 + (puzzleWidth - offset * 2),
                    height: 2 + (puzzleHeight - offset * 2),
                    //angle: -10
                });
            return group;
        }

        function getOffset(){
            return puzzleWidth+offset-2;
        }

        function movePuzzle(puzzle,vector,direction){
            var _offset = direction+getOffset().toString(),
                _dev = $.Deferred();
            puzzle.animate(vector,_offset, {
                duration:100,
                onChange:self.canvas.renderAll.bind(self.canvas),
                onComplete: function(){
                    var posNew = CPosToMPos(puzzle.left,puzzle.top);
                    //console.log("posNew",posNew);
                    matrix[posNew.y][posNew.x].element = puzzle;
                    _dev.resolve(matrix[posNew.y][posNew.x]);
                }
            });
            return _dev.promise();
        }

        function clearCell(x,y){
            //console.log("Its clear",matrix[y][x]);
            matrix[y][x].element = undefined;
        }

        function fillMatrix(matrix, elements){
            var counter = 0;
            thenIfCondition(matrix,"item", function(item){
                counter++;
                if (elements.length > 0) {
                    var i = getRandomInt(0, elements.length - 1);
                    var puzzle = elements[i];
                    elements.splice(i, 1);
                    if(!_.isUndefined(puzzle)){
                        puzzle.setLeft(item.left);
                        puzzle.setTop(item.top);
                        item.element = puzzle;
                        self.canvas.add(puzzle);
                    }
                    else {
                        item.element = puzzle;
                    }

                }
            });
        }

        function CPosToMPos(x,y){
            //console.debug("x = ",x);
            //console.debug("y = ",y);
            //console.debug("puzzleWidth+offset-1",puzzleWidth+offset-1);
            //console.debug("puzzleHeight+offset-1",puzzleHeight+offset-1);
            //console.debug("y/(puzzleWidth+offset",y/(puzzleWidth+offset));
            return {
                y:Math.round(y/(puzzleWidth+offset)),
                x:Math.round(x/(puzzleHeight+offset))
            };
        }

        function isVictory(matrix){
            var num = 1,
                lastNum = options.matrix*options.matrix,
                victory = true;

            for (var idx = 0; idx < options.matrix; idx++){
                for(var jdx = 0; jdx < options.matrix; jdx++){

                    var _element = matrix[idx][jdx];

                    if(num === lastNum){
                        victory = victory &&_.isUndefined(_element.element);
                    }
                    else {
                        if(_.isObject(_element.element)){
                            victory = victory &&_element.element._objects[1].text === num.toString();
                        }
                        else {
                            victory = false;
                            break;
                        }

                    }

                    num++;
                }
            }
            return victory;
        }

        function getPuzzlePosition(element){
            var position;
            thenIfCondition(matrix,"item",function(item){
               if(!!item.element){
                   if(element === item.element){
                       position = item;
                   }
               }
            });
            return position;
        }

        function newGame(){

            self.canvas.clear();

            var _matrix = createMatrix();

            var _elements = []; //the objects
            for(var idx = 1; idx<(options.matrix*options.matrix); idx++) {
                _elements.push(createPuzzle(idx.toString()));
            }
            _elements.push(undefined); //push empty object

            //arrange the objects
            fillMatrix(_matrix, _elements);

            // console.log("MATRIX DONE", _matrix);
            // console.log("solution", checkSolution(_matrix));

            if(checkSolution(_matrix)){
                gameOver = false;
                return {
                    matrix: _matrix,
                    elements: _elements
                };
            }
            else {
                return newGame();
            }
        }

        var instance = newGame(),
            matrix = instance.matrix,
            elements = instance.elements;


        self.setBackgroundColorOnPuzzle = function(color){
            var _color = color || options.puzzleColorAfter
            for (var idx = 0; idx < matrix.length; idx++){
                for(var jdx = 0; jdx < matrix[idx].length; jdx++){
                    if(!isEmpty(matrix[idx][jdx])){
                        matrix[idx][jdx].element._objects[0].set("fill", _color);
                    }
                }
            }
            self.canvas.renderAll();
        };

        self.canvas.on('mouse:up',function(options){
            if(!!options.target && !gameOver){
                var posFree = getFreePositon();
                var posElem = getPuzzlePosition(options.target);
                var NULL = 0,
                    elemItems;
                var _defferedArray = [];
                //console.debug("posElem",posElem);
                //console.debug("posFree",posFree);

                var result = {
                    x:posElem.x - posFree.x,
                    y:posElem.y - posFree.y
                };

                //console.log("Result",result);

                if(result.x === NULL){
                    elemItems = Math.abs(result.y);
                    //console.info("Vertical offset");
                    //console.info("needOffset",elemItems);
                    if(result.y < 0){
                        //console.log("need move to top");

                        for(var index = posElem.y; index < posFree.y; index++){
                            _defferedArray.push(movePuzzle(matrix[index][posElem.x].element, "top", "+="));
                            clearCell(posElem.x,index);
                        }

                        $.when.apply($, _defferedArray).done(function(){
                            //console.log("_defferedArray",_defferedArray);
                            if(isVictory(matrix)){

                                setTimeout(function(){
                                    self.setBackgroundColorOnPuzzle();
                                    afterVictory();
                                }, 100);

                            }
                        });
                    }
                    if(result.y > NULL){
                        //console.log("need move to bottom");
                        for(var index = posElem.y; index > posFree.y; index--){
                            _defferedArray.push(movePuzzle(matrix[index][posElem.x].element, "top", "-="));
                            clearCell(posElem.x,index);
                        }

                        $.when.apply($, _defferedArray).done(function(){
                            //console.log("_defferedArray",_defferedArray);
                            if(isVictory(matrix)){
                                setTimeout(function(){
                                    self.setBackgroundColorOnPuzzle();
                                    afterVictory();
                                }, 100);
                            }
                        });
                    }
                }

                if(result.y === NULL){
                    elemItems = Math.abs(result.x);
                    //console.info("Horizontal offset");
                    //console.info("needOffset",elemItems);
                    if(result.x < 0){
                        //console.log("need move to right");
                        for(var index = posElem.x; index < posFree.x; index++){
                            _defferedArray.push(movePuzzle(matrix[posElem.y][index].element, 'left', "+="));
                            clearCell(index,posElem.y);
                        }

                        $.when.apply($, _defferedArray).done(function(){
                            //console.log("_defferedArray",_defferedArray);
                            if(isVictory(matrix)){
                                setTimeout(function(){
                                    self.setBackgroundColorOnPuzzle();
                                    afterVictory();
                                }, 100);
                            }
                        });
                    }
                    if(result.x > 0){
                        //console.log("need move to left");
                        for(var index = posElem.x; index > posFree.x; index--){
                            _defferedArray.push(movePuzzle(matrix[posElem.y][index].element, 'left', "-="));
                            clearCell(index,posElem.y);
                        }

                        $.when.apply($, _defferedArray).done(function(){
                            if(isVictory(matrix)){
                                setTimeout(function(){
                                    self.setBackgroundColorOnPuzzle();
                                    afterVictory();
                                }, 100);
                            }
                        });
                    }
                }
            }
        });
    };

    window.FifteenPuzzle = FifteenPuzzle;
})();