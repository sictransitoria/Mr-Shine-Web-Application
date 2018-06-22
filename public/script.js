// | + ~((\☼.☼/))~ + |

// Morning TimePicker
$(document).ready(function(){
    $('.timepicker-morning').pickatime({
    default: 'now',
    showClearBtn: false,
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    autoclose: false,
    ampmclickable: true,
    vibrate: true, // Vibrate the device when dragging clock hand.
  })
});

// Afternoon TimePicker
$(document).ready(function(){
    $('.timepicker-afternoon').pickatime({
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
    vibrate: true // Vibrate the device when dragging clock hand.
  })
});

// Evening TimePicker
$(document).ready(function(){
    $('.timepicker-evening').pickatime({
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
    vibrate: true // Vibrate the device when dragging clock hand.
  })
});

// Late-Night TimePicker
$(document).ready(function(){
    $('.timepicker-late-night').pickatime({
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
    vibrate: true // Vibrate the device when dragging clock hand.
  })
});

// Modal Script
 $(document).ready(function(){
    $('.modal').modal();
  });