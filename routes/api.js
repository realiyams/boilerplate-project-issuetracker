const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Model = mongoose.model
'use strict';

module.exports = function (app) {

  const connect = mongoose.connect('mongodb+srv://sampleAdmin:' + process.env.PASSWORD + '@cluster0.8dqclut.mongodb.net/test', {useNewUrlParser: true, useUnifiedTopology: true})

  const issueSchema = new Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by: {type: String, required: true},
    assigned_to: String,
    status_text: String,
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    open: {type: Boolean, required: true, default: true},
    project: String
  })
  const issue = Model('Issue', issueSchema)

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filter = Object.assign(req.query)
      filter['project'] = project

      issue.find(filter, (err, data) => {
          if (!err && data)
            return res.json(data)
        } 
      )
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if (
        !req.body.issue_title || 
        !req.body.issue_text || 
        !req.body.created_by
      ) return res.json({ error: 'required field(s) missing' })
      
      const newIssue = new issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
        project: project
      })

      newIssue.save((err, data) => {
        if (!err && data) 
          res.json(data)
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let update = {}

      if (!req.body._id)
        return res.json({error: 'missing _id'})

      if (Object.keys(req.body).length < 2) 
        return res.json({error: 'no update field(s) sent', '_id': req.body._id})
      
      Object.keys(req.body).forEach(key => {
        if (req.body[key] != '')
          update[key] = req.body[key]
      })
      update['updated_on'] = new Date()

      issue.findByIdAndUpdate(
        req.body._id,
        update,
        {new: true},
        (err, data) => {
          if (!err && data)
            return res.json({result: 'successfully updated', '_id': req.body._id})
            
          return res.json({error: 'could not update', '_id': req.body._id}) 
        }
      )
    })
    
    .delete(function (req, res){
      let project = req.params.project;

      if (!req.body._id)
        return res.json({error: 'missing _id'})

      issue.findByIdAndRemove(
        req.body._id,
        (err, data) => {
          if (!err && data)
            res.json({result: 'successfully deleted', '_id': req.body._id})
          else if (!data)
            res.json({ error: 'could not delete', '_id': req.body._id })
        }
      )
    });
    
};
