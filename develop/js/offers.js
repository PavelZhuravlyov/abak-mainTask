function Offer($container) {
  var 
    self = this,
    _generalObj = {};

  self.container = $container;

  // Логическое удаление оффера
  self.delete = function(id) {
    var thisOffer = _findById(id, _generalObj.data).offer;
    
    thisOffer.delete = true;

    return _sendData(_generalObj.data);
  }; 

  // Логическое удаление комментария/отзыва(определяется за счёт category) 
  self.deleteWriting = function(idObj, idWriting, category) {
    var
      offer = _findById(idObj, _generalObj.data).offer,
      arrElements = offer[category],
      currentElement = _findById(idWriting, arrElements);
    
    if (category === "comments") {
      offer.commentsCount--;
    } else if (category === "rewiews") {
      offer.rewiewsCount--;
    }

    currentElement.show = false;

    return _sendData(_generalObj.data);
  };

  // Показать комментарий/отзыв(определяется за счёт category)
  self.showWritings = function(id, category) {
    var offer = _findById(id, _generalObj.data).offer;
    
    if (category === "comments") {
      offer.showComments = true;
    } else if (category === "rewiews") {
      offer.showRewiews = true;
    }

    return _sendData(_generalObj.data);
  };

  // Увеличение счётчика лайков/добавить к себе(определяется за счёт category)
  self.incrementCounter = function(id, category) {
    var 
      offer = _findById(id, _generalObj.data).offer,    
      existingAuthors = offer[category].map(function(item) { 
        return item.authorId; 
      }),
      userOptions = $.extend(_generalObj.user, {'date': Date.now()});

    if (existingAuthors.indexOf(userOptions.authorId) === -1) {
      offer[category].push(userOptions);
    } else {
      offer[category].pop(userOptions);
    }

    return _sendData(_generalObj.data);
  };

  // Добавить комментарий/отзыв(определяется за счёт category) 
  self.addWriting = function(id, userOptions, category) {
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

    return _sendData(_generalObj.data);
  };

  // Копирует главный объект приложения, чтоб можно было
  // работать с ним в этом классе
  self.saveGeneralObj = function(obj) {
    _generalObj = obj;
  };

  // Инициализация
  self.initOffers = function() {
    return _httpGetData('/data');
  };

  // Отправляет данные на сервер
  function _sendData(data) {
    return new Promise(function(resolve, reject) {
      $.post(
        '/change', 
        {'data': JSON.stringify(data, "", 2)},
        resolve()
      );
    });
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