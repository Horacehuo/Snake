var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// utility functions
function shallowEquals(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  var equals = true;
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) equals = false;
  }
  return equals;
}

function arrayDiff(arr1, arr2) {
  return arr1.map(function (a, i) {
    return a - arr2[i];
  });
}

// display a single cell
function GridCell(props) {
  var classes = "grid-cell \n" + (props.foodCell ? "grid-cell--food" : "") + " \n" + (props.snakeCell ? "grid-cell--snake" : "") + "\n";
  return React.createElement("div", {
    className: classes,
    style: { height: props.size + "px", width: props.size + "px" }
  });
}

// the main view

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      snake: [],
      food: [],
      // 0 = not started, 1 = in progress, 2= finished
      status: 0,
      // using keycodes to indicate direction
      direction: 39
    };

    _this.moveFood = _this.moveFood.bind(_this);
    _this.checkIfAteFood = _this.checkIfAteFood.bind(_this);
    _this.startGame = _this.startGame.bind(_this);
    _this.endGame = _this.endGame.bind(_this);
    _this.moveSnake = _this.moveSnake.bind(_this);
    _this.doesntOverlap = _this.doesntOverlap.bind(_this);
    _this.setDirection = _this.setDirection.bind(_this);
    _this.removeTimers = _this.removeTimers.bind(_this);
    return _this;
  }
  // randomly place snake food


  _createClass(App, [{
    key: "moveFood",
    value: function moveFood() {
      if (this.moveFoodTimeout) clearTimeout(this.moveFoodTimeout);
      var x = parseInt(Math.random() * this.numCells);
      var y = parseInt(Math.random() * this.numCells);
      this.setState({ food: [x, y] });
      this.moveFoodTimeout = setTimeout(this.moveFood, 5000);
    }
  }, {
    key: "setDirection",
    value: function setDirection(_ref) {
      var _this2 = this;

      var keyCode = _ref.keyCode;

      // if it's the same direction or simply reversing, ignore
      var changeDirection = true;
      [[38, 40], [37, 39]].forEach(function (dir) {
        if (dir.indexOf(_this2.state.direction) > -1 && dir.indexOf(keyCode) > -1) {
          changeDirection = false;
        }
      });

      if (changeDirection) this.setState({ direction: keyCode });
    }
  }, {
    key: "moveSnake",
    value: function moveSnake() {
      var _this3 = this;

      var newSnake = [];
      // set in the new "head" of the snake
      switch (this.state.direction) {
        // down
        case 40:
          newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] + 1];
          break;
        // up
        case 38:
          newSnake[0] = [this.state.snake[0][0], this.state.snake[0][1] - 1];
          break;
        // right
        case 39:
          newSnake[0] = [this.state.snake[0][0] + 1, this.state.snake[0][1]];
          break;
        // left
        case 37:
          newSnake[0] = [this.state.snake[0][0] - 1, this.state.snake[0][1]];
          break;
      }
      // now shift each "body" segment to the previous segment's position
      [].push.apply(newSnake, this.state.snake.slice(1).map(function (s, i) {
        // since we're starting from the second item in the list,
        // just use the index, which will refer to the previous item
        // in the original list
        return _this3.state.snake[i];
      }));

      this.setState({ snake: newSnake });

      this.checkIfAteFood(newSnake);
      if (!this.isValid(newSnake[0]) || !this.doesntOverlap(newSnake)) {
        // end the game
        this.endGame();
      }
    }
  }, {
    key: "checkIfAteFood",
    value: function checkIfAteFood(newSnake) {
      if (!shallowEquals(newSnake[0], this.state.food)) return;
      // snake gets longer
      var newSnakeSegment = void 0;
      var lastSegment = newSnake[newSnake.length - 1];

      // where should we position the new snake segment?
      // here are some potential positions, we can choose the best looking one
      var lastPositionOptions = [[-1, 0], [0, -1], [1, 0], [0, 1]];

      // the snake is moving along the y-axis, so try that instead
      if (newSnake.length > 1) {
        lastPositionOptions[0] = arrayDiff(lastSegment, newSnake[newSnake.length - 2]);
      }

      for (var i = 0; i < lastPositionOptions.length; i++) {
        newSnakeSegment = [lastSegment[0] + lastPositionOptions[i][0], lastSegment[1] + lastPositionOptions[i][1]];
        if (this.isValid(newSnakeSegment)) {
          break;
        }
      }

      this.setState({
        snake: newSnake.concat([newSnakeSegment]),
        food: []
      });
      this.moveFood();
    }

    // is the cell's position inside the grid?

  }, {
    key: "isValid",
    value: function isValid(cell) {
      return cell[0] > -1 && cell[1] > -1 && cell[0] < this.numCells && cell[1] < this.numCells;
    }
  }, {
    key: "doesntOverlap",
    value: function doesntOverlap(snake) {
      return snake.slice(1).filter(function (c) {
        return shallowEquals(snake[0], c);
      }).length === 0;
    }
  }, {
    key: "startGame",
    value: function startGame() {
      this.removeTimers();
      this.moveSnakeInterval = setInterval(this.moveSnake, 130);
      this.moveFood();

      this.setState({
        status: 1,
        snake: [[5, 5]],
        food: [10, 10]
      });
      //need to focus so keydown listener will work!
      this.el.focus();
    }
  }, {
    key: "endGame",
    value: function endGame() {
      this.removeTimers();
      this.setState({
        status: 2
      });
    }
  }, {
    key: "removeTimers",
    value: function removeTimers() {
      if (this.moveSnakeInterval) clearInterval(this.moveSnakeInterval);
      if (this.moveFoodTimeout) clearTimeout(this.moveFoodTimeout);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.removeTimers();
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      // each cell should be approximately 15px wide, so calculate how many we need
      this.numCells = Math.floor(this.props.size / 15);
      var cellSize = this.props.size / this.numCells;
      var cellIndexes = Array.from(Array(this.numCells).keys());
      var cells = cellIndexes.map(function (y) {
        return cellIndexes.map(function (x) {
          var foodCell = _this4.state.food[0] === x && _this4.state.food[1] === y;
          var snakeCell = _this4.state.snake.filter(function (c) {
            return c[0] === x && c[1] === y;
          });
          snakeCell = snakeCell.length && snakeCell[0];

          return React.createElement(GridCell, {
            foodCell: foodCell,
            snakeCell: snakeCell,
            size: cellSize,
            key: x + " " + y
          });
        });
      });

      var overlay = void 0;
      if (this.state.status === 0) {
        overlay = React.createElement(
          "div",
          { className: "snake-app__overlay" },
          React.createElement(
            "button",
            { onClick: this.startGame },
            "Start game!"
          )
        );
      } else if (this.state.status === 2) {
        overlay = React.createElement(
          "div",
          { className: "snake-app__overlay" },
          React.createElement(
            "div",
            { className: "mb-1" },
            React.createElement(
              "b",
              null,
              "GAME OVER!"
            )
          ),
          React.createElement(
            "div",
            { className: "mb-1" },
            "Your score: ",
            this.state.snake.length,
            " "
          ),
          React.createElement(
            "button",
            { onClick: this.startGame },
            "Start a new game"
          )
        );
      }
      return React.createElement(
        "div",
        {
          className: "snake-app",
          onKeyDown: this.setDirection,
          style: {
            width: this.props.size + "px",
            height: this.props.size + "px"
          },
          ref: function ref(el) {
            return _this4.el = el;
          },
          tabIndex: -1
        },
        overlay,
        React.createElement(
          "div",
          {
            className: "grid",
            style: {
              width: this.props.size + "px",
              height: this.props.size + "px"
            }
          },
          cells
        )
      );
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, { size: 500 }), document.getElementById("root"));