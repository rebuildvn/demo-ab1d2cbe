(function (window, document) {
  'use strict';

  var SMEUP = window.SMEUP;
  var form = document.getElementById('booking-form');
  if (!form || !SMEUP) {
    return;
  }

  function fieldValue(name) {
    var el = form.elements.namedItem(name);
    return el ? String(el.value || '').trim() : '';
  }

  function composeMessage() {
    var branch = fieldValue('branch');
    var guests = fieldValue('guests');
    var date = fieldValue('date');
    var time = fieldValue('time');
    return [
      'Yêu cầu đặt bàn GYUSACHI (Stitch demo):',
      'Cơ sở: ' + branch,
      'Số khách: ' + guests,
      'Ngày: ' + date,
      'Giờ: ' + time
    ].join('\n');
  }

  form.addEventListener(
    'submit',
    function () {
      var messageField = form.elements.namedItem('message');
      if (messageField) {
        messageField.value = composeMessage();
      }
    },
    true
  );
})(window, document);
