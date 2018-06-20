// Notifications
var notifications = [
      
      'Find a beautiful piece of art...fall in love...admire it...and realize that that was created by human beings just like you, no more human, no less.', 
      
      'When one has reached maturity...one will have a formless form. It is like ice dissolving into water. When one has no form, one can be all forms; when one has no style, he can fit in with any style.',
      
      'Keep away from people who try to belittle your ambitions. Small people always do that, but the really great make you feel that you, too, can become great.',
      
      'You will do foolish things, but do them with enthusiasm.',
      
      'Don’t try to be original. Be simple. Be good technically, and if there is something in you, it will come out.'
      
      ];

var currentIndex = notifications.length, 
                       randomIndex, 
                       temporaryValue;

    while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = notifications[currentIndex];
    notifications[currentIndex] = notifications[randomIndex];
    notifications[randomIndex] = temporaryValue;
  
  };

module.exports = { notifications };