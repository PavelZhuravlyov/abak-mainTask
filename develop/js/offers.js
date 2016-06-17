function Offers($container) {
  var 
    self = this,
    _template = Handlebars.compile($('#offer').html()),
    _tempPopUp = Handlebars.compile($('#offer-popup').html()),
    _offerSelector = '.js-grid-item',
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
    var $container = $('body');

    $container.addClass('body-shadow');
    $container.prepend(_tempPopUp(_generalObj.data[index]));
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

  this.deleteComment = function(idObj, idComment) {
    var
      offer = _findById(idObj, _generalObj.data).offer,
      comments = offer.comments,
      currentComment = _findById(idComment, comments);
    
    offer.commentsCount--;
    offer.showComments = true;
    currentComment.show = false;

    self.updateData(self.container, _template, _generalObj);
  }

  this.showComments = function(id) {
    var offer = _findById(id, _generalObj.data).offer;
    
    offer.showComments = true;

    self.updateData($container, _template, _generalObj);
  }

  this.addComment = function(id, options) {
    var 
      offer = _findById(id, _generalObj.data).offer,
      comments = offer.comments,
      commentField = {
        'id': comments.length + 1,
        'text': options.text,
        'author': options.name,
        'foto': options.foto,
        'date': Date.now(),
        'show': true
      };

      comments.push(commentField);
      offer.commentsCount++;
      offer.showComments = true;

      self.updateData(self.container, _template, _generalObj);
  }

  this.setValueField = function(id, field, userOptions) {
    var 
      offer = _findById(id, _generalObj.data).offer,    
      existingAuthors = _findByHash('authorId', offer[field]);

    if (existingAuthors.indexOf(userOptions.authorId) == -1) {
      _generalObj.user = userOptions;
      offer[field].push(userOptions);
      self.updateData(self.container, _template, _generalObj);
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
      }
    }

    console.log(offers);
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