;(function() {
  var
    _tempPopUp = Handlebars.compile($('#offer-popup').html()),
    _template = Handlebars.compile($('#offer').html()),
    _offerPopupSelector = '.js-popup',
    _actionClass = '.js-parent-element',
    _offerSelector = '.js-grid-item',
    _offer = new Offer($('.js-grid')), 
    _user = new User({
      id: 10,
      name: 'Паша Журавлёв',
      foto: '../img/iam.jpg'
    }),
    _userOptions = {
      'authorId': _user.id,
      'name': _user.name,
      'foto': _user.foto
    },
    _generalObj = {};

  _offer.initOffers(_userOptions)
    .then(function(data) {
      _generalObj.data = data;
      _generalObj.user = _userOptions;
      _offer.saveGeneralObj(_generalObj);

      _reload(_template, _generalObj);
    });
  
  $(document).on('click', '.js-delete-offer', function() {
    var id = $(this).closest(_actionClass).data('id');
   
    _offer.delete(id)
      .then(function(){
        _reload(_template, _generalObj);
      });
   
    return false;
  });

  $(document).on('click', '.js-delete-writing', function() {
    var
      $this = $(this), 
      category = $this.data('category'),
      idWriting = $this.closest('li').data('id'),
      idOffer = $this.closest(_actionClass).data('id');

    _offer.deleteWriting(idOffer, idWriting, category)
      .then(function() {
        _reload(_template, _generalObj);

        if ($(_offerPopupSelector).length) {
          _renderPopUp(idOffer);
        }
      });

    return false;
  });

  $(document).on('click', '.js-show-writings', function() {
    var 
      $this = $(this),
      category = $this.data('category'),
      idOffer = $this.closest(_actionClass).data('id');

    $this.addClass('active');
    _offer.showWritings(idOffer, category)
      .then(function() {
        _reload(_template, _generalObj);

        if ($(_offerPopupSelector).length) {
          _renderPopUp(idOffer);
        }
      });

    return false;
  });

  $(document).on('click', '.js-add-prop', function() {
    var
      $this = $(this), 
      idOffer = $this.closest(_actionClass).data('id'),
      category = $this.data('category');

    _offer.incrementCounter(idOffer, category)
      .then(function(){
        _reload(_template, _generalObj);

        if ($(_offerPopupSelector).length) {
          _renderPopUp(idOffer);
        }
      });

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

      _offer.addWriting(id, userOptions, dataWriting)
        .then(function(){
          _reload(_template, _generalObj);

          if ($(_offerPopupSelector).length) {
            _renderPopUp(id);
          }
        });

      return false;
    }
  });

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

  // Рендеринг popup оффера(на вход id оффера)
  function _renderPopUp(id) {
    var 
      $container = $('body'),
      popUpObj = {
        'activePopup': _generalObj.data.filter(function(item) { return item.id === id })[0],
        'currentUser': _generalObj.user
      };

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
  function _startMasonry($container, itemSelector) {
    $container.imagesLoaded(function() {
      $container.masonry({
        itemSelector: itemSelector,
        columnWidth: 235
      });
    });
  }

  // Проверяет, делал ли пользователь лайк или "добавить к себе"
  function _checkAuthorField(generalObj, fields) {
    var 
      authorId = generalObj.user.authorId,
      existingAuthors = [],
      offers = generalObj.data,
      dataLength = offers.length,
      i, j, nameField, field;

    for (j = 0; j < fields.length; j++) {
      field = fields[j];
      nameField = "show" + (field.charAt(0).toUpperCase() + field.substr(1));
      
      for (i = 0; i < dataLength; i++) {
        existingAuthors = offers[i].offer[field].map(function(item) {
          return item.authorId;
        });
          
        if (existingAuthors.indexOf(authorId) != -1) {
          offers[i].offer[nameField] = true;
        } else {
          offers[i].offer[nameField] = false;
        }
      }
    }
  }

  // Перерисовывает контент
  function _reload(template, data) {
    var $container = $('.js-grid');

    $('.container').html($container);  
    _checkAuthorField(data, ["likes", "adding"]);
    $container.html(template(data));
    _startMasonry($container, _offerSelector);
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
})();