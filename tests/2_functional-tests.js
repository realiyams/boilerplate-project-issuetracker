const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let id = ''
let id2 = ''

suite('Functional Tests', function() {
  suite('Post request to /api/issues/{project}', () => {
    test('Create an issue with every field', done => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'example title',
          issue_text: 'example text',
          created_by: 'Functional Test - every field',
          assigned_to: 'Mocha and Chai',
          status_text: 'In QA'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'example title')
          assert.equal(res.body.issue_text, 'example text')
          assert.equal(res.body.created_by, 'Functional Test - every field')
          assert.equal(res.body.assigned_to, 'Mocha and Chai')
          assert.equal(res.body.status_text, 'In QA')
          assert.equal(res.body.project, 'test')
          id = res.body._id
          // console.log("id has been set as " + id)
          done()
        })
    })

    test('Create an issue with only required fields', done => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'required title',
          issue_text: 'required text',
          created_by: 'Functional Test - required field'
        })
        .end((err, res) => {
          assert.equal(res.body.issue_title, 'required title')
          assert.equal(res.body.issue_text, 'required text')
          assert.equal(res.body.created_by, 'Functional Test - required field')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          assert.equal(res.body.project, 'test')
          id2 = res.body._id
          // console.log("id 2 has been set as " + id2)
          done()
        })
    })

    test('Create an issue with missing required fields', done => {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'missing title'
        })
        .end((err, res) => {
          assert.equal(res.body.error, 'required field(s) missing')
          done()
        })
    })
  })

  suite('GET request to /api/issues/{project}', () => {
    test('View issues on a project', done => {
      chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end((err, res) => {
          assert.isArray(res.body)
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "_id");
          done()
        })
    })

    test('View issues on a project with one filters', done => {
      chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: 'example title'
        })
        .end((err, res) => {
            res.body.forEach(result => {
              assert.equal(result.issue_title, 'example title')
            })
          done()
        })
    })

    test('View issues on a project with multiple filter', done => {
      chai.request(server)
        .get('/api/issues/test')
        .query({
          issue_title: 'required title',
          issue_text: 'required text',
          created_by: 'Functional Test - required field'
        })
        .end((err, res) => {
            res.body.forEach(result => {
              assert.equal(result.issue_title, 'required title')
              assert.equal(result.issue_text, 'required text')
              assert.equal(result.created_by, 'Functional Test - required field')
            })
          done()
        })
    })
  })

  suite('PUT request to /api/issues/{project}', () => {
    test('Update one field on an issue', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id,
          issue_title: 'new example title'
        })
        .end((err, res) => {
          assert.equal(res.body.result, 'successfully updated')
          assert.equal(res.body._id, id)
          done()
        })
    })

    test('Update multiple fields on an issue', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id2,
          issue_title: 'new required title',
          issue_text: 'new required text'
        })
        .end((err, res) => {
          assert.equal(res.body.result, 'successfully updated')
          assert.equal(res.body._id, id2)
          done()
        })
    })

    test('Update an issue with missing _id', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          issue_title: 'new missing title'
        })
        .end((err, res) => {
          assert.equal(res.body.error, 'missing _id')
          done()
        })
    })

    test('Update an issue with no fields to update', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id,
        })
        .end((err, res) => {
          assert.equal(res.body.error, 'no update field(s) sent')
          assert.equal(res.body._id, id)
          done()
        })
    })

    test('Update an issue with an invalid _id', done => {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: 'something wrong',
          issue_title: 'invalid title',
          issue_text: 'invalid text',
        })
        .end((err, res) => {
          assert.equal(res.body.error, 'could not update')
          assert.equal(res.body._id, 'something wrong')
          done()
        })
    })
  })

  suite('DELETE request to /api/issues/{project}', () => {
    test('Delete an issue', done => {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: id
        })
        .end((err, res) => {
          assert.equal(res.body.result, 'successfully deleted')
          assert.equal(res.body._id, id)
          done()
        })
    })

    test('Delete an issue with an invalid _id', done => {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: 'invalid id'
        })
        .end((err, res) => {
          assert.equal(res.body.error, 'could not delete')
          assert.equal(res.body._id, 'invalid id')
          done()
        })
    })

    test('Delete an issue with missing _id', done => {
      chai.request(server)
        .delete('/api/issues/test')
        .send({

        })
        .end((err, res) => {
          assert.equal(res.body.error, 'missing _id')
          done()
        })
    })
  })
});
