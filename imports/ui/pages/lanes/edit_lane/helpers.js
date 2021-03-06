import { Template } from 'meteor/templating';
import { Lanes } from '../../../../api/lanes';
import { Session } from 'meteor/session';
import { Users } from '../../../../api/users';
import { Harbors } from '../../../../api/harbors';
import { Shipments } from '../../../../api/shipments';
import { moment } from 'meteor/momentjs:moment';

//TODO: expose this
let AMOUNT_SHOWN = 20;

Template.edit_lane.onCreated(function () {
  if (! Session.get('lane')) {
    let name = FlowRouter.getParam('name');
    let lane = Lanes.findOne({ name: name });

    return Session.set('lane', lane);
  }
})

Template.edit_lane.helpers({
  lane_name (current_name) {
    var name = FlowRouter.getParam('name');
    var lane = Lanes.findOne({ name: name }) ||
      Session.get('lane') ||
      {}
    ;

    lane.name = lane.name || 'New';

    Session.set('lane', lane);

    return lane.name == 'New' ? '' : lane.name;
  },

  followup_lane () {
    let name = FlowRouter.getParam('name');
    let lane = Lanes.findOne({ name: name });
    let followup_lane = Lanes.findOne(lane.followup);

    if (followup_lane) return followup_lane.name;

    return '';
  },

  lanes () {
    return Lanes.find()
  },

  lane (sort_order) {
    var name = FlowRouter.getParam('name');
    var lane = Lanes.findOne({ name: name });
    let has_shipments = lane && lane.shipments && lane.shipments.length ?
      true :
      false
    ;
    var START_INDEX = 0;
    var END_INDEX = AMOUNT_SHOWN - 1;

    if (sort_order == 'history' && has_shipments) {
      let dates = lane.shipments;
      let relevant_dates = dates.reverse().slice(START_INDEX, END_INDEX);

      relevant_dates = Shipments.find({ _id: { $in: relevant_dates } });

      return relevant_dates.fetch().reverse();

    } else if (sort_order) return [];

    return lane;
  },

  shipping_log_amount_shown () {
    return AMOUNT_SHOWN;
  },

  validate_done () {
    if (! Session.get('lane') || ! Session.get('lane').minimum_complete) {
      return true;
    }

    return false;
  },

  no_followup () {
    let name = FlowRouter.getParam('name');
    let lane = Lanes.findOne({ name: name });

    if (
      Lanes.find().fetch().length < 2 ||
      (lane && lane.followup) ||
      Session.get('choose_followup')
    ) return true;

    return false;
  },

  no_salvage () {
    let name = FlowRouter.getParam('name');
    let lane = Lanes.findOne({ name: name });

    if (
      Lanes.find().fetch().length < 2 ||
      (lane && lane.salvage_plan) ||
      Session.get('choose_salvage_plan')
    ) return true;

    return false;
  },

  choose_followup () {
    let lane = Lanes.findOne({ name: FlowRouter.getParam('name') });

    if (! lane) return false;

    return Session.get('choose_followup') || lane.followup;
  },

  choose_salvage_plan () {
    let lane = Lanes.findOne({ name: FlowRouter.getParam('name') });

    if (! lane) return false;

    return Session.get('choose_salvage_plan') || lane.salvage_plan;
  },

  chosen_followup () {
    let lane = Lanes.findOne({ name: FlowRouter.getParam('name') });

    return this._id == lane.followup;
  },

  chosen_salvage_plan () {
    let lane = Lanes.findOne({ name: FlowRouter.getParam('name') });

    return this._id == lane.salvage_plan;
  },

  captain_list () {
    var users = Users.find().fetch();

    return users;
  },

  can_ply () {
    var lane = Session.get('lane') || {};

    if (this.harbormaster) { return true; }

    if (lane.captains && lane.captains.length) {
      let user = this._id;

      return _.find(lane.captains, function (captain) {
        return user == captain;
      }) ?
        true :
        false
      ;
    }

    return false;
  },

  plying () {
    var lane = Session.get('lane');
    var user = Users.findOne(Meteor.user().emails[0].address);

    if (user && user.harbormaster) { return true; }

    if (lane.captains && lane.captains.length) {
      let captain = _.find(lane.captains, function (email) {
        return email == Meteor.user().emails[0].address;
      });

      return captain ? true : false;
    }

    return false;
  },

  can_set_ply () {
    var user = Users.findOne(Meteor.user().emails[0].address);

    if (this.harbormaster) { return true; }

    if (user) { return ! user.harbormaster; }

    return false;
  },

  pretty_date (date) {
    return new Date(date).toLocaleString();
  },

  duration () {
    return moment.duration(this.finished - this.actual).humanize();
  },

  harbors () {
    let harbors = Harbors.find().fetch();

    return harbors;
  },

  choose_type () {
    return Session.get('choose_type');
  },

  current_lane () {
    let name = FlowRouter.getParam('name');
    let lane = Session.get('lane') || Lanes.findOne({ name: name });

    return lane;
  },

  lane_type () {
    let name = FlowRouter.getParam('name');
    let lane = Session.get('lane') || Lanes.findOne({ name: name });

    return lane.type;
  },

  render_harbor () {
    let name = FlowRouter.getParam('name');
    let lane = Session.get('lane') || Lanes.findOne({ name: name });

    let harbor = Harbors.findOne(lane.type) || {};
    let harbor_lane_reference = harbor.lanes ? harbor.lanes[lane._id] : false;
    let manifest = harbor_lane_reference ?
      harbor_lane_reference.manifest :
      false
    ;

    if (manifest) {
      Meteor.call(
        'Harbors#render_input',
        lane,
        manifest,
        function (err, lane) {
          if (err) throw err;

          Session.set('lane', lane);
      });
    }

    if (lane.rendered_input) return lane.rendered_input;

    return harbor.rendered_input;
  }

});

