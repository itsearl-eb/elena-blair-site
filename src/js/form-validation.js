// Telling somebody which field is missing, and what to put in it
// (§131 item 10).
//
// **Every form here said "Some answers are missing — they are marked above"
// and then marked them with a colour.** On a form with thirty questions and
// a phone screen, that is a scavenger hunt: you scroll, you look for red, and
// the one you missed is the one below the fold. Three changes, and they are
// all about the same thing — putting the answer where the question is.
//
//   1. **A specific message, in the field, between the label and the input.**
//      Not "required" and not a red outline: "Enter your date of birth", so
//      the sentence you read is the instruction you follow.
//   2. **A thicker burgundy underline**, so the field is findable by eye
//      once you know roughly where it is. Colour alone is not a signal
//      everybody can see; the weight change is what makes it one.
//   3. **A summary at the top when two or more are missing**, each one a
//      link straight to its field. One missing field needs no index; a list
//      of seven does, and scrolling back up to find out how many are left is
//      the thing that makes people give up.
//
// Messages clear as fields are filled, on `input` — not on submit. Being told
// again, after fixing it, that something you have just fixed is missing is
// how a form stops being believed.
;(function () {
  var MSG_CLASS = 'eb-field-msg'
  var SUMMARY_ID = 'eb-validation-summary'

  function fieldOf(el) {
    return el.closest('.field') || el.parentElement
  }

  function labelOf(field) {
    return field.querySelector('label.field-label, .field-label')
  }

  function clearOne(el) {
    var field = fieldOf(el)
    if (!field) return
    field.classList.remove('field-error')
    var msg = field.querySelector('.' + MSG_CLASS)
    if (msg) msg.remove()
  }

  function clearAll(form) {
    form.querySelectorAll('.' + MSG_CLASS).forEach(function (m) { m.remove() })
    form.querySelectorAll('.field-error').forEach(function (f) { f.classList.remove('field-error') })
    var summary = form.querySelector('#' + SUMMARY_ID)
    if (summary) summary.remove()
  }

  function markOne(el, message) {
    var field = fieldOf(el)
    if (!field) return
    field.classList.add('field-error')
    if (field.querySelector('.' + MSG_CLASS)) return
    var p = document.createElement('p')
    p.className = MSG_CLASS
    p.textContent = message
    var label = labelOf(field)
    // Between the label and the input — which is the whole point. Appended
    // at the end it sits under a textarea three rows tall, far enough from
    // the question to read as a note about the next one.
    if (label && label.nextSibling) field.insertBefore(p, label.nextSibling)
    else field.insertBefore(p, field.firstChild)
  }

  // **Only ask this of a real input.** Anything without a `value` — a
  // wrapper div, a fieldset — reads as empty here and always will, which is
  // why a rule anchored on a wrapper must carry an `invalid` and is then
  // judged by that alone. Checkboxes and radios return false because
  // "ticked" is not "has a value"; those are `invalid` or `radioName`.
  function isEmpty(el) {
    if (!el) return false
    if (el.type === 'checkbox' || el.type === 'radio') return false
    return !String(el.value || '').trim()
  }

  // `rules` — [{ el | els | name, message, anchorId }]. `els` covers a group
  // that is one question in several boxes (a date of birth), where one
  // message belongs to the set rather than to each part.
  function validate(form, rules) {
    clearAll(form)
    var missing = []

    rules.forEach(function (rule) {
      // A field inside a hidden block is not a field on this path. Checked
      // at validation time rather than by a `required` attribute, which
      // would fire inside a branch nobody is on.
      var els = rule.els || (rule.el ? [rule.el] : [])
      els = els.filter(function (e) { return e && !e.closest('.hidden') })
      if (!els.length) return

      // **Three tests, and exactly one of them runs.** An earlier version
      // ran `isEmpty` first and consulted `invalid` only if that passed,
      // which broke every rule that has an `invalid`: those rules anchor on
      // a WRAPPER — the `.field` div around a checkbox group — because the
      // message belongs to the question, not to one of six boxes. A div has
      // no `value`, so `isEmpty` is unconditionally true for it, `bad` was
      // already set, and `invalid()` was never called. The commission form
      // could not be submitted with every box on the page ticked.
      //
      // A rule that brings its own predicate is SAYING that emptiness is
      // not the test. So `invalid` wins outright rather than being consulted
      // second.
      var bad
      if (rule.invalid) {
        bad = rule.invalid()
      } else if (rule.radioName) {
        bad = !form.querySelector('input[name="' + rule.radioName + '"]:checked')
      } else {
        bad = els.some(isEmpty)
      }
      if (!bad) return

      markOne(els[0], rule.message)
      missing.push({ el: els[0], message: rule.message })
    })

    if (missing.length > 1) {
      var box = document.createElement('div')
      box.id = SUMMARY_ID
      box.setAttribute('role', 'alert')
      box.className = 'eb-validation-summary'
      var head = document.createElement('p')
      head.textContent =
        missing.length + ' answers are missing. Each one links to its question:'
      box.appendChild(head)
      var list = document.createElement('ul')
      missing.forEach(function (m) {
        var li = document.createElement('li')
        var a = document.createElement('a')
        a.href = '#'
        a.textContent = m.message
        a.addEventListener('click', function (e) {
          e.preventDefault()
          m.el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          if (m.el.focus) m.el.focus({ preventScroll: true })
        })
        li.appendChild(a)
        list.appendChild(li)
      })
      box.appendChild(list)
      form.insertBefore(box, form.firstChild)
      box.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (missing.length === 1) {
      missing[0].el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return missing.length === 0
  }

  // Clears a field's message the moment it is filled. Bound once per form,
  // on the form itself, so fields added later by branching are covered
  // without anybody remembering to bind them.
  function watch(form) {
    if (form.dataset.ebWatching) return
    form.dataset.ebWatching = '1'
    var handler = function (e) {
      var el = e.target
      if (!el || !el.closest) return
      if (isEmpty(el)) return
      clearOne(el)
      // The summary is about the whole form, so it goes as soon as it is
      // out of date rather than sitting there listing something you fixed.
      var summary = form.querySelector('#' + SUMMARY_ID)
      if (summary) summary.remove()
    }
    form.addEventListener('input', handler)
    form.addEventListener('change', handler)
  }

  window.EBValidate = { validate: validate, watch: watch, clearAll: clearAll }
})()
