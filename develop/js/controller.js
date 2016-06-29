;(function() {
  var
    _offer = new Offer($('.js-grid')), 
    _offerPopupSelector = '.js-popup',
    _tempPopUp = Handlebars.compile($('#offer-popup').html()),
    _actionClass = '.js-parent-element',
    _offerSelector = '.js-grid-item',
    _template = Handlebars.compile($('#offer').html()),
    _user = new User({
      id: 10,
      name: 'Паша Журавлёв',
      foto: '../img/iam.jpg'
    });

  _offer.initOffers({
    'authorId': _user.id,
    'name': _user.name,
    'foto': _user.foto
  })
  .then(function(data){
    console.log(data);
  });

  _startMansory($('.js-grid'), _offerSelector);
  
  $(document).on('click', '.js-call-popup', function() {
    var id = $(this).closest(_actionClass).data('id');
    
    _renderPopUp(id);

    return false;
  });

  $(document).mouseup(function(e) { 
    var popUp = $('.offer-popup'); 

    if (popUp.has(e.target).length === 0) { 
      _removePopUp(); 
    }
  });

  $(document).on('click', '.js-popup-close', function() {
    _removePopUp();
    return false;
  });

  $(document).on('keydown', '.js-writing', function(e) { 
    var 
      id,
      text,
      $this, 
      dataWriting,
      userOptions;

    if (e.keyCode == 13) {
      $this = $(this);
      id = $this.closest(_actionClass).data('id');
      dataWriting = $this.data('writing');
      text = $this.val();
      userOptions = {
        'author': _user.name,
        'foto': _user.foto,
        'text': text
      };

      if ( (dataWriting === 'rewiews') && (text.length >= 500) ) {
        return false;
      }

      _offer.addWriting(id, userOptions, dataWriting);

      if ($(_offerPopupSelector).length) {
        _renderPopUp(id);
      }

      return false;
    }
  });

  $(document).on('click', '.js-delete-offer', function() {
    var id = $(this).closest(_actionClass).data('id');
   
    _offer.delete(id);
   
    return false;
  });

  $(document).on('click', '.js-delete-writing', function() {
    var
      $this = $(this), 
      category = $this.data('category'),
      idWriting = $this.closest('li').data('id'),
      idOffer = $this.closest(_actionClass).data('id');

    _offer.deleteWriting(idOffer, idWriting, category);

    if ($(_offerPopupSelector).length) {
      _renderPopUp(idOffer);
    }

    return false;
  });

  $(document).on('click', '.js-show-writings', function() {
    var 
      $this = $(this),
      category = $this.data('category'),
      idOffer = $this.closest(_actionClass).data('id');

    $this.addClass('active');
    _offer.showWritings(idOffer, category);

    if ($(_offerPopupSelector).length) {
      _renderPopUp(idOffer);
    }

    return false;
  });

  $(document).on('click', '.js-add-prop', function() {
    var
      $this = $(this), 
      idOffer = $this.closest(_actionClass).data('id'),
      category = $this.data('category');

    _offer.incrementCounter(idOffer, category);

    if ($(_offerPopupSelector).length) {
      _renderPopUp(idOffer);
    }

    _startMansory($('.js-grid'), _offerSelector);


    return false;
  });

   // Рендеринг popup оффера(на вход id оффера)
  function _renderPopUp(id) {
    var 
      $container = $('body'),
      popUpObj = _offer.getPopupData(id);

    $(_offerPopupSelector).remove();

    $('body').addClass('body-shadow');
    $container.prepend(_tempPopUp(popUpObj));
  }

  // Удалить блок popup 
  function _removePopUp() {
    $('body').removeClass('body-shadow');
    $(_offerPopupSelector).remove();
  }

  // Запускает masonry
  function _startMansory($container, itemSelector) {
    $container.imagesLoaded(function() {
      $container.masonry({
        itemSelector: itemSelector,
        columnWidth: 235
      });
    });
  }

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



    // Перерисовывает контент
  function _reload($container, template, data) {
    $('.container').html($('.js-grid'));  
    // _checkAuthorField(data, ["likes", "adding"]);
    $container.html(template(data));
    _startMansory($container, _offerSelector);
  }
})();