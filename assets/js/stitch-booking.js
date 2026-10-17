(function (window, document) {
  'use strict';

  var SMEUP = window.SMEUP;

  function fieldValue(form, name) {
    var el = form.elements.namedItem(name);
    if (el && el.tagName === 'SELECT') {
      var opt = el.options[el.selectedIndex];
      return opt ? String(opt.text || opt.value || '').trim() : '';
    }
    return el ? String(el.value || '').trim() : '';
  }

  function composeDesktopMessage(form) {
    return [
      'Yêu cầu đặt bàn GYUSACHI (desktop):',
      'Cơ sở: ' + fieldValue(form, 'branch'),
      'Số khách: ' + fieldValue(form, 'guests'),
      'Ngày: ' + fieldValue(form, 'date'),
      'Giờ: ' + fieldValue(form, 'time')
    ].join('\n');
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  var StitchBooking = {
    submitMobile: function submitMobile() {
      if (!SMEUP) {
        return;
      }
      var nameEl = document.getElementById('custName');
      var phoneEl = document.getElementById('custPhone');
      var branchEl = document.getElementById('branchInput');
      var guestsEl = document.getElementById('guestsInput');
      var timeEl = document.getElementById('timeSlotInput');
      var submitBtn = document.getElementById('submitBtn');
      var toast = document.getElementById('bookingSuccessToast');
      var detail = document.getElementById('successDetail');

      var name = nameEl ? String(nameEl.value || '').trim() : '';
      var phone = phoneEl ? String(phoneEl.value || '').trim() : '';
      if (!name || !phone) {
        if (toast && detail) {
          detail.textContent = 'Vui lòng nhập họ tên và số điện thoại.';
          toast.classList.remove('hidden');
        }
        return;
      }

      var message = [
        'Yêu cầu đặt bàn GYUSACHI (mobile):',
        'Cơ sở: ' + (branchEl ? branchEl.value : ''),
        'Số khách: ' + (guestsEl ? guestsEl.value : ''),
        'Giờ: ' + (timeEl ? timeEl.value : '')
      ].join('\n');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> ĐANG GỬI...';
      }

      SMEUP.submitLead('contact_form', {
        name: name,
        phone: phone,
        email: '',
        message: message,
        subject: SMEUP.label('form_contact_subject') + (SMEUP.config.businessName ? ' – ' + SMEUP.config.businessName : '')
      })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
              '<span class="material-symbols-outlined text-[20px]">check_circle</span> ĐÃ GIỮ CHỖ THÀNH CÔNG';
            submitBtn.classList.remove('bg-crimson-enso', 'hover:bg-crimson-glow');
            submitBtn.classList.add('bg-surface-container-high', 'text-flame-amber');
          }
          if (toast && detail) {
            detail.innerHTML =
              'Kính chào <b>' +
              name +
              '</b>, GYUSACHI đã nhận yêu cầu đặt bàn. Chúng tôi sẽ liên hệ số <b>' +
              phone +
              '</b> để xác nhận.';
            toast.classList.remove('hidden');
            toast.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          SMEUP.track('contact_form_submitted', { form: 'mobile_booking' });
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
              '<span class="material-symbols-outlined text-[20px]">check_circle</span> XÁC NHẬN ĐẶT BÀN';
          }
          if (toast && detail) {
            detail.textContent = SMEUP.label('form_error');
            toast.classList.remove('hidden');
          }
        });
    }
  };

  window.StitchBooking = StitchBooking;
  window.handleBookingSubmit = StitchBooking.submitMobile;

  if (!SMEUP) {
    return;
  }

  var desktopForm = document.querySelector('form[data-stitch-booking="desktop"]');
  var leadDialog = document.getElementById('stitch-booking-dialog');
  var leadForm = document.getElementById('stitch-booking-lead-form');

  if (desktopForm && leadDialog && leadForm && SMEUP.bindForm) {
    desktopForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var messageField = leadForm.elements.namedItem('message');
      if (messageField) {
        messageField.value = composeDesktopMessage(desktopForm);
      }
      openDialog(leadDialog);
      var nameInput = leadForm.elements.namedItem('name');
      if (nameInput && nameInput.focus) {
        nameInput.focus();
      }
    });

    leadForm.setAttribute('data-smeup-form', 'contact_form');
    SMEUP.bindForm(leadForm, {
      onSuccess: function () {
        closeDialog(leadDialog);
        desktopForm.reset();
        SMEUP.track('contact_form_submitted', { form: 'desktop_booking' });
      }
    });

    Array.prototype.forEach.call(leadDialog.querySelectorAll('[data-dialog-close]'), function (button) {
      button.addEventListener('click', function () {
        closeDialog(leadDialog);
      });
    });
  }
})(window, document);
