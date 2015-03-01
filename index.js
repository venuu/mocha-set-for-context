/**
 * Set object values for a context.
 *
 * Old object values are reset after the current testing context has finished.
 *
 * If you pass in a function, it is called to fetch arguments in before block.
 *
 * @param object {Object | Array}  The object or array that should have its values changed
 * @param [newValuesOrCb] {(Object | Array) | Function => (Object | Array)}
 *                        New values for the object.
 */
var setForContext = function (object, newValuesOrCb) {
  var oldObject;
  var assertArguments = function () {
    if (typeof object !== 'object') {
      throw new Error('Invariant error: First argument for setForContext ' +
        'must be an object or an array, you gave ' + JSON.stringify(object));
    }
  };
  before(function () {
    var newValues, i;
    assertArguments();
    if (typeof newValuesOrCb === 'function') {
      newValues = newValuesOrCb();
    }
    else {
      newValues = newValuesOrCb;
    }
    if (Array.isArray(object)) {
      oldObject = object.slice(0);
      object.length = 0;
      for (i = 0; i < newValues.length; i++) {
        object[i] = newValues[i];
      }
    }
    else {
      oldObject = Object.assign({}, object);
      Object.assign(object, newValues);
    }
  });
  after(function () {
    var i;
    assertArguments();
    if (Array.isArray(oldObject)) {
      object.length = 0;
      for (i = 0; i < oldObject.length; i++) {
        object[i] = oldObject[i];
      }
    }
    else {
      Object.keys(object).forEach(function (key) { delete object[key]; });
      Object.assign(object, oldObject);
    }
  });
};

module.exports = setForContext;
