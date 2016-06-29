function Offers($container) {
  var 
    self = this,
    _template = Handlebars.compile($('#offer').html()),
    _tempPopUp = Handlebars.compile($('#offer-popup').html()),
    _offerSelector = '.js-grid-item',
    _offerPopupSelector = '.js-popup',
    _generalObj = {};

  self.container = $container;

  // Рендеринг popup оффера(на вход id оффера)
  self.renderPopUp = function(id) {
    var 
      $container = $('.wrapper-popup'),
      popUpObj = {
        'activePopup': _findById(id, _generalObj.data),
        'currentUser': _generalObj.user
      };

    $(_offerPopupSelector).remove();

    $container.addClass('body-shadow');
    $container.prepend(_tempPopUp(popUpObj));
  };

  // Удалить блок popup 
  self.removePopUp = function() {
    $('body').removeClass('body-shadow');
    $(_offerPopupSelector).remove();
  };

  // Логическое удаление оффера
  self.deleteOffer = function(id) {
    var thisOffer = _findById(id, _generalObj.data).offer;
    
    thisOffer.show = false;

    _updateData(self.container, _template, _generalObj);
  }; 

  // Логическое удаление комментария/отзыва(определяется за счёт category) 
  self.deleteWrite = function(idObj, idWrite, category) {
    var
      offer = _findById(idObj, _generalObj.data).offer,
      arrElements = offer[category],
      currentElement = _findById(idWrite, arrElements);
    
    if (category === "comments") {
      offer.commentsCount--;
    } else if (category === "rewiews") {
      offer.rewiewsCount--;
    }

    currentElement.show = false;

    _updateData(self.container, _template, _generalObj); 
    
    if (category === "rewiews") {
      self.renderPopUp(idObj);
    }
  };

  // Добавить комментарий/отзыв(определяется за счёт category) 
  self.addWrite = function(id, userOptions, category) {
    var 
      offer = _findById(id, _generalObj.data).offer,
      arrElements = offer[category],
      elementField = $.extend(userOptions, {
        'id': arrElements.length + 1,
        'date': Date.now(),
        'show': true
      });

      arrElements.push(elementField);

      if (category === "comments") {
        offer.commentsCount++;
      } else if (category === "rewiews") {
        offer.rewiewsCount++;
      }

      _updateData(self.container, _template, _generalObj);

      if (category === "rewiews") {
        self.renderPopUp(id);
      }
  };

  // Показать комментарий/отзыв(определяется за счёт category)
  self.showWrites = function(id, category) {
    var offer = _findById(id, _generalObj.data).offer;
    
    if (category === "comments") {
      offer.showComments = true;
    } else if (category === "rewiews") {
      offer.showRewiews = true;
    }

    _updateData($container, _template, _generalObj);

    if (category === "rewiews") {
      self.renderPopUp(id);
    }
  };

  // Увеличение счётчика лайков/добавить к себе(определяется за счёт category)
  self.incrementCounter = function(id, category, userOptions, thisPopup) {
    var 
      offer = _findById(id, _generalObj.data).offer,    
      existingAuthors = _findByHash('authorId', offer[category]);

    if (existingAuthors.indexOf(userOptions.authorId) === -1) {
      _generalObj.user = userOptions;
      offer[category].push(userOptions);

      _updateData(self.container, _template, _generalObj);

      if (thisPopup) {
        self.renderPopUp(id);
      }
    }
  };

  // Инициализация
  self.initOffers = function(userOptions) {
    _getData(userOptions);
  };

  // Получает данные с сервера и отображает контент
  function _getData(userOptions) {
    _httpGetData('/data')
      .then(function(data) {
        _generalObj.data = data;
        _generalObj.user = userOptions;
        
        _reload(self.container, _template, _generalObj);
      });
  }

  // Отправляет данные на сервер
  function _sendData(data) {
    $.post('/change', {'data': JSON.stringify(data, "", 2)});
  }

  // Обновление информации
  function _updateData($container, template, generalObj) {
    _reload($container, template, generalObj);
    _sendData(generalObj.data);
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
        existingAuthors = _findByHash('authorId', offers[i].offer[field]);
        
        if (existingAuthors.indexOf(authorId) != -1) {
          offers[i].offer[nameField] = true;
        } else {
          offers[i].offer[nameField] = false;
        }
      }
    }
  }

  // Поиск элемента массива по id  
  function _findById(id, data) {
    var 
      i, result,
      lengthArr = data.length;

    for (i = 0; i < lengthArr; i++) {
      if (data[i].id == id) {
        return data[i];
      }
    }

    return false;
  }

  // Возвращает массив значений, хэш которых соответствует hash 
  function _findByHash(hash, data) {
    var 
      arrHashes = [],
      i,
      dataLength = data.length;

    for (i = 0; i < dataLength; i++) {
      if (data[i][hash]) {
        arrHashes.push(data[i][hash]);
      }
    }

    return arrHashes;
  }

  // Перерисовывает контент
  function _reload($container, template, data) {
    $('.container').html($container);  
    _checkAuthorField(data, ["likes", "adding"]);
    $container.html(template(data));
    _startMansory($container, _offerSelector);
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

  // Получает данные(набор офферов) с сервера
  function _httpGetData(url) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',
        success: function(data) {
          resolve(JSON.parse(data));
        }
      });
    });
  }
}