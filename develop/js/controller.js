;(function() {
  var user = new User({
    id: 10,
    name: 'Паша Журавлёв',
    foto: '../img/iam.jpg'
  });

  Handlebars.registerHelper('sortList', function(obj, count, options) {
    var 
      arr = obj.sort(function(a, b) {
        return -(a.date - b.date);
      }),
      result = [];

    if (arr.length < count) {
      return options.fn(obj);
    }

    for (var i = 0; i < arr.length; i++) {
      if (result.length == count) {
        break;
      }

      if (arr[i].show == false) {
        continue;
      } else {
        result.push(arr[i]);
      }
    }

    return options.fn(result);
  });
})();