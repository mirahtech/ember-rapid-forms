import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { Promise as EmberPromise } from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('em-form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  const somePerson = EmberObject.create({
    name: 'my-name',
    errors: EmberObject.create(),
    validate() {
      const promise = new EmberPromise((resolve) => {
        resolve('ok!');
      });
      return promise;
    }
  });

  test('form model is set', async function(assert) {
    this.set('model', somePerson);

    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);
    assert.dom('input').hasValue('my-name', 'Model was set.');
  });

  test('a form display errors when rendered if showErrorsOnRender is set', async function(assert) {
    assert.expect(1);

    somePerson.set('isValid', false);
    somePerson.set('errors.name', A(['name!']));

    this.set('model', somePerson);

    await render(
      hbs `{{#em-form model=model showErrorsOnRender=true as |form|}}{{form.input property="name"}}{{/em-form}}`
    );

    run(() => {
      assert.ok(find('div:contains("name!")').length, "Found help text on form");
    });
  });

  test('a form display errors when field is focused in', async function(assert) {
    assert.expect(2);

    somePerson.set('isValid', false);
    somePerson.set('errors.name', A(['name!']));

    this.set('model', somePerson);

    await render(
      hbs `{{#em-form model=model showErrorsOnFocusIn=true as |form|}}{{form.input property="name"}}{{/em-form}}`
    );

    assert.equal(find('div:contains("name!")').length, 0, "Found no help text on form before focusin");

    find('input').focusin();
    assert.ok(find('div:contains("name!")').length, "Found help text on form");

  });

  test('a form display errors when field is focused out', async function(assert) {
    assert.expect(2);

    somePerson.set('isValid', false);
    somePerson.set('errors.name', A(['name!']));

    this.set('model', somePerson);

    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    assert.equal(find('div:contains("name!")').length, 0, "Found help text on form before focusout");
    find('input').focusout();

    assert.ok(find('div:contains("name!")').length, "Found help text on form");

  });

  test('a form display errors on key up events when field has showOnKeyUp is set', async function(assert) {
    assert.expect(2);

    this.set('model', somePerson);

    somePerson.set('isValid', false);
    somePerson.set('errors.name', A(['name!']));


    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name" showOnKeyUp=true}}{{/em-form}}`);

    assert.equal(find('div:contains("name!")').length, 0, "Found no help text on form before keyup");

    find('input').keyup();
    assert.ok(find('div:contains("name!")').length, "Found help text on form");

  });

  test('a form display errors when form is submitted and field is invalid', async function(assert) {
    assert.expect(2);

    somePerson.set('isValid', false);
    somePerson.set('errors.name', A(['name!']));
    this.set('model', somePerson);

    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    assert.equal(find('div:contains("name!")').length, 0, "Found help text on form before submit");

    run(() => {
      find('button').click();
    });

    assert.ok(find('div:contains("name!")').length, "Found help text on form");
  });

  test('a form update inputs on model change', async function(assert) {
    this.set('model', somePerson);

    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    let input = find('input');
    let inputAll = findAll('input');
    assert.equal(inputAll.length, 1, "Found input");
    input = this.$(input);
    assert.equal(input.value, 'my-name', "Input has original model value");

    run(() => {
      somePerson.set('name', 'joseph');
    });

    assert.equal(input.value, 'joseph', "Input has new model value");

    run(() => {
      somePerson.set('name', 'my-name');
    });

    assert.equal(input.value, 'my-name', "Input has original model value again");

  });

  test('a form changes its model and fields are updated', async function(assert) {
    const modelA = EmberObject.create({
      name: 'model-a',
      errors: EmberObject.create(),
      validate() {
        const promise = new EmberPromise((resolve) => {
          resolve('ok!');
        });
        return promise;
      }
    });

    const modelB = EmberObject.create({
      name: 'model-b',
      errors: EmberObject.create(),
      validate() {
        const promise = new EmberPromise((resolve) => {
          resolve('ok!');
        });
        return promise;
      }
    });

    this.set('model', modelA);

    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    let input = find('input');
    let inputAll = findAll('input');
    assert.equal(inputAll.length, 1, "Found input");
    assert.equal(input.value, 'model-a', "Input has original model value");

    run(() => {
      this.set('model', modelB);
    });

    assert.equal(input.value, 'model-b', "Input has new model value");

  });

  test('a form changes its model and errors are reseted', async function(assert) {
    const modelA = EmberObject.create({
      name: 'model-a',
      errors: EmberObject.create(),
      validate() {
        const promise = new EmberPromise((resolve) => {
          resolve('ok!');
        });
        return promise;
      }
    });

    run(() => {
      modelA.set('isValid', false);
      modelA.set('errors.name', A(['name!']));
    });

    const modelB = EmberObject.create({
      name: 'model-b',
      errors: EmberObject.create(),
      validate() {
        const promise = new EmberPromise((resolve) => {
          resolve('ok!');
        });
        return promise;
      }
    });

    this.set('model', modelA);

    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    let input = find('input');
    let inputAll = findAll('input');
    assert.equal(inputAll.length, 1, "Found input");
    assert.equal(input.value, 'model-a', "Input has original model value");

    run(() => {
      find('input').focusout();
    });

    run(() => {
      assert.ok(find('div:contains("name!")').length, "Found help text on form");
    });

    run(() => {
      this.set('model', modelB);
    });

    // jQuery hasClass
    assert.ok(!input.parentElement.hasClass('has-success'), "Input is not marked as valid");
    assert.equal(input.value, 'model-b', "Input has new model value");

  });

  test('form cannot be submitted if model is invalid', async function(assert) {
    assert.expect(0);

    this.actions.submit = function() {
      assert.ok(true, 'submit action invoked!');
    };
    this.set('model', somePerson);
    somePerson.set('isValid', false);
    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    run(() => {
      click('button');
    });
  });

  test('form can be submitted if model is valid', async function(assert) {
    assert.expect(1);

    this.actions.submit = function() {
      assert.ok(true, 'submit action invoked!');
    };
    this.set('model', somePerson);
    somePerson.set('isValid', true);
    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    run(() => {
      click('button');
    });
  });

  test('model in an argument of the form submission', async function(assert) {
    assert.expect(1);

    this.actions.submit = function(model) {
      model.set('name', 'other-name');
    };

    this.set('model', somePerson);
    somePerson.set('isValid', true);
    await render(hbs `{{#em-form model=model as |form|}}{{form.input property="name"}}{{/em-form}}`);

    run(() => {
      click('button');
    });

    run(() => {
      assert.equal(somePerson.get('name'), 'other-name', 'Model is an argument of the form submission');
    });
  });

  test('form submission with custom action', async function(assert) {
    assert.expect(1);

    this.actions.submitNow = function() {
      assert.ok(true, 'submitNow action invoked!');
    };
    this.set('model', somePerson);
    somePerson.set('isValid', true);
    await render(
      hbs `{{#em-form model=model action="submitNow" as |form|}}{{form.input property="name"}}{{/em-form}}`
    );

    run(() => {
      click('button');
    });
  });

  test('form submission with a model that has no validation support and no isValid property should be submitted', async function(assert) {
    assert.expect(1);

    this.actions.submit = function() {
      assert.ok(true, 'submit action invoked!');
    };
    this.set('model', {});

    await render(hbs `{{#em-form model=model action='submit' as |form|}}{{form.input property="name"}}{{/em-form}}`);

    run(() => {
      click('button');
    });
  });
});
