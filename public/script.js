// | + ~((\☼.☼/))~ + |

// Morning TimePicker
$(document).ready(function(){
    $('.timepicker-morning').pickatime({
    min: [5,30],
  	max: [12,0],
    default: null,
    twelvehour: true, // Change to 12 hour AM/PM clock from 24 hour.
    donetext: 'OK',
    autoclose: false,
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

 $(document).ready(function(){
    $('.modal').modal();
  });