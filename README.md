# setForContext helper for [Mocha][]

Set object values for a context.

## Install

```
npm install mocha-set-for-context
```

You probably should also save it as a development dependency to your `package.json`

```
npm install --save-dev mocha-set-for-context
```

## Usage

Use it in the body of a `describe` block to set values for an object or an array defined higher up in the tests to certain values.

```js
var setForContext = require('mocha-set-for-context');

describe('My Tests', function () {
  var myObject = {foo: null};
  beforeEach(function () {
    console.log('Value of myObject.foo is ' + myObject.foo);
  });

  it('defaults foo to null', function () {
    if (myObject.foo !== null) throw new Error('foo was not null');
  });

  describe('when foo is bar', function () {
    setForContext(myObject, { foo: 'bar' });

    it('sets foo to bar', function () {
      if (myObject.foo !== 'bar') throw new Error('foo was not bar');
    });

    describe('and foobar is set to quz', function () {
      setForContext(myObject, { foobar: 'quz' });

      it('keeps foo as bar and sets foobar to quz', function () {
        if (myObject.foo !== 'bar') throw new Error('foo was not bar');
        if (myObject.foobar !== 'quz') throw new Error('foobar was not quz');
      });
    });
  });
});
```

If you need the values of the object to be calculated when the actual tests are ran, pass a function to the second parameter returning the values to be set. This is useful for setting Date values or using a value which is only available at the time when Mocha runs the actual `describe` block.

```js
var myObject = { now: 0 };
describe('lazy evaluation', function () {
  setForContext(myObject, function () { return { now: Date.now() }});
  var testLoadedAt = Date.now();

  it('works', function () {
    if (testLoadedAt >= myObject.now) throw new Error("Oops.");
  });
});

setTimeout(mocha.run, 1000):
```


```js
var myObject = { ref: null };
var someRef = null;

function setSomeRef() { someRef = 'Hello' };

describe('lazy evaluation', function () {
  setForContext(myObject, function () { return { ref: someRef }});
  setSomeRef();

  it('works', function () {
    if (myObject.ref !== someRef) throw new Error("Oops.");
  });
});
```

## Why should I use it?

It might be a bit cumbersome to setup e.g. React component testing with plain Mocha. You might need to create some repetition when you want to test rendering based on different props, such as the one below:

```js
describe('MyComponent', function () {
  describe('when foo is bar', function () {
    var component;
    beforeEach(function () {
      component = React.TestUtils.renderIntoDocument(MyComponent({foo: 'bar'}));
    });
    afterEach(function () {
      React.unmountComponentAtNode(reactElement.getDOMNode().parentNode);
    });

    it('renders Foobar', function () {
      // Will throw if not found
      React.TestUtils.findRenderedComponentWithType(component, Foobar);
    });
  });

  describe('when foo is not bar', function () {
    var component;
    beforeEach(function () {
      component = React.TestUtils.renderIntoDocument(MyComponent({foo: 'quz'}));
    });
    afterEach(function () {
      React.unmountComponentAtNode(reactElement.getDOMNode().parentNode);
    });

    it('does not render Foobar', function () {
      try {
        React.TestUtils.findRenderedComponentWithType(component, Foobar);
        throw new Error("Expected Foobar not to have been rendered but it was.");
      }
      catch () {}
    });
  });
});
```

So you end up duplicating some related test setup functionality. What if you could just define the rendering _once_ and then just focus your tests on the rendered components?

Enter `setForContext`:

```js
var setForContext = require('mocha-set-for-context');

describe('MyComponent', function () {
  var component;
  var props = {};
  beforeEach(function () {
      component = React.TestUtils.renderIntoDocument(MyComponent(props));
    });
    afterEach(function () {
      React.unmountComponentAtNode(component.getDOMNode().parentNode);
    });

  describe('when foo is bar', function () {
    setForContext(props, { foo: 'bar' });

    it('renders Foobar', function () {
      // Will throw if not found
      React.TestUtils.findRenderedComponentWithType(component, Foobar);
    });
  });

  describe('when foo is not bar', function () {
    setForContext(props, { foo: 'quz' });

    it('does not render Foobar', function () {
      try {
        React.TestUtils.findRenderedComponentWithType(component, Foobar);
        throw new Error('Expected Foobar not to have been rendered but it was.');
      }
      catch () {}
    });
  });
});
```


## How it works?

`setForContext` works by setting the object/array values inside a `describe` block and then resetting those values after the `describe` block is finished by using a combination of `before` and `after` hooks in Mocha. As `before` hooks are always ran before `beforeEach`, you can setup object/array values used in a `beforeEach` block with `setForContext`. You don't have to worry about resetting those values as `setForContext` does it automatically for you.

  [Mocha]: http://mochajs.org/
