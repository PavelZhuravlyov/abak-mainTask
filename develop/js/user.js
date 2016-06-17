function User(options) {
  var 
    self = this,
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
      _offers.renderPopUp(0);
      return false;
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
        maxLengthWrite;

      if (e.keyCode == 13) {
        $this = $(this);
        id = $this.closest('.js-grid-item').data('id');
        dataWrite = $this.data('write');
        text = $this.val();

        if (dataWrite === 'rewiews') {
          (text.length <= 500) ? _offers.addComment(id, text) : console.log(">");
        }

        _offers.addComment(id, {
          'name': self.name,
          'foto': self.foto,
          'text': text
        });

        return false;
      }
    });

    $(document).on('click', '.js-delete-offer', function() {
      var id = $(this).closest('.js-grid-item').data('id');
     
      _offers.deleteOffer(id);
     
      return false;
    });

    $(document).on('click', '.js-delete-comment', function() {
      var
        $this = $(this), 
        idComment = $this.closest('li').data('id'),
        idOffer = $this.closest('.js-grid-item').data('id');

       _offers.deleteComment(idOffer, idComment);

      return false;
    });

    $(document).on('click', '.js-show-comments', function() {
      var 
        $this = $(this),
        idOffer = $this.closest('.js-grid-item').data('id');

      $this.addClass('active-btn');
      _offers.showComments(idOffer);

      return false;
    });

    $(document).on('click', '.js-add-prop', function() {
      var
        $this = $(this), 
        idOffer = $this.closest('.js-grid-item').data('id'),
        field = $this.data('btn');

      _offers.setValueField(idOffer, field, {
        'authorId': self.id,
        'author': self.name,
        'foto': self.foto,
        'date': Date.now()
      });

      return false;
    });
  }

  this.listenHandler();
}