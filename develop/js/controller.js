;(function() {
  var
    _offers = new Offers($('.js-grid')), 
    _user = new User({
      id: 10,
      name: 'Паша Журавлёв',
      foto: '../img/iam.jpg'
    });
    _actionClass = '.js-parent-element',

  _offers.initOffers({
    'authorId': _user.id,
    'name': _user.name,
    'foto': _user.foto,
    'date': Date.now()
  });
  
  $(document).on('click', '.js-call-popup', function() {
    var id = $(this).closest(_actionClass).data('id');
    
    _offers.renderPopUp(id);

    return false;
  });

  $(document).mouseup(function(e) { 
    var popUp = $('.offer-popup'); 

    if (popUp.has(e.target).length === 0) { 
      _offers.removePopUp(); 
    }
  });

  $(document).on('click', '.js-popup-close', function() {
    _offers.removePopUp();
    return false;
  });

  $(document).on('keydown', '.js-write', function(e) { 
    var 
      id,
      text,
      $this, 
      dataWrite,
      userOptions;

    if (e.keyCode == 13) {
      $this = $(this);
      id = $this.closest(_actionClass).data('id');
      dataWrite = $this.data('write');
      text = $this.val();
      userOptions = {
        'author': _user.name,
        'foto': _user.foto,
        'text': text
      };

      if ( (dataWrite === 'rewiews') && (text.length >= 500) ) {
        return false;
      }

      _offers.addWrite(id, userOptions, dataWrite);

      return false;
    }
  });

  $(document).on('click', '.js-delete-offer', function() {
    var id = $(this).closest(_actionClass).data('id');
   
    _offers.deleteOffer(id);
   
    return false;
  });

  $(document).on('click', '.js-delete-write', function() {
    var
      $this = $(this), 
      category = $this.data('category'),
      idWrite = $this.closest('li').data('id'),
      idOffer = $this.closest(_actionClass).data('id');

     _offers.deleteWrite(idOffer, idWrite, category);

    return false;
  });

  $(document).on('click', '.js-show-writes', function() {
    var 
      $this = $(this),
      category = $this.data('category'),
      idOffer = $this.closest(_actionClass).data('id');

    $this.addClass('active');
    _offers.showWrites(idOffer, category);

    return false;
  });

  $(document).on('click', '.js-add-prop', function() {
    var
      $this = $(this), 
      thisPopup = ($this.hasClass('js-popup')) ? true : false,
      idOffer = $this.closest(_actionClass).data('id'),
      category = $this.data('category'),
      userOptions = {
        'authorId': _user.id,
        'author': _user.name,
        'foto': _user.foto,
        'date': Date.now()
      };

    _offers.incrementCounter(idOffer, category, userOptions, thisPopup);

    return false;
  });

  // Сортировка данных по времени добавления
  // (на вход объект с данными и кол-во данных которое нужно вывести)
  Handlebars.registerHelper('sortList', function(obj, count, options) {
    var 
      arr = obj.sort(function(a, b) {
        return (a.date - b.date);
      }),
      arrLength = arr.length,
      result = [],
      i;


    if (arr.length < count) {
      return options.fn(obj);
    }

    for (i = arrLength - 1; i !== 0; i--) {
      if (result.length === count) {
        break;
      }

      if (arr[i].show === false) {
        continue;
      } else {
        result.unshift(arr[i]);
      }
    }

    return options.fn(result);
  });
})();