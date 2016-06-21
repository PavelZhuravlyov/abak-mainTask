function User(options) {
  var 
    self = this,
    _actionClass = '.js-action-class',
    _offers = new Offers($('.js-grid'));

  self.id = options.id;
  self.name = options.name;
  self.foto = options.foto;

  _offers.initOffers({
    'authorId': self.id,
    'name': self.name,
    'foto': self.foto,
    'date': Date.now()
  });

  this.listenHandler = function() {
    $(document).on('click', '.js-call-popup', function() {
      var id = $(this).closest(_actionClass).data('id');
      
      _offers.renderPopUp(id);
      return false;
    });

    $(document).mouseup(function (e){ 
      var div = $('.offer-popup'); 

      if (div.target || div.has(e.target).length === 0) { 
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
        userOptions,
        maxLengthWrite;

      if (e.keyCode == 13) {
        $this = $(this);
        id = $this.closest(_actionClass).data('id');
        dataWrite = $this.data('write');
        text = $this.val();
        userOptions = {
          'author': self.name,
          'foto': self.foto,
          'text': text
        }

        if (dataWrite === 'rewiews') {
          if (text.length >= 500) {
            return false;
            _offers.addWrite(id, userOptions, dataWrite);
          }
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

       _offers.deleteComment(idOffer, idWrite, category);

      return false;
    });

    $(document).on('click', '.js-show-writes', function() {
      var 
        $this = $(this),
        category = $this.data('btn'),
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
        field = $this.data('btn'),
        userOptions = {
          'authorId': self.id,
          'author': self.name,
          'foto': self.foto,
          'date': Date.now()
        };

      _offers.setValueField(idOffer, field, userOptions, thisPopup);

      return false;
    });
  }

  this.listenHandler();
}