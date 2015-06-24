define(
  'ephox.snooker.model.Fitment',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Array',
    'global!Error',
    'global!Math'
  ],

  function (Arr, Fun, Result, Array, Error, Math) {
    var measure = function (startAddress, gridA, gridB) {
      // TODO: avoid throw in production code
      if(startAddress.row() >= gridA.length || startAddress.column() > gridA[0].length) return Result.error('invalid startAddress out of table bounds');
      var rowRemainder = gridA.slice(startAddress.row());
      var colRemainder = rowRemainder[0].slice(startAddress.column());

      var colRequired= gridB[0].length;
      var rowRequired= gridB.length;
      return Result.value({
        rowDelta: Fun.constant(rowRemainder.length - rowRequired),
        colDelta: Fun.constant(colRemainder.length - colRequired)
      });
    };

    var rowFill = function (grid, amount, generator) {
      var nuRows = Arr.map(new Array(amount), function (row) {
        return Arr.map(grid[0], function (cell) {
          return generator.cell();
        });
      });
      return grid.concat(nuRows);
    };

    var colFill = function (grid, amount, generator) {
      return Arr.map(grid, function (row) {
        var fill = Arr.map(new Array(amount), function () {
          return generator.cell();
        });
        return row.concat(fill);
      });
    };

    var abs = function (negInt) {
      var posInt = Math.abs(negInt);
      return posInt;
    };

    var tailor = function (startAddress, gridA, delta, generator) {
      return delta.map(function (d) {
        var fillCols = d.colDelta() < 0 ? colFill : Fun.identity;
        var fillRows = d.rowDelta() < 0 ? rowFill : Fun.identity;

        var modifiedCols = fillCols(gridA, abs(d.colDelta()), generator);
        var tailoredGrid = fillRows(modifiedCols, abs(d.rowDelta()), generator);
        return tailoredGrid;
      });
    };

    return {
      measure: measure,
      tailor: tailor
    };
  }
);