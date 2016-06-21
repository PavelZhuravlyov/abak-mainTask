function Offers($container) {
  var 
    self = this,
    _template = Handlebars.compile($('#offer').html()),
    _tempPopUp = Handlebars.compile($('#offer-popup').html()),
    _offerSelector = '.js-grid-item',
    _offerPopupSelector = '.offer-popup',
    _generalObj = {},
    _data,
    _masonry;

  self.container = $container;

  this.getData = function(userOptions) {
    _httpGetData('/data')
      .then(function(data) {
        _generalObj.data = data;
        _generalObj.user = userOptions;
        
        _reload(self.container, _template, _generalObj);
      });
  }

  this.sendData = function(data) {
    $.post('/change', {'data': JSON.stringify(data, "", 2)});
  }

  this.renderPopUp = function(index) {
    var 
      $container = $('body'),
      popUpObj = {
        'activePopup': _generalObj.data[index-1],
        'currentUser': _generalObj.user
      };

    $(_offerPopupSelector).remove();

    $container.addClass('body-shadow');
    $container.prepend(_tempPopUp(popUpObj));
  }

  this.removePopUp = function() {
    $('body').removeClass('body-shadow');
    $('.offer-popup').remove();
  }

  this.updateData = function($container, template, data) {
    _reload($container, template, data);
    self.sendData(data.data);
  }

  this.deleteOffer = function(id) {
    var thisOffer = _findById(id, _generalObj.data);
    
    thisOffer.offer.show = false;
    self.updateData(self.container, _template, _generalObj);
  } 

  this.deleteComment = function(idObj, idWrite, category) {
    var
      offer = _findById(idObj, _generalObj.data).offer,
      elements = offer[category],
      currentElement = _findById(idWrite, elements);
    
    if (category === "comments") {
      offer.commentsCount--;
      offer.showComments = true;
    } else if (category === "rewiews") {
      offer.rewiewsCount--;
      offer.showRewiews = true;
    }

    currentElement.show = false;

    self.updateData(self.container, _template, _generalObj); 

    if (category === "rewiews") {
      self.renderPopUp(idObj);
    }
  }

  this.showWrites = function(id, category) {
    var 
      offer = _findById(id, _generalObj.data).offer,
      nameField = category.charAt(0).toUpperCase() + category.substr(1),
      elementCategory = "show" + nameField;
    
    offer[elementCategory] = true;

    self.updateData($container, _template, _generalObj);

    if (category === "rewiews") {
      self.renderPopUp(id);
    }
  }

  this.addWrite = function(id, userOptions, dataWrite) {
    var 
      offer = _findById(id, _generalObj.data).offer,
      elements = offer[dataWrite],
      elementField = $.extend(userOptions, {
        'id': elements.length + 1,
        'date': Date.now(),
        'show': true
      });

      elements.push(elementField);
      elementsCount = dataWrite + 'Count';

      offer[elementsCount]++;

      self.updateData(self.container, _template, _generalObj);

      if (dataWrite === "rewiews") {
        self.renderPopUp(id);
      }
  }

  this.setValueField = function(id, field, userOptions, thisPopup){
    var 
      offer = _findById(id, _generalObj.data).offer,    
      existingAuthors = _findByHash('authorId', offer[field]);

    if (existingAuthors.indexOf(userOptions.authorId) == -1) {
      _generalObj.user = userOptions;
      offer[field].push(userOptions);

      self.updateData(self.container, _template, _generalObj);

      if (thisPopup) {
        self.renderPopUp(id);
      }
    }
  }

  this.initOffers = function(userOptions) {
    self.getData(userOptions);
  }

  function _checkAuthorField(data, field) {
    var 
      i,
      nameField = field.charAt(0).toUpperCase() + field.substr(1),
      offerField = "show" + nameField,
      authorId = data.user.authorId,
      existingAuthors = [],
      offers = data.data,
      dataLength = offers.length;

    for (i = 0; i < dataLength; i++) {
      existingAuthors = _findByHash('authorId', offers[i].offer[field]);
      
      if (existingAuthors.indexOf(authorId) != -1) {
        offers[i].offer[offerField] = true;
      } else {
        offers[i].offer[offerField] = false;
      }
    }
  }

  function _findById(id, data) {
    var 
      i,
      result,
      lengthArr = data.length;

    for (i = 0; i < lengthArr; i++) {
      if (data[i].id == id) {
        return data[i];
      }
    }

    return false;
  }

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

  function _renderTemp($container, template, data) {
    $container.html(template(data));
  }

  function _reload($container, template, data) {
    $('.container').html($container);  
    _checkAuthorField(data, "likes");
    _checkAuthorField(data, "adding");
    _renderTemp($container, template, data);
    _startMansory($container, _offerSelector);
  }

  function _startMansory($container, itemSelector) {
    _masonry = $container.imagesLoaded(function() {
      $container.masonry({
        itemSelector: itemSelector,
        columnWidth: 235
      });
    });
  }

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