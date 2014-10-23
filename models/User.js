/**
 * User
 * ====
 *
 * Small extension class to allow null users with data
 */

var _$ = this;

+function () {
  "use strict";

  _$.User = function () {

  }

  _$.User.Nil = new User ( {} )
}();