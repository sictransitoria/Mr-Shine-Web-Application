// | + ~((\☼.☼/))~ + |

// Morning TimePicker
$(document).ready(function(){
    $('.timepicker-morning').pickatime({
    minTime: '11:45am', // 11:45:00 AM
    maxTime: '6:00pm', // 6:00:00 PM
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
    ampmclickable: true,
    vibrate: true, // Vibrate the device when dragging clock hand.
  })
});

// Afternoon TimePicker
$(document).ready(function(){
    $('.timepicker-afternoon').pickatime({
    default: null,
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
    vibrate: true // Vibrate the device when dragging clock hand.
  })
});

// Evening TimePicker
$(document).ready(function(){
    $('.timepicker-evening').pickatime({
    default: null,
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
    vibrate: true // Vibrate the device when dragging clock hand.
  })
});

// Late-Night TimePicker
$(document).ready(function(){
    $('.timepicker-late-night').pickatime({
    default: null,
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